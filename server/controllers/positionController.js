/**
 * Position Controller
 * CRUD operations for system-wide positions
 */

import { positionService } from "../db/services/positionService.js";

export const getAllPositions = async (req, res) => {
  try {
    const { isActive, category, search, limit, offset } = req.query;
    const positions = await positionService.findAll({
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      category,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    res.json({ positions });
  } catch (error) {
    console.error("Error getting positions:", error);
    res.status(500).json({ message: "Error fetching positions", error: error.message });
  }
};

export const getPositionById = async (req, res) => {
  try {
    const position = await positionService.findById(req.params.id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json({ position });
  } catch (error) {
    console.error("Error getting position:", error);
    res.status(500).json({ message: "Error fetching position", error: error.message });
  }
};

export const createPosition = async (req, res) => {
  try {
    const position = await positionService.create(req.body);
    res.status(201).json({ message: "Position created successfully", position });
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ message: "Error creating position", error: error.message });
  }
};

export const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await positionService.update(id, req.body);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json({ message: "Position updated successfully", position });
  } catch (error) {
    console.error("Error updating position:", error);
    res.status(500).json({ message: "Error updating position", error: error.message });
  }
};

export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    await positionService.delete(id);
    res.json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("Error deleting position:", error);
    res.status(500).json({ message: "Error deleting position", error: error.message });
  }
};

