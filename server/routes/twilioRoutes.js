/**
 * Twilio Routes
 * Handles TwiML responses for phone calls
 */

import express from "express";

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

export default router;

