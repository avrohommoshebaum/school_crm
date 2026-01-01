/**
 * Robocall Controller
 * Handles robocall sending, scheduling, call-to-record, and audio management
 */

import { groupService } from "../db/services/groupService.js";
import { groupMemberService } from "../db/services/groupMemberService.js";
import { robocallService } from "../db/services/robocallService.js";
import {
  sendTextToSpeechRobocall,
  sendAudioRobocall,
  initiateCallToRecord,
} from "../utils/twilioRobocall.js";
import { uploadAudioFile, getSignedUrl } from "../utils/storage/gcsStorage.js";
import { normalizePhone } from "../utils/validation.js";

/**
 * Send robocall to groups and/or manual phone numbers
 */
export const sendRobocall = async (req, res) => {
  try {
    const {
      recordingMethod, // 'text-to-speech', 'call-to-record', 'device-record', 'upload'
      textContent, // For text-to-speech
      audioGcsPath, // For saved/uploaded audio
      audioFile, // Base64 encoded audio file (for device-record or upload)
      groupIds,
      manualPhoneNumbers,
      scheduledFor,
    } = req.body;

    const userId = req.user._id || req.user.id;

    if (!recordingMethod) {
      return res.status(400).json({ message: "Recording method is required" });
    }

    // Validate recording method specific requirements
    if (recordingMethod === "text-to-speech" && !textContent?.trim()) {
      return res.status(400).json({ message: "Text content is required for text-to-speech" });
    }

    if (
      (recordingMethod === "device-record" || recordingMethod === "upload") &&
      !audioGcsPath &&
      !audioFile
    ) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    // Collect phone numbers from groups
    let groupPhoneNumbers = [];
    if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
      for (const groupId of groupIds) {
        const group = await groupService.findById(groupId);
        if (!group) {
          return res.status(404).json({ message: `Group ${groupId} not found` });
        }

        const members = await groupMemberService.findByGroupId(groupId);
        const phones = members
          .flatMap((m) => m.phones || (m.phone ? [m.phone] : []))
          .filter((p) => p && p.trim())
          .map((p) => {
            const normalized = normalizePhone(p);
            return normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
          });

        groupPhoneNumbers.push(...phones);
      }
    }

    // Remove duplicates
    groupPhoneNumbers = [...new Set(groupPhoneNumbers)];

    // Process manual phone numbers
    let manualPhones = [];
    if (manualPhoneNumbers && Array.isArray(manualPhoneNumbers) && manualPhoneNumbers.length > 0) {
      manualPhones = manualPhoneNumbers
        .map((p) => {
          const normalized = normalizePhone(p);
          return normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
        })
        .filter((p) => p && p.length >= 10);
    }

    const allPhoneNumbers = [...new Set([...groupPhoneNumbers, ...manualPhones])];

    if (allPhoneNumbers.length === 0) {
      return res.status(400).json({ message: "No valid phone numbers found" });
    }

    // Handle audio file upload if provided
    let finalAudioGcsPath = audioGcsPath;
    if (audioFile && !audioGcsPath) {
      try {
        // Decode base64 audio file
        const audioBuffer = Buffer.from(audioFile, "base64");
        const fileName = `robocall_${Date.now()}.mp3`;
        const result = await uploadAudioFile(audioBuffer, fileName, "audio/mpeg");
        finalAudioGcsPath = result.gcsPath;
      } catch (error) {
        console.error("Error uploading audio file:", error);
        return res.status(500).json({ message: "Failed to upload audio file" });
      }
    }

    // Determine recipient type
    const recipientType =
      groupPhoneNumbers.length > 0 && manualPhones.length > 0
        ? "mixed"
        : groupPhoneNumbers.length > 0
        ? "group"
        : "manual";

    // If scheduled, create scheduled robocall
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: "Invalid scheduledFor date/time" });
      }

      if (scheduledDate < new Date()) {
        return res.status(400).json({ message: "Scheduled time must be in the future" });
      }

      const scheduledRobocall = await robocallService.createScheduledRobocall({
        recordingMethod,
        textContent: textContent?.trim() || null,
        audioGcsPath: finalAudioGcsPath || null,
        recipientType,
        recipientGroupIds: groupIds || [],
        recipientPhoneNumbers: manualPhones,
        scheduledFor: scheduledDate.toISOString(),
        createdBy: userId,
      });

      return res.json({
        message: "Robocall scheduled successfully",
        scheduledRobocallId: scheduledRobocall.id,
        scheduledFor: scheduledRobocall.scheduled_for,
        recipientsCount: allPhoneNumbers.length,
      });
    }

    // Send robocall immediately
    let successCount = 0;
    let failCount = 0;
    const errors = [];
    const recipientLogs = [];

    // Send individual calls to each phone number for privacy
    const batchSize = 10;
    for (let i = 0; i < allPhoneNumbers.length; i += batchSize) {
      const batch = allPhoneNumbers.slice(i, i + batchSize);

      const batchPromises = batch.map(async (phoneNumber) => {
        try {
          let result;
          if (recordingMethod === "text-to-speech") {
            result = await sendTextToSpeechRobocall(phoneNumber, textContent.trim(), "Nachlas Bais Yaakov", req);
          } else if (recordingMethod === "device-record" || recordingMethod === "upload") {
            // Get signed URL for audio file
            const signedUrl = await getSignedUrl(finalAudioGcsPath, 24); // Valid for 24 hours
            result = await sendAudioRobocall(phoneNumber, signedUrl, "Nachlas Bais Yaakov", req);
          } else {
            throw new Error(`Unsupported recording method: ${recordingMethod}`);
          }

          const callResult = result[0] || result;
          if (callResult.success) {
            successCount++;
            recipientLogs.push({
              robocallMessageId: null, // Will be set after creating message record
              phoneNumber,
              twilioCallSid: callResult.callSid,
              twilioStatus: callResult.status || "queued",
            });
            return { success: true, phoneNumber, callSid: callResult.callSid };
          } else {
            failCount++;
            errors.push({ phoneNumber, error: callResult.error });
            recipientLogs.push({
              robocallMessageId: null,
              phoneNumber,
              twilioStatus: "failed",
              errorMessage: callResult.error,
            });
            return { success: false, phoneNumber, error: callResult.error };
          }
        } catch (error) {
          failCount++;
          const errorMsg = error.message || "Failed to send robocall";
          errors.push({ phoneNumber, error: errorMsg });
          recipientLogs.push({
            robocallMessageId: null,
            phoneNumber,
            twilioStatus: "failed",
            errorMessage: errorMsg,
          });
          return { success: false, phoneNumber, error: errorMsg };
        }
      });

      await Promise.all(batchPromises);

      // Small delay between batches
      if (i + batchSize < allPhoneNumbers.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Create robocall message record
    const robocallMessage = await robocallService.createRobocallMessage({
      recordingMethod,
      textContent: textContent?.trim() || null,
      audioGcsPath: finalAudioGcsPath || null,
      recipientType,
      recipientGroupIds: groupIds || [],
      recipientPhoneNumbers: manualPhones,
      twilioStatus: failCount === 0 ? "completed" : successCount > 0 ? "partial" : "failed",
      totalRecipients: allPhoneNumbers.length,
      successCount,
      failCount,
      sentBy: userId,
    });

    // Update recipient logs with message ID
    recipientLogs.forEach((log) => {
      log.robocallMessageId = robocallMessage.id;
    });

    // Create recipient logs
    if (recipientLogs.length > 0) {
      await robocallService.createBulkRobocallRecipientLogs(recipientLogs);
    }

    // Return response
    if (failCount === 0) {
      res.json({
        message: "Robocall sent successfully",
        recipientsCount: allPhoneNumbers.length,
        successCount,
        robocallMessageId: robocallMessage.id,
      });
    } else if (successCount > 0) {
      res.status(207).json({
        message: `Robocall sent to ${successCount} recipient(s), ${failCount} failed`,
        recipientsCount: allPhoneNumbers.length,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined,
        robocallMessageId: robocallMessage.id,
      });
    } else {
      res.status(500).json({
        message: "Failed to send robocall to all recipients",
        recipientsCount: allPhoneNumbers.length,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined,
        robocallMessageId: robocallMessage.id,
      });
    }
  } catch (error) {
    console.error("Error sending robocall:", error);
    res.status(500).json({
      message: error.message || "Failed to send robocall",
    });
  }
};

