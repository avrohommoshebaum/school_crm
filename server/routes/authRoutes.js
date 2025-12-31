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
  start2FASetup,
  verify2FASetup,
  send2FACodeForLogin,
  verify2FALogin,
  disable2FA
} from "../controllers/mfa2FAController.js";

import {
  generateMyBackupCodes,
  verifyBackupCodeLogin,
  getMyBackupCodesCount,
} from "../controllers/backupCodesController.js";

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

// MFA SETUP (TOTP - legacy)
router.post("/mfa/setup", requireAuth, startMfaSetup);
router.post("/mfa/setup/verify", requireAuth, verifyMfaSetup);
router.post("/mfa/disable", requireAuth, disableMfa);

// 2FA SETUP (SMS/Phone Call)
router.post("/2fa/setup", requireAuth, start2FASetup);
router.post("/2fa/setup/verify", requireAuth, verify2FASetup);
router.post("/2fa/send-code", send2FACodeForLogin);
router.post("/2fa/verify", verify2FALogin);
router.post("/2fa/disable", requireAuth, disable2FA);

// Backup Codes
router.post("/backup-codes/generate", requireAuth, generateMyBackupCodes);
router.post("/backup-codes/verify", verifyBackupCodeLogin);
router.get("/backup-codes/count", requireAuth, getMyBackupCodesCount);

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
