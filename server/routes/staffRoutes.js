/**
 * Staff Routes
 * CRUD operations for staff (teachers, principals, etc.)
 */

import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffPositions,
  createPosition,
  deletePosition,
  getStaffSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
  getStaffBenefits,
  createBenefit,
  updateBenefit,
  deleteBenefit,
  getStaffDocuments,
  createDocument,
  getDocumentDownloadUrl,
  updateDocument,
  deleteDocument,
  uploadPhoto,
  getPhotoUrl,
} from "../controllers/staffController.js";

const router = express.Router();

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for photos (documents can be larger)
  },
});

// All routes require authentication
router.use(requireAuth);

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

// Positions
router.get("/:staffId/positions", getStaffPositions);
router.post("/:staffId/positions", createPosition);
router.delete("/positions/:id", deletePosition);

// Salaries
router.get("/:staffId/salaries", getStaffSalaries);
router.post("/:staffId/salaries", createSalary);
router.put("/salaries/:id", updateSalary);
router.delete("/salaries/:id", deleteSalary);

// Benefits
router.get("/:staffId/benefits", getStaffBenefits);
router.post("/:staffId/benefits", createBenefit);
router.put("/benefits/:id", updateBenefit);
router.delete("/benefits/:id", deleteBenefit);

// Documents
router.get("/:staffId/documents", getStaffDocuments);
router.post("/:staffId/documents", upload.single("file"), createDocument);
router.get("/documents/:id/download", getDocumentDownloadUrl);
router.put("/documents/:id", updateDocument);
router.delete("/documents/:id", deleteDocument);

// Photos
router.post("/:staffId/photo", upload.single("photo"), uploadPhoto);
router.get("/:staffId/photo", getPhotoUrl);

export default router;

