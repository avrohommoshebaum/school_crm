/**
 * Principal Assignment Controller
 * Admin-only: Assign principals to grades
 */

import { principalGradeAssignmentService, principalDivisionAssignmentService } from "../db/services/principalCenterService.js";
import { staffService } from "../db/services/staffService.js";
import { gradeService } from "../db/services/gradeService.js";
import { divisionService } from "../db/services/divisionService.js";
import { query } from "../db/postgresConnect.js";

export const getAllAssignments = async (req, res) => {
  try {
    const { principalId, gradeId } = req.query;
    
    if (principalId) {
      const assignments = await principalGradeAssignmentService.findByPrincipalId(principalId);
      return res.json({ assignments });
    }
    
    if (gradeId) {
      const assignments = await principalGradeAssignmentService.findByGradeId(gradeId);
      return res.json({ assignments });
    }
    
    // Get all assignments
    const assignments = await principalGradeAssignmentService.findAll();
    res.json({ assignments });
  } catch (error) {
    console.error("Error getting assignments:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error fetching assignments", error);
  }
};

// Get all principals (staff with principal position)
export const getAllPrincipals = async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT s.*
       FROM staff s
       INNER JOIN staff_positions sp ON s.id = sp.staff_id
       WHERE sp.position_name ILIKE '%principal%' AND sp.is_active = true
       AND s.employment_status = 'active'
       ORDER BY s.last_name, s.first_name`,
      []
    );
    
    const principals = result.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      title: row.title,
      fullName: `${row.first_name} ${row.last_name}`,
    }));
    
    res.json({ principals });
  } catch (error) {
    console.error("Error getting principals:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error fetching principals", error);
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { principalId, gradeId, notes } = req.body;

    if (!principalId || !gradeId) {
      return res.status(400).json({ message: "Principal ID and Grade ID are required" });
    }

    // Verify principal exists and is actually a principal
    const staff = await staffService.findById(principalId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const isPrincipal = await staffService.isPrincipal(principalId);
    if (!isPrincipal) {
      return res.status(400).json({ message: "Staff member is not a principal" });
    }

    // Verify grade exists
    const grade = await gradeService.findById(gradeId);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    const assignment = await principalGradeAssignmentService.create({
      principalId,
      gradeId,
      assignedBy: req.user._id || req.user.id,
      notes,
    });

    res.status(201).json({ message: "Assignment created successfully", assignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error creating assignment", error);
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const assignment = await principalGradeAssignmentService.update(id, updates);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment updated successfully", assignment });
  } catch (error) {
    console.error("Error updating assignment:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error updating assignment", error);
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await principalGradeAssignmentService.delete(id);
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error deleting assignment", error);
  }
};

// ============================================
// DIVISION ASSIGNMENTS
// ============================================

export const getAllDivisionAssignments = async (req, res) => {
  try {
    const { principalId, divisionId } = req.query;
    
    if (principalId) {
      const assignments = await principalDivisionAssignmentService.findByPrincipalId(principalId);
      return res.json({ assignments });
    }
    
    if (divisionId) {
      const assignments = await principalDivisionAssignmentService.findByDivisionId(divisionId);
      return res.json({ assignments });
    }
    
    const assignments = await principalDivisionAssignmentService.findAll();
    res.json({ assignments });
  } catch (error) {
    console.error("Error getting division assignments:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error fetching division assignments", error);
  }
};

export const createDivisionAssignment = async (req, res) => {
  try {
    const { principalId, divisionId, notes } = req.body;

    if (!principalId || !divisionId) {
      return res.status(400).json({ message: "Principal ID and Division ID are required" });
    }

    const staff = await staffService.findById(principalId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const isPrincipal = await staffService.isPrincipal(principalId);
    if (!isPrincipal) {
      return res.status(400).json({ message: "Staff member is not a principal" });
    }

    const division = await divisionService.findById(divisionId);
    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    const assignment = await principalDivisionAssignmentService.create({
      principalId,
      divisionId,
      assignedBy: req.user._id || req.user.id,
      notes,
    });

    res.status(201).json({ message: "Division assignment created successfully", assignment });
  } catch (error) {
    console.error("Error creating division assignment:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error creating division assignment", error);
  }
};

export const updateDivisionAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const assignment = await principalDivisionAssignmentService.update(id, updates);
    if (!assignment) {
      return res.status(404).json({ message: "Division assignment not found" });
    }

    res.json({ message: "Division assignment updated successfully", assignment });
  } catch (error) {
    console.error("Error updating division assignment:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error updating division assignment", error);
  }
};

export const deleteDivisionAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await principalDivisionAssignmentService.delete(id);
    res.json({ message: "Division assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting division assignment:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error deleting division assignment", error);
  }
};
