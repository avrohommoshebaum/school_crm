/**
 * System Settings Routes
 */

import express from "express";
import {
  getSystemSettings,
  updateSystemSetting,
  getSystemSetting,
} from "../controllers/systemSettingsController.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = express.Router();

// Admin only - get all settings
router.get("/", requireAuth, requirePermission("settings", "view"), getSystemSettings);

// Admin only - update a setting
router.put("/", requireAuth, requirePermission("settings", "edit"), updateSystemSetting);

// Public - get specific setting (used by login flow to check 2FA enforcement)
router.get("/:key", getSystemSetting);

export default router;

