/**
 * 2FA Controller for SMS/Phone Call Authentication
 * Replaces TOTP-based MFA with SMS/Phone Call verification
 */

import { userService } from "../db/services/userService.js";
import { generate2FACode, send2FACode } from "../utils/twilio2FA.js";
import crypto from "crypto";

/**
 * Start 2FA setup - send verification code to phone
 */
export const start2FASetup = async (req, res) => {
  try {
    const { phoneNumber, method } = req.body; // method: 'SMS' or 'phone_call'
    const userId = req.user._id || req.user.id;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!method || !['SMS', 'phone_call'].includes(method)) {
      return res.status(400).json({ message: "Method must be 'SMS' or 'phone_call'" });
    }

    // Generate verification code
    const code = generate2FACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code temporarily in user record
    await userService.update(userId, {
      mfaPhone: phoneNumber,
      mfaMethod: method,
      mfaCode: code,
      mfaCodeExpires: expiresAt,
    });

    // Send code via SMS or phone call
    const sendResult = await send2FACode(phoneNumber, code, method);

    if (!sendResult.success) {
      return res.status(500).json({ 
        message: sendResult.error || "Failed to send verification code" 
      });
    }

    res.json({ 
      message: `Verification code sent via ${method === 'phone_call' ? 'phone call' : 'SMS'}`,
      method 
    });
  } catch (error) {
    console.error("Error starting 2FA setup:", error);
    res.status(500).json({ message: "Failed to start 2FA setup" });
  }
};

/**
 * Verify 2FA setup code and enable 2FA
 */
export const verify2FASetup = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await userService.findById(userId);

    if (!user || !user.mfaCode || !user.mfaCodeExpires) {
      return res.status(400).json({ message: "2FA setup not started or code expired" });
    }

    // Check if code expired
    const expiresAt = user.mfaCodeExpires instanceof Date 
      ? user.mfaCodeExpires 
      : new Date(user.mfaCodeExpires);
    
    if (expiresAt < new Date()) {
      await userService.update(userId, {
        mfaCode: null,
        mfaCodeExpires: null,
      });
      return res.status(400).json({ message: "Verification code expired. Please try again." });
    }

    // Verify code
    if (user.mfaCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Enable 2FA
    await userService.update(userId, {
      mfaEnabled: true,
      mfaCode: null,
      mfaCodeExpires: null,
      // Keep mfaPhone and mfaMethod
    });

    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    console.error("Error verifying 2FA setup:", error);
    res.status(500).json({ message: "Failed to verify 2FA setup" });
  }
};

/**
 * Send 2FA code during login
 */
export const send2FACodeForLogin = async (req, res) => {
  try {
    const userId = req.session.mfaUserId;
    if (!userId) {
      return res.status(400).json({ message: "MFA session missing" });
    }

    const user = await userService.findById(userId);
    if (!user || !user.mfaEnabled || !user.mfaPhone || !user.mfaMethod) {
      return res.status(400).json({ message: "2FA not configured" });
    }

    // Generate new code
    const code = generate2FACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code
    await userService.update(userId, {
      mfaCode: code,
      mfaCodeExpires: expiresAt,
    });

    // Send code
    const sendResult = await send2FACode(user.mfaPhone, code, user.mfaMethod);

    if (!sendResult.success) {
      return res.status(500).json({ 
        message: sendResult.error || "Failed to send verification code" 
      });
    }

    res.json({ 
      message: `Verification code sent via ${user.mfaMethod === 'phone_call' ? 'phone call' : 'SMS'}`,
      method: user.mfaMethod 
    });
  } catch (error) {
    console.error("Error sending 2FA code for login:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

/**
 * Verify 2FA code during login
 */
export const verify2FALogin = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.session.mfaUserId;

    if (!userId) {
      return res.status(400).json({ message: "MFA session missing" });
    }

    const user = await userService.findById(userId);
    if (!user || !user.mfaEnabled) {
      return res.status(400).json({ message: "2FA not enabled" });
    }

    // Check if code exists and is valid
    if (!user.mfaCode || !user.mfaCodeExpires) {
      return res.status(400).json({ message: "No verification code found. Please request a new code." });
    }

    // Check expiration
    const expiresAt = user.mfaCodeExpires instanceof Date 
      ? user.mfaCodeExpires 
      : new Date(user.mfaCodeExpires);
    
    if (expiresAt < new Date()) {
      await userService.update(userId, {
        mfaCode: null,
        mfaCodeExpires: null,
      });
      return res.status(400).json({ message: "Verification code expired. Please request a new code." });
    }

    // Verify code
    if (user.mfaCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Code is valid - clear it and log user in
    await userService.update(userId, {
      mfaCode: null,
      mfaCodeExpires: null,
      lastLogin: new Date(),
    });

    // Login user (this will be handled by authController)
    req.login(user, async (err) => {
      if (err) throw err;

      delete req.session.mfaUserId;

      const userWithRoles = await userService.populateRoles(user);
      
      res.json({ 
        user: {
          id: userWithRoles._id || userWithRoles.id,
          name: userWithRoles.name,
          email: userWithRoles.email,
          status: userWithRoles.status,
          roles: (userWithRoles.roles || []).map(r => ({
            id: r._id || r.id,
            name: r.name,
            displayName: r.displayName,
            color: r.color,
            permissions: r.permissions,
          })),
          mfaEnabled: userWithRoles.mfaEnabled,
          createdAt: userWithRoles.createdAt,
          lastLogin: userWithRoles.lastLogin,
        }
      });
    });
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    res.status(500).json({ message: "Failed to verify code" });
  }
};

/**
 * Disable 2FA
 */
export const disable2FA = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    await userService.update(userId, {
      mfaEnabled: false,
      mfaPhone: null,
      mfaMethod: null,
      mfaCode: null,
      mfaCodeExpires: null,
    });

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    res.status(500).json({ message: "Failed to disable 2FA" });
  }
};

