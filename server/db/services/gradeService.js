/**
 * Grade Service - PostgreSQL Implementation
 * Handles all grade-related database operations
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to grade object
const rowToGrade = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    level: row.level,
    description: row.description,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const gradeService = {
  async findAll() {
    const result = await query("SELECT * FROM grades ORDER BY level ASC");
    return result.rows.map(row => rowToGrade(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM grades WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToGrade(result.rows[0]) : null;
  },

  async findByName(name) {
    if (!name) return null;
    const result = await query("SELECT * FROM grades WHERE name = $1", [name]);
    return result.rows.length > 0 ? rowToGrade(result.rows[0]) : null;
  },

  async create(gradeData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO grades (name, level, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        gradeData.name,
        gradeData.level,
        gradeData.description || null,
        now,
        now,
      ]
    );
    return rowToGrade(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid grade id");
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.level !== undefined) {
      fields.push(`level = $${paramIndex++}`);
      values.push(updates.level);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE grades SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToGrade(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid grade id");
    }
    await query("DELETE FROM grades WHERE id = $1", [id]);
    return true;
  },
};

