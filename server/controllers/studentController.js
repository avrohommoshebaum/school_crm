/**
 * Student Controller
 * CRUD operations for students
 */

import { studentService } from "../db/services/studentService.js";

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
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const student = await studentService.create(req.body);
    res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Error creating student", error: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await studentService.update(id, req.body);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await studentService.delete(id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};

