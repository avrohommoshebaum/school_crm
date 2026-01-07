/**
 * Principal Assignment Controller
 * Admin-only: Assign principals to grades
 */

import { principalGradeAssignmentService } from "../db/services/principalCenterService.js";
import { staffService } from "../db/services/staffService.js";
import { gradeService } from "../db/services/gradeService.js";
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
    res.status(500).json({ message: "Error fetching assignments", error: error.message });
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
    res.status(500).json({ message: "Error fetching principals", error: error.message });
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
    res.status(500).json({ message: "Error creating assignment", error: error.message });
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
    res.status(500).json({ message: "Error updating assignment", error: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await principalGradeAssignmentService.delete(id);
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Error deleting assignment", error: error.message });
  }
};

