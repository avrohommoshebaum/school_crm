import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
  adminSetPassword, 
  adminSendPasswordReset,
} from "../controllers/userController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", requireAuth, requirePermission("users", "view"), getAllUsers);
router.put("/:id", requireAuth, requirePermission("users", "edit"), updateUser);
router.delete("/:id", requireAuth, requirePermission("users", "delete"), deleteUser);
router.post("/:id/reset-password", requireAuth, requirePermission("users", "edit"), adminSetPassword);
router.post("/:id/send-reset-email",requireAuth, requirePermission("users", "edit"), adminSendPasswordReset);



export default router;
