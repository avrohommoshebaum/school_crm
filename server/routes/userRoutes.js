import express from "express";
import { requireAuth, requireRole, requirePermission } from "../middleware/auth.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", requireAuth, requirePermission("users", "view"), getAllUsers);
router.put("/:id", requireAuth, requirePermission("users", "edit"), updateUser);
router.delete("/:id", requireAuth, requirePermission("users", "delete"), deleteUser);

export default router;
