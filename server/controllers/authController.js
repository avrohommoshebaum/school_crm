import passport from "passport";
import { userService } from "../db/services/userService.js";
import crypto from "crypto";
import sendResetEmail from "../utils/email/sendResetEmail.js";

function sanitizeUser(user) {
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    roles: (user.roles || []).map(r => ({
      id: r._id || r.id,
      name: r.name,
      displayName: r.displayName,
      color: r.color,
      permissions: r.permissions, // critical
    })),
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    mustChangePassword: user.mustChangePassword,

  };
}


// LOCAL LOGIN
export const loginLocal = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });


  if (user.mustChangePassword) {
  return req.login(user, async (err) => {
    if (err) return next(err);

    const userWithRoles = await userService.populateRoles(user);

    return res.json({
      requiresPasswordChange: true,
      user: sanitizeUser(userWithRoles),
    });
  });
}


    if (user.mfaEnabled) {
      // Check if user has SMS/phone 2FA configured
      if (user.mfaPhone && user.mfaMethod) {
        req.session.mfaUserId = (user._id || user.id).toString();
        
        // Automatically send 2FA code
        try {
          const { generate2FACode, send2FACode } = await import("../utils/twilio2FA.js");
          const code = generate2FACode();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          
          await userService.update(user._id || user.id, {
            mfaCode: code,
            mfaCodeExpires: expiresAt,
          });
          
          await send2FACode(user.mfaPhone, code, user.mfaMethod);
        } catch (error) {
          console.error("Error sending 2FA code during login:", error);
          // Continue anyway - user can request a new code
        }
        
        // Format phone for display (E.164 format: +12345678901 -> (234) 567-8901)
        let displayPhone = user.mfaPhone;
        if (user.mfaPhone.startsWith('+1')) {
          const digits = user.mfaPhone.slice(2);
          if (digits.length === 10) {
            displayPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
          }
        }
        
        return res.json({ 
          mfaRequired: true,
          mfaMethod: user.mfaMethod,
          mfaPhone: displayPhone
        });
      }
      // Fallback to old TOTP MFA if no phone configured
      req.session.mfaUserId = (user._id || user.id).toString();
      return res.json({ mfaRequired: true });
    }

    // Check if 2FA is enforced and user doesn't have it enabled
    const { getBooleanSetting } = await import("../db/services/systemSettingsService.js");
    const require2FA = await getBooleanSetting("require_2fa", false);
    
    if (require2FA && !user.mfaEnabled) {
      // 2FA is enforced but user hasn't enrolled - don't log them in
      // They'll need to enroll first
      return res.status(403).json({ 
        message: "2FA enrollment required",
        requires2FAEnrollment: true 
      });
    }

    req.login(user, async (err2) => {
      if (err2) return next(err2);

      await userService.update(user._id || user.id, { lastLogin: new Date() });
      const userWithRoles = await userService.populateRoles(user);

      return res.json({ user: sanitizeUser(userWithRoles) });
    });
  })(req, res, next);
};

// MFA LOGIN STEP
export const verifyMfa = async (req, res) => {
  const { token } = req.body;
  const userId = req.session.mfaUserId;

  if (!userId) return res.status(400).json({ message: "MFA session missing" });

  const user = await userService.findById(userId);

  if (!user?.mfaEnabled || !user?.mfaSecret) {
    return res.status(400).json({ message: "MFA disabled" });
  }

  const speakeasy = (await import("speakeasy")).default;
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(400).json({ message: "Invalid MFA code" });
  }

  req.login(user, async (err) => {
    if (err) throw err;

    delete req.session.mfaUserId;

    await userService.update(user._id || user.id, { lastLogin: new Date() });
    const userWithRoles = await userService.populateRoles(user);

    res.json({ user: sanitizeUser(userWithRoles) });
  });
};

// LOGOUT
export const logoutUser = (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  if (!req.user) return res.json({ user: null });

  const userId = req.user._id || req.user.id;
  const user = await userService.findById(userId);
  const userWithRoles = await userService.populateRoles(user);

  res.json({ user: sanitizeUser(userWithRoles) });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userService.findByEmail(email);

  if (!user) return res.json({ message: "If account exists, email sent." });

  const token = crypto.randomBytes(32).toString("hex");

  await userService.update(user._id || user.id, {
    passwordResetToken: token,
    passwordResetExpires: new Date(Date.now() + 1000 * 60 * 60),
  });

  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendResetEmail({ to: email, resetLink: link });

  res.json({ message: "Check your email for a reset link." });
};


export const resetPassword = async (req, res) => {
  const { password } = req.body;

  const user = await userService.findByPasswordResetToken(req.params.token);

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  await userService.setPassword(user._id || user.id, password);

  await userService.update(user._id || user.id, {
    passwordResetToken: null,
    passwordResetExpires: null,
    mustChangePassword: false,
  });

 res.json({ message: "Password reset successful" });
};

export const changePassword = async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password too short" });
  }

  const userId = req.user._id || req.user.id;
  await userService.setPassword(userId, password);
  await userService.update(userId, { mustChangePassword: false });

  res.json({ message: "Password updated" });
};


