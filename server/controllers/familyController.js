/**
 * Family Controller
 * CRUD operations for families
 */

import { familyService } from "../db/services/familyService.js";

export const getAllFamilies = async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    const families = await familyService.findAll({
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    res.json({ families });
  } catch (error) {
    console.error("Error getting families:", error);
    res.status(500).json({ message: "Error fetching families", error: error.message });
  }
};

export const getFamilyById = async (req, res) => {
  try {
    const family = await familyService.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }
    
    // Get additional info
    const students = await familyService.getStudents(family.id);
    const parents = await familyService.getParents(family.id);
    
    res.json({
      family: {
        ...family,
        students,
        parents,
      },
    });
  } catch (error) {
    console.error("Error getting family:", error);
    res.status(500).json({ message: "Error fetching family", error: error.message });
  }
};

export const createFamily = async (req, res) => {
  try {
    const family = await familyService.create(req.body);
    res.status(201).json({ message: "Family created successfully", family });
  } catch (error) {
    console.error("Error creating family:", error);
    res.status(500).json({ message: "Error creating family", error: error.message });
  }
};

export const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const family = await familyService.update(id, req.body);
    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }
    res.json({ message: "Family updated successfully", family });
  } catch (error) {
    console.error("Error updating family:", error);
    res.status(500).json({ message: "Error updating family", error: error.message });
  }
};

export const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;
    await familyService.delete(id);
    res.json({ message: "Family deleted successfully" });
  } catch (error) {
    console.error("Error deleting family:", error);
    res.status(500).json({ message: "Error deleting family", error: error.message });
  }
};

