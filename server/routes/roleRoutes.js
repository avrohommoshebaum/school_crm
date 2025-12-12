import express from "express";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), getAllRoles);
router.post("/", requireAuth, requireRole("admin"), createRole);
router.put("/:id", requireAuth, requireRole("admin"), updateRole);
router.delete("/:id", requireAuth, requireRole("admin"), deleteRole);

export default router;
