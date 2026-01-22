/**
 * Division Service - PostgreSQL Implementation
 * Handles all division-related database operations
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to division object
const rowToDivision = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const divisionService = {
  async findAll() {
    const result = await query("SELECT * FROM divisions ORDER BY name ASC");
    return result.rows.map(row => rowToDivision(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM divisions WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToDivision(result.rows[0]) : null;
  },

  async findByName(name) {
    if (!name) return null;
    const result = await query("SELECT * FROM divisions WHERE name = $1", [name]);
    return result.rows.length > 0 ? rowToDivision(result.rows[0]) : null;
  },

  async create(divisionData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO divisions (name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        divisionData.name,
        divisionData.description || null,
        now,
        now,
      ]
    );
    return rowToDivision(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid division id");
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = $${paramCount++}`);
    values.push(new Date());

    values.push(id);

    const result = await query(
      `UPDATE divisions SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToDivision(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid division id");
    }
    await query("DELETE FROM divisions WHERE id = $1", [id]);
    return true;
  },

  // Get grades in a division
  async getGrades(divisionId) {
    const result = await query(
      `SELECT g.* FROM grades g
       INNER JOIN division_grades dg ON g.id = dg.grade_id
       WHERE dg.division_id = $1
       ORDER BY g.level ASC`,
      [divisionId]
    );
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      level: row.level,
      description: row.description,
    }));
  },

  // Add grade to division
  async addGrade(divisionId, gradeId) {
    try {
      await query(
        `INSERT INTO division_grades (division_id, grade_id)
         VALUES ($1, $2)
         ON CONFLICT (division_id, grade_id) DO NOTHING`,
        [divisionId, gradeId]
      );
      return true;
    } catch (error) {
      throw new Error(`Error adding grade to division: ${error.message}`);
    }
  },

  // Remove grade from division
  async removeGrade(divisionId, gradeId) {
    await query(
      "DELETE FROM division_grades WHERE division_id = $1 AND grade_id = $2",
      [divisionId, gradeId]
    );
    return true;
  },

  // Get divisions for a grade
  async getDivisionsForGrade(gradeId) {
    const result = await query(
      `SELECT d.* FROM divisions d
       INNER JOIN division_grades dg ON d.id = dg.division_id
       WHERE dg.grade_id = $1
       ORDER BY d.name ASC`,
      [gradeId]
    );
    return result.rows.map(row => rowToDivision(row));
  },
};
