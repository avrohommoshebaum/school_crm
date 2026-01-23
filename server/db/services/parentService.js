/**
 * Parent Service - PostgreSQL Implementation
 * Handles all parent/guardian-related database operations
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to parent object
const rowToParent = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    familyId: row.family_id,
    family_id: row.family_id,
    firstName: row.first_name,
    first_name: row.first_name,
    lastName: row.last_name,
    last_name: row.last_name,
    relationship: row.relationship,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    zip_code: row.zip_code,
    isPrimaryContact: row.is_primary_contact,
    is_primary_contact: row.is_primary_contact,
    canPickup: row.can_pickup,
    can_pickup: row.can_pickup,
    emergencyContact: row.emergency_contact,
    emergency_contact: row.emergency_contact,
    notes: row.notes,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const parentService = {
  async findAll(options = {}) {
    let sql = "SELECT * FROM parents WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (options.familyId) {
      sql += ` AND family_id = $${paramIndex++}`;
      params.push(options.familyId);
    }

    if (options.search) {
      sql += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    sql += " ORDER BY last_name, first_name";

    if (options.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(options.limit);
      if (options.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }
    }

    const result = await query(sql, params);
    return result.rows.map(row => rowToParent(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM parents WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToParent(result.rows[0]) : null;
  },

  async findByEmail(email) {
    if (!email) return null;
    const result = await query("SELECT * FROM parents WHERE LOWER(email) = LOWER($1)", [email]);
    return result.rows.length > 0 ? rowToParent(result.rows[0]) : null;
  },

  async findByFamilyId(familyId) {
    if (!familyId) return [];
    const result = await query(
      "SELECT * FROM parents WHERE family_id = $1 ORDER BY is_primary_contact DESC, last_name, first_name",
      [familyId]
    );
    return result.rows.map(row => rowToParent(row));
  },

  async create(parentData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO parents (
        user_id, family_id, first_name, last_name, relationship, phone, email,
        address, city, state, zip_code, is_primary_contact, can_pickup,
        emergency_contact, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        parentData.userId || parentData.user_id || null,
        parentData.familyId || parentData.family_id || null,
        parentData.firstName || parentData.first_name,
        parentData.lastName || parentData.last_name,
        parentData.relationship || null,
        parentData.phone || null,
        parentData.email || null,
        parentData.address || null,
        parentData.city || null,
        parentData.state || null,
        parentData.zipCode || parentData.zip_code || null,
        parentData.isPrimaryContact || parentData.is_primary_contact || false,
        parentData.canPickup || parentData.can_pickup !== false,
        parentData.emergencyContact || parentData.emergency_contact || false,
        parentData.notes || null,
        now,
        now,
      ]
    );
    return rowToParent(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid parent id");
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      userId: 'user_id',
      user_id: 'user_id',
      familyId: 'family_id',
      family_id: 'family_id',
      firstName: 'first_name',
      first_name: 'first_name',
      lastName: 'last_name',
      last_name: 'last_name',
      relationship: 'relationship',
      phone: 'phone',
      email: 'email',
      address: 'address',
      city: 'city',
      state: 'state',
      zipCode: 'zip_code',
      zip_code: 'zip_code',
      isPrimaryContact: 'is_primary_contact',
      is_primary_contact: 'is_primary_contact',
      canPickup: 'can_pickup',
      can_pickup: 'can_pickup',
      emergencyContact: 'emergency_contact',
      emergency_contact: 'emergency_contact',
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
      `UPDATE parents SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToParent(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid parent id");
    }
    await query("DELETE FROM parents WHERE id = $1", [id]);
    return true;
  },

  // Link parent to student
  async linkToStudent(parentId, studentId, relationship = null, isPrimary = false) {
    if (!parentId || !studentId) {
      throw new Error("Parent ID and Student ID are required");
    }
    const result = await query(
      `INSERT INTO student_parents (student_id, parent_id, relationship, is_primary)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, parent_id) 
       DO UPDATE SET relationship = $3, is_primary = $4
       RETURNING *`,
      [studentId, parentId, relationship, isPrimary]
    );
    return result.rows[0];
  },

  // Unlink parent from student
  async unlinkFromStudent(parentId, studentId) {
    if (!parentId || !studentId) {
      throw new Error("Parent ID and Student ID are required");
    }
    await query(
      "DELETE FROM student_parents WHERE parent_id = $1 AND student_id = $2",
      [parentId, studentId]
    );
    return true;
  },
};
