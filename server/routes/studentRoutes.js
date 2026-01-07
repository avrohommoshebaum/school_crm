/**
 * Student Routes
 * CRUD operations for students
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;

