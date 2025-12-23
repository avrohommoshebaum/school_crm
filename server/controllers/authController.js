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
      req.session.mfaUserId = (user._id || user.id).toString();
      return res.json({ mfaRequired: true });
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


