import express from "express";
import {
  createInvite,
  getInviteDetails,
  completeInvite,
} from "../controllers/inviteController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("admin"), createInvite);
router.get("/:token", getInviteDetails);
router.post("/:token/complete", completeInvite);

export default router;