/**
 * Initiate call-to-record (calls user to record a message)
 */
export const initiateCallToRecordSession = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const userId = req.user._id || req.user.id;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Normalize phone number
    const normalized = normalizePhone(phoneNumber);
    const formattedPhone =
      normalized.length === 10
        ? `+1${normalized}`
        : normalized.startsWith("+")
        ? normalized
        : `+${normalized}`;

    // Create call-to-record session (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const session = await robocallService.createCallToRecordSession({
      userId,
      phoneNumber: formattedPhone,
      expiresAt,
    });

    // Initiate the call
    const result = await initiateCallToRecord(formattedPhone, session.id, req);

    if (!result.success) {
      await robocallService.updateCallToRecordSession(session.id, {
        status: "failed",
      });
      return res.status(500).json({
        message: "Failed to initiate call",
        error: result.error,
      });
    }

    // Update session with call SID
    await robocallService.updateCallToRecordSession(session.id, {
      twilioCallSid: result.callSid,
      status: "calling",
    });

    res.json({
      message: "Call initiated successfully",
      sessionId: session.id,
      callSid: result.callSid,
    });
  } catch (error) {
    console.error("Error initiating call-to-record:", error);
    res.status(500).json({
      message: error.message || "Failed to initiate call",
    });
  }
};

