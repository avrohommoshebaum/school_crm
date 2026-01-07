/**
 * Class Routes
 * CRUD operations for classes
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;

