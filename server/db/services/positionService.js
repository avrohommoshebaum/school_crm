/**
 * Position Service
 * Handles system-wide positions (Teacher, Principal, etc.)
 */

import { query } from "../postgresConnect.js";

const rowToPosition = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const positionService = {
  async findAll(options = {}) {
    let sql = "SELECT * FROM positions WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (options.isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(options.isActive);
    }

    if (options.category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(options.category);
    }

    if (options.search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    sql += " ORDER BY category, name";

    if (options.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(options.limit);
    }

    if (options.offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(options.offset);
    }

    const result = await query(sql, params);
    return result.rows.map(rowToPosition);
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM positions WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToPosition(result.rows[0]) : null;
  },

  async findByName(name) {
    if (!name) return null;
    const result = await query("SELECT * FROM positions WHERE name = $1", [name]);
    return result.rows.length > 0 ? rowToPosition(result.rows[0]) : null;
  },

  async create(positionData) {
    const result = await query(
      `INSERT INTO positions (name, description, category, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        positionData.name,
        positionData.description || null,
        positionData.category || null,
        positionData.isActive !== undefined ? positionData.isActive : true,
      ]
    );
    return rowToPosition(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid position id");
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      name: 'name',
      description: 'description',
      category: 'category',
      isActive: 'is_active',
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key] && value !== undefined) {
        fields.push(`${fieldMap[key]} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE positions SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToPosition(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid position id");
    }
    await query("DELETE FROM positions WHERE id = $1", [id]);
    return true;
  },
};

