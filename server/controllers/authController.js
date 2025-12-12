import passport from "passport";
import User from "../db/models/user.js";

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    status: user.status,
    roles: (user.roles || []).map(r => ({
      id: r._id,
      name: r.name,
      displayName: r.displayName
    })),
    mfaEnabled: user.mfaEnabled,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
}

// LOCAL LOGIN
export const loginLocal = (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });

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
export const getMe = (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: sanitizeUser(req.user) });
};
