/**
 * Twilio Robocall Utilities
 * Handles robocall functionality: text-to-speech, call-to-record, and playing audio files
 */

import { initializeTwilio } from "./twilio.js";
import crypto from "crypto";

let twilioClient = null;

function getTwilioClient() {
  if (!twilioClient) {
    twilioClient = initializeTwilio();
  }
  return twilioClient;
}

/**
 * Database-backed token store for TwiML endpoint security
 * Each token is unique per call and expires after 1 hour
 * Uses PostgreSQL for Cloud Run multi-instance compatibility
 */

/**
 * Clean up expired tokens periodically (runs every 5 minutes)
 */
let cleanupInterval = null;

async function startTokenCleanup() {
  if (cleanupInterval) {
    return; // Already started
  }

  const { robocallService } = await import("../db/services/robocallService.js");
  
  cleanupInterval = setInterval(async () => {
    try {
      const deletedCount = await robocallService.deleteExpiredTwilioWebhookTokens();
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired Twilio webhook tokens`);
      }
    } catch (error) {
      console.error("Error cleaning up expired tokens:", error);
    }
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}

// Start cleanup on module load
startTokenCleanup();

/**
 * Generate a unique token for a TwiML endpoint call
 * @param {string} callSid - Optional Twilio Call SID
 * @param {string} sessionId - Optional session ID (for call-to-record)
 * @returns {Promise<string>} Unique token
 */
export async function generateUniqueToken(callSid = null, sessionId = null) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

  const { robocallService } = await import("../db/services/robocallService.js");
  await robocallService.createTwilioWebhookToken(token, callSid, sessionId, expiresAt);

  return token;
}

/**
 * Validate a token from Twilio webhook
 * @param {string} token - Token to validate
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
export async function validateTwilioToken(token) {
  if (!token) {
    return false;
  }

  const { robocallService } = await import("../db/services/robocallService.js");
  const tokenData = await robocallService.validateTwilioWebhookToken(token);
  
  return tokenData !== null;
}

/**
 * Get token metadata (for debugging/logging)
 * @param {string} token - Token to get metadata for
 * @returns {Promise<Object|null>} Token data or null if not found
 */
export async function getTokenMetadata(token) {
  if (!token) {
    return null;
  }

  const { robocallService } = await import("../db/services/robocallService.js");
  return await robocallService.validateTwilioWebhookToken(token);
}

/**
 * Get server URL for TwiML endpoints
 * Uses the same base URL logic as API calls
 * 
 * @param {Object} req - Optional Express request object to determine URL from request
 *                       (same way API calls determine their base URL)
 */
function getServerUrl(req = null) {
  // If we have a request object, use it to determine the URL (same as API calls)
  // This works in production where API uses relative paths (/api)
  if (req) {
    const protocol = req.protocol || (req.secure ? 'https' : 'http');
    const host = req.get('host');
    if (host) {
      const url = `${protocol}://${host}`;
      // In production, this will be the Cloud Run URL
      // In local dev, this will be localhost:8080 (but Twilio can't access it)
      return url;
    }
  }
  
  // Prefer SERVER_URL (should be set in production)
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL;
  }
  
  // In production, CLIENT_URL should be the same domain as the server
  // (API uses relative paths, so they share the same base URL)
  if (process.env.CLIENT_URL && process.env.NODE_ENV === "production") {
    return process.env.CLIENT_URL;
  }
  
  // For local development, check for ngrok URL
  if (process.env.NGROK_URL) {
    return process.env.NGROK_URL;
  }
  
  // For local development without ngrok, throw an error
  if (process.env.NODE_ENV !== "production") {
    throw new Error(
      "For local development with Twilio, you need a publicly accessible URL. " +
      "Twilio cannot access localhost URLs. Options:\n" +
      "1. Use ngrok: ngrok http 8080, then set NGROK_URL=https://your-ngrok-url.ngrok.io\n" +
      "2. Deploy to Cloud Run (CLIENT_URL will be used automatically)"
    );
  }
  
  // Last resort: hardcoded production URL (should not be reached if env vars are set correctly)
  return "https://school-app-iuwhs6msyq-uc.a.run.app";
}


/**
 * Send robocall using text-to-speech
 * @param {string|string[]} to - Phone number(s) to call (E.164 format)
 * @param {string} message - Text message to speak
 * @param {string} fromName - Optional name to say before message
 * @param {Object} req - Optional Express request object to determine server URL
 * @returns {Promise<Object>} Result with call SIDs
 */
export async function sendTextToSpeechRobocall(to, message, fromName = "Nachlas Bais Yaakov", req = null) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not initialized");
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error("TWILIO_PHONE_NUMBER not set");
  }

  const phoneNumbers = Array.isArray(to) ? to : [to];
  const serverUrl = getServerUrl(req);
  const results = [];

  for (const phoneNumber of phoneNumbers) {
    try {
      // Generate unique token for this call
      const token = await generateUniqueToken();
      const twimlUrl = `${serverUrl}/api/twilio/robocall-tts?message=${encodeURIComponent(message)}&fromName=${encodeURIComponent(fromName)}&token=${token}`;

      const call = await client.calls.create({
        to: phoneNumber,
        from: from,
        url: twimlUrl,
        method: "GET",
      });

      // Update token with call SID for tracking
      const { robocallService } = await import("../db/services/robocallService.js");
      await robocallService.updateTwilioWebhookTokenCallSid(token, call.sid);

      results.push({
        success: true,
        phoneNumber,
        callSid: call.sid,
        status: call.status,
      });
    } catch (error) {
      results.push({
        success: false,
        phoneNumber,
        error: error.message,
        errorCode: error.code,
      });
    }
  }

  return results;
}

