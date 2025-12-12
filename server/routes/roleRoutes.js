import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";

const router = express.Router();

// Role Management controlled by USERS permissions
router.get(
  "/",
  requireAuth,
  requirePermission("users", "view"),
  getAllRoles
);

router.post(
  "/",
  requireAuth,
  requirePermission("users", "create"),
  createRole
);

router.put(
  "/:id",
  requireAuth,
  requirePermission("users", "edit"),
  updateRole
);

router.delete(
  "/:id",
  requireAuth,
  requirePermission("users", "delete"),
  deleteRole
);

export default router;
