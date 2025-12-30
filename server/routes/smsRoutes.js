import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  sendSMSToGroup,
  sendSMSToMember,
  scheduleSMS,
  processScheduledSMS,
  getSMSHistory,
  getScheduledSMS,
  cancelScheduledSMS,
  getSMSRecipients,
  updateScheduledSMS,
} from "../controllers/smsController.js";

const router = express.Router();

// Process scheduled SMS (called by Cloud Scheduler - must be before requireAuth)
// This route is protected by x-scheduler-token header check in the controller
router.post("/process-scheduled", processScheduledSMS);

// All other routes require authentication
router.use(requireAuth);

// Send SMS routes
router.post("/send/group", requirePermission("communication", "send"), sendSMSToGroup);
router.post("/send/member", requirePermission("communication", "send"), sendSMSToMember);

// Schedule SMS
router.post("/schedule", requirePermission("communication", "send"), scheduleSMS);

// Get history and scheduled SMS
router.get("/history", requirePermission("communication", "view"), getSMSHistory);
router.get("/scheduled", requirePermission("communication", "view"), getScheduledSMS);

// Get SMS recipient details
router.get("/:id/recipients", requirePermission("communication", "view"), getSMSRecipients);

// Cancel/update scheduled SMS
router.delete("/scheduled/:id", requirePermission("communication", "send"), cancelScheduledSMS);
router.put("/scheduled/:id", requirePermission("communication", "send"), updateScheduledSMS);

export default router;

