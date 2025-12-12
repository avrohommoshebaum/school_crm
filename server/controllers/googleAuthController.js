import passport from "passport";
import User from "../db/models/user.js";

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = [
  passport.authenticate("google", {
    failureRedirect: "/auth/google/failure",
    session: true,
  }),
  async (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/login-success`);
  },
];

export const googleFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login-failed`);
};
