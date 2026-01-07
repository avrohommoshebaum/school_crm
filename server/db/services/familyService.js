/**
 * Family Service - PostgreSQL Implementation
 * Handles all family-related database operations
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to family object
const rowToFamily = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    familyName: row.family_name,
    family_name: row.family_name,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    zip_code: row.zip_code,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const familyService = {
  async findAll(options = {}) {
    let sql = "SELECT * FROM families WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (options.search) {
      sql += ` AND (family_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    sql += " ORDER BY family_name";

    if (options.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(options.limit);
      if (options.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }
    }

    const result = await query(sql, params);
    return result.rows.map(row => rowToFamily(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM families WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToFamily(result.rows[0]) : null;
  },

  async getStudents(familyId) {
    if (!familyId) return [];
    const result = await query(
      "SELECT * FROM students WHERE family_id = $1 ORDER BY last_name, first_name",
      [familyId]
    );
    return result.rows;
  },

  async getParents(familyId) {
    if (!familyId) return [];
    const result = await query(
      "SELECT * FROM parents WHERE family_id = $1 ORDER BY is_primary_contact DESC, last_name, first_name",
      [familyId]
    );
    return result.rows;
  },

  async create(familyData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO families (
        family_name, address, city, state, zip_code, phone, email, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        familyData.familyName || familyData.family_name || null,
        familyData.address || null,
        familyData.city || null,
        familyData.state || null,
        familyData.zipCode || familyData.zip_code || null,
        familyData.phone || null,
        familyData.email || null,
        familyData.notes || null,
        now,
        now,
      ]
    );
    return rowToFamily(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid family id");
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      familyName: 'family_name',
      family_name: 'family_name',
      address: 'address',
      city: 'city',
      state: 'state',
      zipCode: 'zip_code',
      zip_code: 'zip_code',
      phone: 'phone',
      email: 'email',
      notes: 'notes',
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
      `UPDATE families SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToFamily(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid family id");
    }
    await query("DELETE FROM families WHERE id = $1", [id]);
    return true;
  },
};

