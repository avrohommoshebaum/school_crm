/**
 * System Settings Controller
 * Handles system-wide settings management
 */

import {
  getSetting,
  setSetting,
  getAllSettings,
  getBooleanSetting,
} from "../db/services/systemSettingsService.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

/**
 * Get all system settings (admin only)
 */
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.json({ settings });
  } catch (error) {
    console.error("Error getting system settings:", error);
    res.status(500).json({ message: "Failed to get system settings" });
  }
};

/**
 * Update a system setting (admin only)
 */
export const updateSystemSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    if (!key) {
      return res.status(400).json({ message: "Setting key is required" });
    }

    const updated = await setSetting(key, value, description);

    res.json({
      message: "Setting updated successfully",
      setting: updated,
    });
  } catch (error) {
    console.error("Error updating system setting:", error);
    res.status(500).json({ message: "Failed to update system setting" });
  }
};

/**
 * Get a specific setting (public, used by login flow)
 */
export const getSystemSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await getSetting(key);

    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }

    res.json({ setting });
  } catch (error) {
    console.error("Error getting system setting:", error);
    res.status(500).json({ message: "Failed to get system setting" });
  }
};

