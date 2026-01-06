/**
 * Backup Codes Controller
 * Handles backup code generation and verification for 2FA
 */

import { userService } from "../db/services/userService.js";
import {
  createBackupCodes,
  verifyBackupCode,
  getUnusedBackupCodesCount,
  getBackupCodesStatus,
} from "../db/services/backupCodesService.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

/**
 * Generate backup codes for current user
 */
export const generateMyBackupCodes = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await userService.findById(userId);

    if (!user || !user.mfaEnabled) {
      return res.status(400).json({ message: "2FA must be enabled to generate backup codes" });
    }

    const codes = await createBackupCodes(userId);

    // Return codes (only time they're shown)
    res.json({
      codes,
      message: "Backup codes generated. Save these codes in a safe place. They will not be shown again.",
    });
  } catch (error) {
    console.error("Error generating backup codes:", error);
    res.status(500).json({ message: "Failed to generate backup codes" });
  }
};

/**
 * Verify backup code during login
 */
export const verifyBackupCodeLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.session.mfaUserId;

    if (!userId) {
      return res.status(400).json({ message: "MFA session missing" });
    }

    if (!code || code.length !== 8) {
      return res.status(400).json({ message: "Invalid backup code format" });
    }

    const isValid = await verifyBackupCode(userId, code);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or already used backup code" });
    }

    // Code is valid - log user in
    const user = await userService.findById(userId);
    
    // Check if 2FA is enforced - if user used backup code and 2FA is enforced, 
    // they still need to enroll (but we let them login temporarily)
    const { getBooleanSetting } = await import("../db/services/systemSettingsService.js");
    const require2FA = await getBooleanSetting("require_2fa", false);
    
    await userService.update(userId, {
      lastLogin: new Date(),
    });

    req.login(user, async (err) => {
      if (err) throw err;

      delete req.session.mfaUserId;

      const userWithRoles = await userService.populateRoles(user);

      // Get session timeout
      const { getSessionTimeout } = await import("../config/session.js");
      const sessionTimeout = getSessionTimeout();

      res.json({
        user: {
          id: userWithRoles._id || userWithRoles.id,
          name: userWithRoles.name,
          email: userWithRoles.email,
          status: userWithRoles.status,
          roles: (userWithRoles.roles || []).map((r) => ({
            id: r._id || r.id,
            name: r.name,
            displayName: r.displayName,
            color: r.color,
            permissions: r.permissions,
          })),
          mfaEnabled: userWithRoles.mfaEnabled,
          createdAt: userWithRoles.createdAt,
          lastLogin: userWithRoles.lastLogin,
        },
        // If 2FA is enforced and user doesn't have it, they need to enroll after login
        requires2FAEnrollment: require2FA && !userWithRoles.mfaEnabled,
        sessionTimeout, // milliseconds
        require2FA, // boolean
      });
    });
  } catch (error) {
    console.error("Error verifying backup code:", error);
    res.status(500).json({ message: "Failed to verify backup code" });
  }
};

/**
 * Get backup codes count for current user
 */
export const getMyBackupCodesCount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const count = await getUnusedBackupCodesCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("Error getting backup codes count:", error);
    res.status(500).json({ message: "Failed to get backup codes count" });
  }
};

/**
 * Admin: Generate backup codes for a user
 */
export const generateUserBackupCodes = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.mfaEnabled) {
      return res.status(400).json({ message: "User must have 2FA enabled" });
    }

    const codes = await createBackupCodes(userId);

    res.json({
      codes,
      message: "Backup codes generated. These codes should be securely shared with the user.",
    });
  } catch (error) {
    console.error("Error generating user backup codes:", error);
    res.status(500).json({ message: "Failed to generate backup codes" });
  }
};

/**
 * Admin: Get backup codes status for a user
 */
export const getUserBackupCodesStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const status = await getBackupCodesStatus(userId);
    const unusedCount = await getUnusedBackupCodesCount(userId);

    res.json({
      total: status.length,
      unused: unusedCount,
      used: status.length - unusedCount,
      codes: status,
    });
  } catch (error) {
    console.error("Error getting backup codes status:", error);
    res.status(500).json({ message: "Failed to get backup codes status" });
  }
};

