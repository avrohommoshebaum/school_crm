import express from "express";
import passport from "passport";
import {
  loginLocal,
  verifyMfa,
  logoutUser,
  getMe, 
  forgotPassword, 
  resetPassword, 
  changePassword
} from "../controllers/authController.js";

import {
  startMfaSetup,
  verifyMfaSetup,
  disableMfa
} from "../controllers/mfaController.js";

import {
  googleLogin,
  googleCallback,
  googleFailure
} from "../controllers/googleAuthController.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// LOCAL LOGIN FLOW
router.post("/login", loginLocal);
router.post("/mfa/verify", verifyMfa);

// MFA SETUP
router.post("/mfa/setup", requireAuth, startMfaSetup);
router.post("/mfa/setup/verify", requireAuth, verifyMfaSetup);
router.post("/mfa/disable", requireAuth, disableMfa);

// GOOGLE LOGIN FLOW
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/google/failure", googleFailure);

// SESSION
router.get("/me", getMe);
router.post("/logout", logoutUser);

// PASSWORD RESET
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", requireAuth, changePassword);



export default router;