/**
 * Get call-to-record session status
 */
export const getCallToRecordSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id || req.user.id;

    const session = await robocallService.getCallToRecordSessionById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user_id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Generate signed URL if recording exists
    let signedUrl = null;
    if (session.recording_gcs_path) {
      try {
        signedUrl = await getSignedUrl(session.recording_gcs_path, 24);
      } catch (error) {
        console.error("Error generating signed URL:", error);
      }
    }

    res.json({
      ...session,
      signedUrl,
    });
  } catch (error) {
    console.error("Error getting call-to-record session:", error);
    res.status(500).json({
      message: error.message || "Failed to get session",
    });
  }
};

/**
 * Upload audio file and save as recording
 */
export const uploadAudioRecording = async (req, res) => {
  try {
    const { audioFile, name, description } = req.body;
    const userId = req.user._id || req.user.id;

    if (!audioFile) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Decode base64 audio file
    const audioBuffer = Buffer.from(audioFile, "base64");
    const fileName = `${name.replace(/[^a-zA-Z0-9.-]/g, "_")}_${Date.now()}.mp3`;

    // Upload to GCS
    const result = await uploadAudioFile(audioBuffer, fileName, "audio/mpeg");

    // Save recording metadata
    const recording = await robocallService.createSavedAudioRecording({
      name: name.trim(),
      description: description?.trim() || null,
      audioGcsPath: result.gcsPath,
      fileSizeBytes: audioBuffer.length,
      recordingMethod: "upload",
      createdBy: userId,
    });

    res.json({
      message: "Audio recording saved successfully",
      recording: {
        id: recording.id,
        name: recording.name,
        audioGcsPath: recording.audio_gcs_path,
      },
    });
  } catch (error) {
    console.error("Error uploading audio recording:", error);
    res.status(500).json({
      message: error.message || "Failed to upload audio recording",
    });
  }
};

/**
 * Get saved audio recordings
 */
export const getSavedAudioRecordings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const recordings = await robocallService.getSavedAudioRecordings(userId, limit);

    // Generate signed URLs for each recording
    const recordingsWithUrls = await Promise.all(
      recordings.map(async (recording) => {
        try {
          const signedUrl = await getSignedUrl(recording.audio_gcs_path, 24);
          return {
            ...recording,
            signedUrl,
          };
        } catch (error) {
          console.error(`Error generating signed URL for ${recording.id}:`, error);
          return {
            ...recording,
            signedUrl: null,
          };
        }
      })
    );

    res.json({
      recordings: recordingsWithUrls,
    });
  } catch (error) {
    console.error("Error getting saved audio recordings:", error);
    res.status(500).json({
      message: error.message || "Failed to get saved recordings",
    });
  }
};

