/**
 * Robocall Routes
 * Handles robocall API endpoints
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import * as robocallController from "../controllers/robocallController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Send robocall
router.post("/send", robocallController.sendRobocall);

// Call-to-record
router.post("/call-to-record", robocallController.initiateCallToRecordSession);
router.get("/call-to-record/:sessionId", robocallController.getCallToRecordSession);

// Audio recordings
router.post("/upload-recording", robocallController.uploadAudioRecording);
router.get("/saved-recordings", robocallController.getSavedAudioRecordings);

export default router;

