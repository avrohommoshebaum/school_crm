import passport from "passport";
import User from "../db/models/user.js";

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    status: user.status,
    roles: (user.roles || []).map(r => ({
      id: r._id,
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

    await user.populate("roles");

    return res.json({
      requiresPasswordChange: true,
      user: sanitizeUser(user),
    });
  });
}


    if (user.mfaEnabled) {
      req.session.mfaUserId = user._id.toString();
      return res.json({ mfaRequired: true });
    }

    req.login(user, async (err2) => {
      if (err2) return next(err2);

      user.lastLogin = new Date();
      await user.save();
      await user.populate("roles");

      return res.json({ user: sanitizeUser(user) });
    });
  })(req, res, next);
};

// MFA LOGIN STEP
export const verifyMfa = async (req, res) => {
  const { token } = req.body;
  const userId = req.session.mfaUserId;

  if (!userId) return res.status(400).json({ message: "MFA session missing" });

  const user = await User.findById(userId);

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

    user.lastLogin = new Date();
    await user.save();
    await user.populate("roles");

    res.json({ user: sanitizeUser(user) });
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

  const user = await User.findById(req.user._id)
    .populate("roles"); 

  res.json({ user: sanitizeUser(user) });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.json({ message: "If account exists, email sent." });

  const token = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = token;
  user.passwordResetExpires = Date.now() + 1000 * 60 * 60;  
  await user.save();

  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendResetEmail({ to: email, resetLink: link });

  res.json({ message: "Check your email for a reset link." });
};


export const resetPassword = async (req, res) => {
  const { password } = req.body;

  const user = await User.findOne({
    passwordResetToken: req.params.token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  await user.setPassword(password);

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.mustChangePassword = false;

  await user.save();

 res.json({ message: "Password reset successful" });
};

export const changePassword = async (req, res) => {
  const { password } = req.body;

  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password too short" });
  }

  const user = await User.findById(req.user._id);

  await user.setPassword(password);
  user.mustChangePassword = false;
  await user.save();

  res.json({ message: "Password updated" });
};


