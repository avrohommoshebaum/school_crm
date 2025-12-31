/**
 * Email Routes
 */

import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  sendEmailToGroup,
  sendEmailToRecipients,
  getEmailHistory,
  getScheduledEmails,
  cancelScheduledEmail,
  updateScheduledEmail,
} from "../controllers/emailController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Send email to a group
router.post(
  "/send/group",
  requirePermission("communication", "send"),
  sendEmailToGroup
);

// Send email to individual recipients
router.post(
  "/send/recipients",
  requirePermission("communication", "send"),
  sendEmailToRecipients
);

// Get email history
router.get(
  "/history",
  requirePermission("communications", "view"),
  getEmailHistory
);

// Get scheduled emails
router.get(
  "/scheduled",
  requirePermission("communications", "view"),
  getScheduledEmails
);

// Cancel scheduled email
router.delete(
  "/scheduled/:id",
  requirePermission("communications", "send"),
  cancelScheduledEmail
);

// Update scheduled email
router.put(
  "/scheduled/:id",
  requirePermission("communications", "send"),
  updateScheduledEmail
);

export default router;

