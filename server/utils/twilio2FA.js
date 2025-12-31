/**
 * Twilio 2FA Service
 * Handles sending 2FA verification codes via SMS or phone call
 */

import { sendSMS } from "./twilio.js";
import twilio from "twilio";

let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) {
    return twilioClient;
  }
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

/**
 * Generate a random 6-digit verification code
 */
export function generate2FACode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send 2FA verification code via SMS
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} Result with success status
 */
export async function send2FACodeViaSMS(phoneNumber, code) {
  try {
    const message = `Your Nachlas Bais Yaakov verification code is: ${code}. This code will expire in 10 minutes.`;
    await sendSMS(phoneNumber, message);
    return { success: true };
  } catch (error) {
    console.error("Error sending 2FA code via SMS:", error);
    return { 
      success: false, 
      error: error.message || "Failed to send SMS verification code" 
    };
  }
}

/**
 * Send 2FA verification code via phone call
 * Uses Twilio's TwiML to speak the code
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} Result with success status
 */
export async function send2FACodeViaPhoneCall(phoneNumber, code) {
  try {
    const client = getTwilioClient();
    if (!client) {
      throw new Error("Twilio client not initialized");
    }

    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
      throw new Error("TWILIO_PHONE_NUMBER not set");
    }

    // Format code with pauses between digits for clarity (e.g., "1 2 3 4 5 6")
    const codeDigits = code.split('').join(' ');
    
    // Create TwiML that speaks the verification code
    // We'll use Twilio's TwiML to speak the code
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Your Nachlas Bais Yaakov verification code is: ${codeDigits}. I repeat: ${codeDigits}. This code will expire in 10 minutes.</Say>
  <Pause length="1"/>
  <Say voice="alice">Goodbye.</Say>
</Response>`;

    // Use Twilio's TwiML TwiMLResponse or create a call with inline TwiML
    // For phone calls, we need to use Twilio's call API
    // We'll create a call that uses a TwiML URL endpoint
    // For now, let's use a simpler approach with Twilio's call API
    
    // Note: In production, you'd want to set up a TwiML endpoint
    // For this implementation, we'll create a call with a TwiML URL
    // You can also use Twilio's TwiML Bins or Functions
    
    // Use the TwiML endpoint - for Cloud Run, use the full URL
    // For local dev, use localhost, for production use the deployed URL
    let serverUrl = process.env.SERVER_URL;
    if (!serverUrl) {
      // Try to construct from CLIENT_URL or use default
      if (process.env.CLIENT_URL) {
        // If CLIENT_URL is set, use it (should be the same domain)
        serverUrl = process.env.CLIENT_URL;
      } else {
        // Fallback for local development
        serverUrl = process.env.NODE_ENV === 'production' 
          ? 'https://school-app-iuwhs6msyq-uc.a.run.app' // Update with your actual Cloud Run URL
          : 'http://localhost:3000';
      }
    }
    const twimlUrl = `${serverUrl}/api/twilio/2fa-voice?code=${code}`;
    
    const call = await client.calls.create({
      to: phoneNumber,
      from: from,
      url: twimlUrl,
      method: 'GET',
    });

    return { success: true, callSid: call.sid };
  } catch (error) {
    console.error("Error sending 2FA code via phone call:", error);
    return { 
      success: false, 
      error: error.message || "Failed to make verification call" 
    };
  }
}

/**
 * Send 2FA code via the user's preferred method
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} code - 6-digit verification code
 * @param {string} method - 'SMS' or 'phone_call'
 * @returns {Promise<Object>} Result with success status
 */
export async function send2FACode(phoneNumber, code, method = 'SMS') {
  if (method === 'phone_call') {
    return await send2FACodeViaPhoneCall(phoneNumber, code);
  } else {
    return await send2FACodeViaSMS(phoneNumber, code);
  }
}

