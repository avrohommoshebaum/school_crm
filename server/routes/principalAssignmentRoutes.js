/**
 * Principal Assignment Routes
 * Head Principal/Admin: Assign principals to grades
 */

import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  getAllAssignments,
  getAllPrincipals,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/principalAssignmentController.js";

const router = express.Router();

// All routes require authentication and headPrincipal permission (or admin)
router.use(requireAuth);
router.use((req, res, next) => {
  // Allow admin or headPrincipal permission
  const roles = req.user?.roles || [];
  const isAdmin = roles.some((r) => r.name === "admin");
  const hasHeadPrincipal = roles.some(
    (role) => role.permissions?.["headPrincipal"]?.["view"] === true
  );
  
  if (isAdmin || hasHeadPrincipal) {
    return next();
  }
  
  return res.status(403).json({ message: "Insufficient permissions. Head Principal or Admin access required." });
});

router.get("/", getAllAssignments);
router.get("/principals", getAllPrincipals);
router.post("/", createAssignment);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;

