import express from "express";
import {
  createInvite,
  getInviteDetails,
  completeInvite,
} from "../controllers/inviteController.js";

import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requirePermission("invite", "create"), createInvite);
router.get("/:token", getInviteDetails);
router.post("/:token/complete", completeInvite);

export default router;
