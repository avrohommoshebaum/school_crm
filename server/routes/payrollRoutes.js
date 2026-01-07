/**
 * Payroll Routes
 * API routes for payroll management
 */

import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  getPayroll,
  getAllPayrollByStaff,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getPayrollHistory,
  createPayrollHistory,
} from "../controllers/payrollController.js";

const router = express.Router();

router.use(requireAuth);

// Get payroll for a staff member (current or specific academic year)
router.get("/staff/:staffId", requirePermission("staff", "view"), getPayroll);

// Get all payroll records for a staff member
router.get("/staff/:staffId/all", requirePermission("staff", "view"), getAllPayrollByStaff);

// Create payroll record
router.post("/staff/:staffId", requirePermission("staff", "edit"), createPayroll);

// Update payroll record
router.put("/:id", requirePermission("staff", "edit"), updatePayroll);

// Delete payroll record
router.delete("/:id", requirePermission("staff", "delete"), deletePayroll);

// Get payroll history
router.get("/staff/:staffId/history", requirePermission("staff", "view"), getPayrollHistory);

// Create payroll history entry
router.post("/staff/:staffId/history", requirePermission("staff", "edit"), createPayrollHistory);

export default router;

