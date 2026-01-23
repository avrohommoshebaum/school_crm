/**
 * Division Controller
 * CRUD operations for divisions (admin and head principal)
 */

import { divisionService } from "../db/services/divisionService.js";
import { gradeService } from "../db/services/gradeService.js";

export const getAllDivisions = async (req, res) => {
  try {
    const divisions = await divisionService.findAll();
    
    // Get grades for each division
    const divisionsWithGrades = await Promise.all(
      divisions.map(async (division) => {
        const grades = await divisionService.getGrades(division.id);
        return {
          ...division,
          grades,
          gradeCount: grades.length,
        };
      })
    );
    
    res.json({ divisions: divisionsWithGrades });
  } catch (error) {
    console.error("Error getting divisions:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error fetching divisions", error);
  }
};

export const getDivisionById = async (req, res) => {
  try {
    const division = await divisionService.findById(req.params.id);
    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }
    
    const grades = await divisionService.getGrades(division.id);
    res.json({ division: { ...division, grades } });
  } catch (error) {
    console.error("Error getting division:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error fetching division", error);
  }
};

export const createDivision = async (req, res) => {
  try {
    const { name, description, gradeIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Division name is required" });
    }

    // Create division
    const division = await divisionService.create({
      name: name.trim(),
      description: description?.trim() || null,
    });

    // Add grades to division if provided
    if (gradeIds && Array.isArray(gradeIds)) {
      for (const gradeId of gradeIds) {
        try {
          await divisionService.addGrade(division.id, gradeId);
        } catch (err) {
          console.error(`Error adding grade ${gradeId} to division:`, err);
        }
      }
    }

    // Get grades for response
    const grades = await divisionService.getGrades(division.id);
    res.status(201).json({ 
      message: "Division created successfully", 
      division: { ...division, grades } 
    });
  } catch (error) {
    console.error("Error creating division:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error creating division", error);
  }
};

export const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, gradeIds } = req.body;

    // Update division basic info
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;

    const division = await divisionService.update(id, updates);
    if (!division) {
      return res.status(404).json({ message: "Division not found" });
    }

    // Update grades if provided
    if (gradeIds !== undefined && Array.isArray(gradeIds)) {
      // Get current grades
      const currentGrades = await divisionService.getGrades(id);
      const currentGradeIds = new Set(currentGrades.map(g => g.id));
      const newGradeIds = new Set(gradeIds);

      // Remove grades not in new list
      for (const grade of currentGrades) {
        if (!newGradeIds.has(grade.id)) {
          await divisionService.removeGrade(id, grade.id);
        }
      }

      // Add new grades
      for (const gradeId of gradeIds) {
        if (!currentGradeIds.has(gradeId)) {
          try {
            await divisionService.addGrade(id, gradeId);
          } catch (err) {
            console.error(`Error adding grade ${gradeId} to division:`, err);
          }
        }
      }
    }

    // Get updated grades
    const grades = await divisionService.getGrades(id);
    res.json({ 
      message: "Division updated successfully", 
      division: { ...division, grades } 
    });
  } catch (error) {
    console.error("Error updating division:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error updating division", error);
  }
};

export const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    await divisionService.delete(id);
    res.json({ message: "Division deleted successfully" });
  } catch (error) {
    console.error("Error deleting division:", error);
    const { sendErrorResponse } = await import("../utils/errorHandler.js");
    sendErrorResponse(res, 500, "Error deleting division", error);
  }
};
