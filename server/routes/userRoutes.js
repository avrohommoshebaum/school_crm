import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  adminSetPassword, 
  adminSendPasswordReset,
} from "../controllers/userController.js";

import {
  generateUserBackupCodes,
  getUserBackupCodesStatus,
} from "../controllers/backupCodesController.js";

import {
  updateUser2FAPhone,
} from "../controllers/user2FAController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", requireAuth, requirePermission("users", "view"), getAllUsers);
router.put("/:id", requireAuth, requirePermission("users", "edit"), updateUser);
router.delete("/:id", requireAuth, requirePermission("users", "delete"), deleteUser);
router.post("/:id/reset-password", requireAuth, requirePermission("users", "edit"), adminSetPassword);
router.post("/:id/send-reset-email",requireAuth, requirePermission("users", "edit"), adminSendPasswordReset);

// Admin 2FA Management
router.put("/:id/2fa-phone", requireAuth, requirePermission("users", "edit"), updateUser2FAPhone);
router.post("/:id/backup-codes/generate", requireAuth, requirePermission("users", "edit"), generateUserBackupCodes);
router.get("/:id/backup-codes", requireAuth, requirePermission("users", "view"), getUserBackupCodesStatus);



export default router;
