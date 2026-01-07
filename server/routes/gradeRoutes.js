/**
 * Grade Routes
 * CRUD operations for grades (admin only)
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/gradeController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", getAllGrades);
router.get("/:id", getGradeById);
router.post("/", createGrade);
router.put("/:id", updateGrade);
router.delete("/:id", deleteGrade);

export default router;

