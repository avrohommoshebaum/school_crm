/**
 * Grade Controller
 * CRUD operations for grades (admin only)
 */

import { gradeService } from "../db/services/gradeService.js";

export const getAllGrades = async (req, res) => {
  try {
    const grades = await gradeService.findAll();
    res.json({ grades });
  } catch (error) {
    console.error("Error getting grades:", error);
    res.status(500).json({ message: "Error fetching grades", error: error.message });
  }
};

export const getGradeById = async (req, res) => {
  try {
    const grade = await gradeService.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.json({ grade });
  } catch (error) {
    console.error("Error getting grade:", error);
    res.status(500).json({ message: "Error fetching grade", error: error.message });
  }
};

export const createGrade = async (req, res) => {
  try {
    const { name, level, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Grade name is required" });
    }

    if (level === undefined || level === null) {
      return res.status(400).json({ message: "Grade level is required" });
    }

    const grade = await gradeService.create({ name: name.trim(), level, description });
    res.status(201).json({ message: "Grade created successfully", grade });
  } catch (error) {
    console.error("Error creating grade:", error);
    res.status(500).json({ message: "Error creating grade", error: error.message });
  }
};

export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const grade = await gradeService.update(id, updates);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    res.json({ message: "Grade updated successfully", grade });
  } catch (error) {
    console.error("Error updating grade:", error);
    res.status(500).json({ message: "Error updating grade", error: error.message });
  }
};

export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    await gradeService.delete(id);
    res.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade:", error);
    res.status(500).json({ message: "Error deleting grade", error: error.message });
  }
};