/**
 * Send robocall using audio file (from GCS signed URL)
 * @param {string|string[]} to - Phone number(s) to call (E.164 format)
 * @param {string} audioUrl - Signed URL to audio file in GCS
 * @param {string} fromName - Optional name to say before message
 * @param {Object} req - Optional Express request object to determine server URL
 * @returns {Promise<Object>} Result with call SIDs
 */
export async function sendAudioRobocall(to, audioUrl, fromName = "Nachlas Bais Yaakov", req = null) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not initialized");
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error("TWILIO_PHONE_NUMBER not set");
  }

  const phoneNumbers = Array.isArray(to) ? to : [to];
  const serverUrl = getServerUrl(req);
  const results = [];

  for (const phoneNumber of phoneNumbers) {
    try {
      // Generate unique token for this call
      const token = await generateUniqueToken();
      const twimlUrl = `${serverUrl}/api/twilio/robocall-audio?audioUrl=${encodeURIComponent(audioUrl)}&fromName=${encodeURIComponent(fromName)}&token=${token}`;

      const call = await client.calls.create({
        to: phoneNumber,
        from: from,
        url: twimlUrl,
        method: "GET",
      });

      // Update token with call SID for tracking
      const { robocallService } = await import("../db/services/robocallService.js");
      await robocallService.updateTwilioWebhookTokenCallSid(token, call.sid);

      results.push({
        success: true,
        phoneNumber,
        callSid: call.sid,
        status: call.status,
      });
    } catch (error) {
      results.push({
        success: false,
        phoneNumber,
        error: error.message,
        errorCode: error.code,
      });
    }
  }

  return results;
}

/**
 * Initiate call-to-record (calls user to record a message)
 * @param {string} to - Phone number to call (E.164 format)
 * @param {string} sessionId - Call-to-record session ID
 * @param {Object} req - Optional Express request object to determine server URL
 * @returns {Promise<Object>} Result with call SID
 */
export async function initiateCallToRecord(to, sessionId, req = null) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not initialized");
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error("TWILIO_PHONE_NUMBER not set");
  }

  const serverUrl = getServerUrl(req);
  // Generate unique token for this call-to-record session
  const token = await generateUniqueToken(null, sessionId);
  const twimlUrl = `${serverUrl}/api/twilio/call-to-record?sessionId=${sessionId}&token=${token}`;
  
  // Generate token for recording status callback (separate token for additional security)
  const recordingToken = await generateUniqueToken(null, sessionId);

  try {
    const call = await client.calls.create({
      to: to,
      from: from,
      url: twimlUrl,
      method: "GET",
      record: true, // Enable recording
      recordingStatusCallback: `${serverUrl}/api/twilio/recording-status?sessionId=${sessionId}&token=${recordingToken}`,
      recordingStatusCallbackMethod: "POST",
    });

    // Update token with call SID
    const { robocallService } = await import("../db/services/robocallService.js");
    await robocallService.updateTwilioWebhookTokenCallSid(token, call.sid);
    await robocallService.updateTwilioWebhookTokenCallSid(recordingToken, call.sid);

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
    };
  } catch (error) {
    // Clean up tokens on failure
    const { robocallService } = await import("../db/services/robocallService.js");
    await robocallService.deleteTwilioWebhookToken(token);
    await robocallService.deleteTwilioWebhookToken(recordingToken);
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
    };
  }
}

/**
 * Fetch recording from Twilio and upload to GCS
 * @param {string} recordingSid - Twilio Recording SID
 * @param {string} recordingUrl - Twilio Recording URL
 * @returns {Promise<{gcsPath: string, signedUrl: string}>}
 */
export async function fetchAndStoreRecording(recordingSid, recordingUrl) {
  const client = getTwilioClient();
  if (!client) {
    throw new Error("Twilio client not initialized");
  }

  try {
    // Fetch recording from Twilio
    const recording = await client.recordings(recordingSid).fetch();
    
    // Get the recording file (WAV format)
    const recordingUri = recording.uri.replace(".json", ".wav");
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    const response = await fetch(`https://api.twilio.com${recordingUri}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recording: ${response.statusText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Upload to GCS
    const { uploadAudioFile } = await import("../utils/storage/gcsStorage.js");
    const fileName = `recording_${recordingSid}.wav`;
    const result = await uploadAudioFile(audioBuffer, fileName, "audio/wav");

    return {
      gcsPath: result.gcsPath,
      signedUrl: result.url,
    };
  } catch (error) {
    console.error("Error fetching and storing recording:", error);
    throw new Error(`Failed to fetch and store recording:${error.message}`);
  }
}

