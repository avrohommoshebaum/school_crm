import express from "express";
import {
  getMe,
  updateProfile,
  updateSettings,
  changePassword,
} from "../controllers/userProfileController.js";

const router = express.Router();

router.get("/me", getMe);
router.put("/me/profile", updateProfile);
router.put("/me/settings", updateSettings);
router.put("/me/password", changePassword);

export default router;
