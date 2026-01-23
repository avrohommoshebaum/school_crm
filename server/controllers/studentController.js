/**
 * Student Controller
 * CRUD operations for students
 */

import { studentService } from "../db/services/studentService.js";
import { sendErrorResponse } from "../utils/errorHandler.js";

export const getAllStudents = async (req, res) => {
  try {
    const { gradeId, familyId, enrollmentStatus, search, limit, offset } = req.query;
    const students = await studentService.findAll({
      gradeId,
      familyId,
      enrollmentStatus,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    res.json({ students });
  } catch (error) {
    console.error("Error getting students:", error);
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await studentService.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ student });
  } catch (error) {
    console.error("Error getting student:", error);
    sendErrorResponse(res, 500, "Error fetching student", error);
  }
};

export const createStudent = async (req, res) => {
  try {
    const { classId, ...studentData } = req.body;
    const student = await studentService.create(studentData);
    
    // Assign to class if classId was provided
    if (classId && student.id) {
      const { query } = await import("../db/postgresConnect.js");
      try {
        await query(
          `INSERT INTO student_classes (student_id, class_id, status, enrollment_date)
           VALUES ($1, $2, 'active', CURRENT_DATE)
           ON CONFLICT (student_id, class_id) 
           DO UPDATE SET status = 'active', enrollment_date = CURRENT_DATE`,
          [student.id, classId]
        );
      } catch (classError) {
        console.warn("Student created but class assignment failed:", classError);
        // Don't fail the entire operation if class assignment fails
      }
    }
    
    res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    console.error("Error creating student:", error);
    sendErrorResponse(res, 500, "Error creating student", error);
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, ...studentData } = req.body;
    
    const student = await studentService.update(id, studentData);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    // Update class assignment if classId was provided
    if (classId !== undefined && student.id) {
      const { query } = await import("../db/postgresConnect.js");
      if (classId) {
        // Assign to new class
        try {
          await query(
            `INSERT INTO student_classes (student_id, class_id, status, enrollment_date)
             VALUES ($1, $2, 'active', CURRENT_DATE)
             ON CONFLICT (student_id, class_id) 
             DO UPDATE SET status = 'active', enrollment_date = CURRENT_DATE`,
            [student.id, classId]
          );
        } catch (classError) {
          console.warn("Class assignment update failed:", classError);
        }
      } else {
        // Remove from all classes (set status to 'withdrawn')
        try {
          await query(
            `UPDATE student_classes SET status = 'withdrawn', withdrawal_date = CURRENT_DATE
             WHERE student_id = $1 AND status = 'active'`,
            [student.id]
          );
        } catch (classError) {
          console.warn("Class withdrawal update failed:", classError);
        }
      }
    }
    
    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Error updating student:", error);
    sendErrorResponse(res, 500, "Error updating student", error);
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await studentService.delete(id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    sendErrorResponse(res, 500, "Error deleting student", error);
  }
};

