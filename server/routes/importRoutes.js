/**
 * Import Routes
 * Excel import for grades, students, classes, staff, families
 */

import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import {
  parseExcelFile,
  importGrades,
  importStudents,
  importClasses,
  importStaff,
  importFamilies,
} from "../controllers/importController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// All routes require authentication
router.use(requireAuth);

// Parse Excel file (returns headers and sample rows)
router.post("/parse", upload.single("file"), parseExcelFile);

// Import endpoints
router.post("/grades", upload.single("file"), importGrades);
router.post("/students", upload.single("file"), importStudents);
router.post("/classes", upload.single("file"), importClasses);
router.post("/staff", upload.single("file"), importStaff);
router.post("/families", upload.single("file"), importFamilies);

export default router;

