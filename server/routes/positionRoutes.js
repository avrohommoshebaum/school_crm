/**
 * Position Routes
 * CRUD operations for system-wide positions
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from "../controllers/positionController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", getAllPositions);
router.get("/:id", getPositionById);
router.post("/", createPosition);
router.put("/:id", updatePosition);
router.delete("/:id", deletePosition);

export default router;

