import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", requireAuth, requireRole("admin"), getAllUsers);
router.put("/:id", requireAuth, requireRole("admin"), updateUser);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

export default router;
