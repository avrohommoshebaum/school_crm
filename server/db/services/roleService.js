/**
 * Role Service - PostgreSQL Implementation
 * 
 * This service handles all role-related database operations using PostgreSQL
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to role object
const rowToRole = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    display_name: row.display_name, // Keep both for compatibility
    description: row.description,
    color: row.color,
    isSystem: row.is_system,
    is_system: row.is_system, // Keep both for compatibility
    permissions: row.permissions, // Already JSONB, will be object
    createdAt: row.created_at,
    created_at: row.created_at, // Keep both for compatibility
    updatedAt: row.updated_at,
    updated_at: row.updated_at, // Keep both for compatibility
  };
};

export const roleService = {
  async findById(id) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      return null;
    }
    
    const result = await query("SELECT * FROM roles WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToRole(result.rows[0]) : null;
  },

  async findByName(name) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      return null;
    }

    const result = await query("SELECT * FROM roles WHERE name = $1 LIMIT 1", [name]);
    return result.rows.length > 0 ? rowToRole(result.rows[0]) : null;
  },

  async findByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const result = await query("SELECT * FROM roles WHERE id = ANY($1)", [ids]);
    return result.rows.map(row => rowToRole(row));
  },

  async findAll() {
    const result = await query(`
      SELECT * FROM roles 
      ORDER BY is_system DESC, display_name ASC
    `);
    
    return result.rows.map(row => rowToRole(row));
  },

  async create(roleData) {
    const now = new Date();

    const result = await query(
      `INSERT INTO roles (name, display_name, description, color, is_system, permissions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        roleData.name,
        roleData.displayName || roleData.display_name,
        roleData.description || null,
        roleData.color || null,
        roleData.isSystem !== undefined ? roleData.isSystem : (roleData.is_system !== undefined ? roleData.is_system : false),
        JSON.stringify(roleData.permissions || {}),
        now,
        now,
      ]
    );

    return rowToRole(result.rows[0]);
  },

  async update(id, updates) {
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.displayName !== undefined || updates.display_name !== undefined) {
      updateFields.push(`display_name = $${paramIndex++}`);
      values.push(updates.displayName || updates.display_name);
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.color !== undefined) {
      updateFields.push(`color = $${paramIndex++}`);
      values.push(updates.color);
    }
    if (updates.isSystem !== undefined || updates.is_system !== undefined) {
      updateFields.push(`is_system = $${paramIndex++}`);
      values.push(updates.isSystem !== undefined ? updates.isSystem : updates.is_system);
    }
    if (updates.permissions !== undefined) {
      updateFields.push(`permissions = $${paramIndex++}`);
      values.push(JSON.stringify(updates.permissions));
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE roles 
       SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToRole(result.rows[0]) : null;
  },

  async delete(id) {
    // First check if any users have this role
    const usersResult = await query(
      "SELECT id FROM users WHERE $1 = ANY(roles) LIMIT 1",
      [id]
    );

    if (usersResult.rows.length > 0) {
      throw new Error("Cannot delete role: role is assigned to one or more users");
    }

    const result = await query("DELETE FROM roles WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  },

  async findAllWithUserCount() {
    const roles = await this.findAll();
    
    // Get user count for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const result = await query(
          "SELECT COUNT(*) as count FROM users WHERE $1 = ANY(roles)",
          [role.id]
        );
        return {
          ...role,
          userCount: parseInt(result.rows[0].count, 10),
        };
      })
    );

    return rolesWithCounts;
  },
};
