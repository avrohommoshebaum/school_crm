/**
 * Division Routes
 * CRUD operations for divisions (admin and head principal)
 */

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getAllDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision,
} from "../controllers/divisionController.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Permission check for create/update/delete (admin or head principal)
const requireDivisionManagement = (req, res, next) => {
  const roles = req.user?.roles || [];
  const isAdmin = roles.some((r) => r.name === "admin");
  const hasHeadPrincipal = roles.some(
    (role) => role.permissions?.["headPrincipal"]?.["view"] === true
  );
  
  if (isAdmin || hasHeadPrincipal) {
    return next();
  }
  
  return res.status(403).json({ message: "Insufficient permissions. Head Principal or Admin access required." });
};

router.get("/", getAllDivisions);
router.get("/:id", getDivisionById);
router.post("/", requireDivisionManagement, createDivision);
router.put("/:id", requireDivisionManagement, updateDivision);
router.delete("/:id", requireDivisionManagement, deleteDivision);

export default router;
