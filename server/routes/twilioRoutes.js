/**
 * Twilio Routes
 * Handles TwiML responses for phone calls
 */

import express from "express";
import { validateTwilioToken as validateToken } from "../utils/twilioRobocall.js";

const router = express.Router();

/**
 * TwiML endpoint for 2FA phone call
 * Returns TwiML XML that speaks the verification code
 */
router.get("/2fa-voice", (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).send("Missing code parameter");
  }

  // Format code with pauses between digits (e.g., "1 2 3 4 5 6")
  const codeDigits = code.split('').join(' ');

  // Generate TwiML XML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Your Nachlas Bais Yaakov verification code is: ${codeDigits}. I repeat: ${codeDigits}. This code will expire in 10 minutes.</Say>
  <Pause length="1"/>
  <Say voice="alice">Goodbye.</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

/**
 * Validate Twilio webhook token from request
 * Uses unique token validation from twilioRobocall utility
 */
async function validateTwilioTokenFromRequest(req) {
  const token = req.query.token;
  
  if (!token) {
    console.warn("⚠️ Missing token in Twilio webhook request");
    return false;
  }

  const isValid = await validateToken(token);
  
  if (!isValid) {
    console.warn("⚠️ Invalid or expired Twilio webhook token");
    return false;
  }
  
  return true;
}

/**
 * TwiML endpoint for text-to-speech robocall
 * Returns TwiML XML that says "Message from [fromName]" then speaks the message
 * SECURE: Validates unique token to ensure only Twilio can access
 */
router.get("/robocall-tts", async (req, res) => {
  // Validate token
  if (!(await validateTwilioTokenFromRequest(req))) {
    return res.status(403).send("Forbidden");
  }

  const message = req.query.message;
  const fromName = req.query.fromName || "Nachlas Bais Yaakov";
  
  if (!message) {
    return res.status(400).send("Missing message parameter");
  }

  // Generate TwiML XML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Message from ${fromName}.</Say>
  <Pause length="1"/>
  <Say voice="alice">${message}</Say>
  <Pause length="1"/>
  <Say voice="alice">Thank you.</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

/**
 * TwiML endpoint for audio robocall
 * Returns TwiML XML that says "Message from [fromName]" then plays the audio
 * SECURE: Validates unique token to ensure only Twilio can access
 */
router.get("/robocall-audio", async (req, res) => {
  // Validate token
  if (!(await validateTwilioTokenFromRequest(req))) {
    return res.status(403).send("Forbidden");
  }

  const audioUrl = req.query.audioUrl;
  const fromName = req.query.fromName || "Nachlas Bais Yaakov";
  
  if (!audioUrl) {
    return res.status(400).send("Missing audioUrl parameter");
  }

  // Generate TwiML XML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Message from ${fromName}.</Say>
  <Pause length="1"/>
  <Play>${audioUrl}</Play>
  <Pause length="1"/>
  <Say voice="alice">Thank you.</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

/**
 * TwiML endpoint for call-to-record
 * Prompts user to record a message after beep
 * SECURE: Validates unique token to ensure only Twilio can access
 */
router.get("/call-to-record", async (req, res) => {
  // Validate token
  if (!(await validateTwilioTokenFromRequest(req))) {
    return res.status(403).send("Forbidden");
  }

  const sessionId = req.query.sessionId;
  
  if (!sessionId) {
    return res.status(400).send("Missing sessionId parameter");
  }

  // Get server URL for recording status callback
  const serverUrl = process.env.SERVER_URL || process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
  
  // The recording status callback URL is already set when the call was created
  // in initiateCallToRecord, so we don't need to generate a new token here
  // The token is already in the recordingStatusCallback URL
  // However, we can also set it in the Record element for redundancy
  // For now, we'll use the URL that was set when creating the call
  // (Twilio will use the recordingStatusCallback from the call creation)

  // Generate TwiML XML for recording
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please record your message after the beep. Press the pound key when you are finished.</Say>
  <Record 
    maxLength="300" 
    finishOnKey="#"
    transcribe="false"
  />
  <Say voice="alice">Thank you. Your recording has been saved.</Say>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

/**
 * Webhook endpoint for recording status
 * Called by Twilio when recording is complete
 * SECURE: Validates both Twilio signature AND token
 */
router.post("/recording-status", async (req, res) => {
  try {
    // Validate unique token first
    const token = req.query.token;
    
    if (!token) {
      console.warn("⚠️ Missing token in recording-status webhook");
      return res.status(403).send("Forbidden");
    }

    if (!(await validateToken(token))) {
      console.warn("⚠️ Invalid or expired token in recording-status webhook");
      return res.status(403).send("Forbidden");
    }

    // Validate Twilio signature for additional security
    const twilio = (await import("twilio")).default;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const signature = req.headers["x-twilio-signature"];
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    // Verify signature
    if (authToken && signature) {
      const isValid = twilio.validateRequest(
        authToken,
        signature,
        url,
        req.body
      );

      if (!isValid) {
        console.error("Invalid Twilio signature");
        return res.status(403).send("Forbidden");
      }
    }

    const { CallSid, RecordingSid, RecordingUrl, RecordingStatus, RecordingDuration } = req.body;
    const sessionId = req.query.sessionId;

    if (RecordingStatus === "completed" && RecordingSid && sessionId) {
      // Fetch and store recording in GCS
      const { fetchAndStoreRecording } = await import("../utils/twilioRobocall.js");
      const { updateCallToRecordSession, getCallToRecordSessionById, createSavedAudioRecording } = await import("../db/services/robocallService.js");

      try {
        const { gcsPath, signedUrl } = await fetchAndStoreRecording(RecordingSid, RecordingUrl);
        
        // Get session to get user_id
        const session = await getCallToRecordSessionById(sessionId);
        
        // Update session with recording info
        await updateCallToRecordSession(sessionId, {
          recordingSid: RecordingSid,
          recordingUrl: RecordingUrl,
          recordingGcsPath: gcsPath,
          status: "completed",
        });

        // Automatically save to saved_audio_recordings for reuse
        if (session && session.user_id) {
          try {
            await createSavedAudioRecording({
              name: `Call Recording ${new Date().toLocaleDateString()}`,
              description: `Recording from call-to-record session`,
              audioGcsPath: gcsPath,
              durationSeconds: RecordingDuration ? parseInt(RecordingDuration) : null,
              recordingMethod: "call-to-record",
              createdBy: session.user_id,
            });
            console.log(`Recording automatically saved to saved_audio_recordings`);
          } catch (saveError) {
            // Don't fail the whole process if saving to saved recordings fails
            console.error("Error saving recording to saved_audio_recordings:", saveError);
          }
        }

        console.log(`Recording stored: ${gcsPath}`);
      } catch (error) {
        console.error("Error storing recording:", error);
        await updateCallToRecordSession(sessionId, {
          recordingSid: RecordingSid,
          recordingUrl: RecordingUrl,
          status: "failed",
        });
      }
    }

    res.type('text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error("Error in recording-status webhook:", error);
    res.status(500).send("Error");
  }
});

export default router;

