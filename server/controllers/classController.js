/**
 * Class Controller
 * CRUD operations for classes
 */

import { classService } from "../db/services/classService.js";

export const getAllClasses = async (req, res) => {
  try {
    const { gradeId, academicYear, status, search, limit, offset } = req.query;
    const classes = await classService.findAll({
      gradeId,
      academicYear,
      status,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    
    // Enrich classes with student counts and teachers
    const enrichedClasses = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await classService.getStudentCount(cls.id);
        const teachers = await classService.getTeachers(cls.id);
        return {
          ...cls,
          studentCount,
          teachers: teachers.map(t => ({
            id: t.id,
            firstName: t.first_name,
            lastName: t.last_name,
            role: t.role,
          })),
        };
      })
    );
    
    res.json({ classes: enrichedClasses });
  } catch (error) {
    console.error("Error getting classes:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error fetching classes", error);
  }
};

export const getClassById = async (req, res) => {
  try {
    const classRecord = await classService.findById(req.params.id);
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }
    
    // Get additional info
    const studentCount = await classService.getStudentCount(classRecord.id);
    const teachers = await classService.getTeachers(classRecord.id);
    
    res.json({
      class: {
        ...classRecord,
        studentCount,
        teachers: teachers.map(t => ({
          id: t.id,
          firstName: t.first_name,
          lastName: t.last_name,
          role: t.role,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting class:", error);
    res.status(500).json({ message: "Error fetching class", error: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const classRecord = await classService.create(req.body);
    res.status(201).json({ message: "Class created successfully", class: classRecord });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Error creating class", error: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classRecord = await classService.update(id, req.body);
    if (!classRecord) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class updated successfully", class: classRecord });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Error updating class", error: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await classService.delete(id);
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Error deleting class", error: error.message });
  }
};

