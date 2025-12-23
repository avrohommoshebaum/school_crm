import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMe,
  updateProfile,
  updateSettings,
  changePassword,
} from "../controllers/userProfileController.js";

const router = express.Router();

// All profile routes require authentication
router.get("/me", requireAuth, getMe);
router.put("/me/profile", requireAuth, updateProfile);
router.put("/me/settings", requireAuth, updateSettings);
router.put("/me/password", requireAuth, changePassword);

export default router;
