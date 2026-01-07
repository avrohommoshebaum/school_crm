/**
 * Family Routes
 * CRUD operations for families
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
} from "../controllers/familyController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", getAllFamilies);
router.get("/:id", getFamilyById);
router.post("/", createFamily);
router.put("/:id", updateFamily);
router.delete("/:id", deleteFamily);

export default router;

