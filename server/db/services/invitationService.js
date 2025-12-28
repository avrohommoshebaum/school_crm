/**
 * Invitation Service - PostgreSQL Implementation
 * 
 * This service handles all invitation-related database operations using PostgreSQL
 */

import { query } from "../postgresConnect.js";
import { roleService } from "./roleService.js";

// Helper to convert database row to invitation object
const rowToInvitation = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    email: row.email,
    token: row.token,
    roleIds: row.role_ids || [],
    role_ids: row.role_ids || [], // Keep both for compatibility
    accepted: row.accepted,
    expiresAt: row.expires_at,
    expires_at: row.expires_at, // Keep both for compatibility
    createdAt: row.created_at,
    created_at: row.created_at, // Keep both for compatibility
    updatedAt: row.updated_at,
    updated_at: row.updated_at, // Keep both for compatibility
  };
};

export const invitationService = {
  async findByToken(token) {
    if (!token) return null;
    const result = await query("SELECT * FROM invitations WHERE token = $1 LIMIT 1", [token]);
    return result.rows.length > 0 ? rowToInvitation(result.rows[0]) : null;
  },

  async findByEmail(email) {
    if (!email) return null;
    const result = await query("SELECT * FROM invitations WHERE LOWER(email) = LOWER($1) LIMIT 1", [email]);
    return result.rows.length > 0 ? rowToInvitation(result.rows[0]) : null;
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM invitations WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToInvitation(result.rows[0]) : null;
  },

  async findAll() {
    const result = await query("SELECT * FROM invitations ORDER BY created_at DESC");
    return result.rows.map(row => rowToInvitation(row));
  },

  async create(invitationData) {
    const now = new Date();

    const result = await query(
      `INSERT INTO invitations (email, token, role_ids, accepted, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        (invitationData.email || "").toLowerCase(),
        invitationData.token,
        invitationData.roleIds || invitationData.role_ids || [],
        invitationData.accepted || false,
        invitationData.expiresAt || invitationData.expires_at || null,
        now,
        now,
      ]
    );

    return rowToInvitation(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid invitation id");
    }

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.email !== undefined) {
      updateFields.push(`email = $${paramIndex++}`);
      values.push((updates.email || "").toLowerCase());
    }
    if (updates.token !== undefined) {
      updateFields.push(`token = $${paramIndex++}`);
      values.push(updates.token);
    }
    if (updates.roleIds !== undefined || updates.role_ids !== undefined) {
      updateFields.push(`role_ids = $${paramIndex++}`);
      values.push(updates.roleIds || updates.role_ids || []);
    }
    if (updates.accepted !== undefined) {
      updateFields.push(`accepted = $${paramIndex++}`);
      values.push(updates.accepted);
    }
    if (updates.expiresAt !== undefined || updates.expires_at !== undefined) {
      updateFields.push(`expires_at = $${paramIndex++}`);
      values.push(updates.expiresAt || updates.expires_at);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE invitations 
       SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToInvitation(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid invitation id");
    }

    const result = await query("DELETE FROM invitations WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  },

  async deleteByToken(token) {
    if (!token) return false;
    const result = await query("DELETE FROM invitations WHERE token = $1 RETURNING id", [token]);
    return result.rows.length > 0;
  },

  async populateRoles(invitation) {
    if (!invitation || !invitation.roleIds || !Array.isArray(invitation.roleIds) || invitation.roleIds.length === 0) {
      return { ...invitation, roles: [] };
    }

    const roles = await roleService.findByIds(invitation.roleIds);
    return {
      ...invitation,
      roles: roles.filter((r) => r !== null),
    };
  },

  async cleanupExpired() {
    const result = await query(
      "DELETE FROM invitations WHERE expires_at < CURRENT_TIMESTAMP RETURNING id"
    );
    return result.rows.length;
  },
};
