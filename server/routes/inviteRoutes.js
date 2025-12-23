import express from "express";
import {
  createInvite,
  getInviteDetails,
  completeInvite,
  resendInvite,
} from "../controllers/inviteController.js";

import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requirePermission("invites", "create"), createInvite);
router.post("/resend/:userId", requireAuth, requirePermission("invites", "create"), resendInvite);
router.get("/:token", getInviteDetails);
router.post("/:token/complete", completeInvite);

export default router;
