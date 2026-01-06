/**
 * Robocall Routes
 * Handles robocall API endpoints
 */

import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import * as robocallController from "../controllers/robocallController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Send robocall
router.post("/send", requirePermission("communication", "send"), robocallController.sendRobocall);

// Call-to-record
router.post("/call-to-record", requirePermission("communication", "send"), robocallController.initiateCallToRecordSession);
router.get("/call-to-record/:sessionId", requirePermission("communication", "view"), robocallController.getCallToRecordSession);

// Audio recordings
router.post("/upload-recording", requirePermission("communication", "send"), robocallController.uploadAudioRecording);
router.get("/saved-recordings", requirePermission("communication", "view"), robocallController.getSavedAudioRecordings);

// Get robocall history
router.get("/history", requirePermission("communication", "view"), robocallController.getRobocallHistory);

export default router;

