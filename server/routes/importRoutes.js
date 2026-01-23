/**
 * Import Routes
 * Excel import for grades, students, classes, staff, families
 */

import express from "express";
import multer from "multer";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  parseExcelFile,
  importGrades,
  importStudents,
  importClasses,
  importStaff,
  importFamilies,
  importFamiliesAndStudents,
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

// Import endpoints with permissions
router.post("/grades", upload.single("file"), requirePermission("grades", "create"), importGrades);
router.post("/students", upload.single("file"), requirePermission("students", "create"), importStudents);
router.post("/classes", upload.single("file"), requirePermission("classes", "create"), importClasses);
router.post("/staff", upload.single("file"), requirePermission("staff", "create"), importStaff);
router.post("/families", upload.single("file"), requirePermission("families", "create"), importFamilies);
router.post("/families-students", upload.single("file"), requirePermission("students", "create"), importFamiliesAndStudents);

export default router;

