/**
 * Group Service - PostgreSQL Implementation
 * 
 * This service handles all communication group-related database operations using PostgreSQL
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to group object
const rowToGroup = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    pin: row.pin,
    memberCount: row.member_count,
    member_count: row.member_count, // Keep both for compatibility
    createdAt: row.created_at,
    created_at: row.created_at, // Keep both for compatibility
    updatedAt: row.updated_at,
    updated_at: row.updated_at, // Keep both for compatibility
  };
};

export const groupService = {
  async findAll() {
    const result = await query("SELECT * FROM communication_groups ORDER BY created_at DESC");
    return result.rows.map(row => rowToGroup(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM communication_groups WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToGroup(result.rows[0]) : null;
  },

  async findByPin(pin) {
    if (!pin) return null;
    const result = await query("SELECT * FROM communication_groups WHERE pin = $1 LIMIT 1", [pin]);
    return result.rows.length > 0 ? rowToGroup(result.rows[0]) : null;
  },

  async generateUniquePin() {
    let pin;
    let exists = true;
    let attempts = 0;
    const maxAttempts = 100;

    while (exists && attempts < maxAttempts) {
      // Generate 4-digit PIN
      pin = Math.floor(1000 + Math.random() * 9000).toString();
      const existing = await this.findByPin(pin);
      exists = !!existing;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique PIN after multiple attempts");
    }

    return pin;
  },

  async create(groupData) {
    const now = new Date();

    // Generate unique PIN if not provided
    let pin = groupData.pin;
    if (!pin) {
      pin = await this.generateUniquePin();
    } else {
      // Check if PIN already exists
      const existing = await this.findByPin(pin);
      if (existing) {
        throw new Error(`PIN ${pin} already exists`);
      }
    }

    const result = await query(
      `INSERT INTO communication_groups (name, description, pin, member_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        groupData.name,
        groupData.description || null,
        pin,
        groupData.memberCount || groupData.member_count || 0,
        now,
        now,
      ]
    );

    return rowToGroup(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid group id");
    }

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.pin !== undefined) {
      // Check if PIN already exists (excluding current group)
      const existing = await this.findByPin(updates.pin);
      if (existing && existing.id !== id) {
        throw new Error(`PIN ${updates.pin} already exists`);
      }
      updateFields.push(`pin = $${paramIndex++}`);
      values.push(updates.pin);
    }
    if (updates.memberCount !== undefined || updates.member_count !== undefined) {
      updateFields.push(`member_count = $${paramIndex++}`);
      values.push(updates.memberCount !== undefined ? updates.memberCount : updates.member_count);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE communication_groups 
       SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToGroup(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid group id");
    }

    // Delete all members first (CASCADE will handle this, but explicit is clearer)
    const { groupMemberService } = await import("./groupMemberService.js");
    await groupMemberService.deleteByGroupId(id);

    // Delete the group
    const result = await query("DELETE FROM communication_groups WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  },

  async updateMemberCount(groupId) {
    if (!groupId) return null;

    // Count members for this group
    const countResult = await query(
      "SELECT COUNT(*) as count FROM group_members WHERE group_id = $1",
      [groupId]
    );

    const memberCount = parseInt(countResult.rows[0].count, 10);

    // Update the group's member count
    const result = await query(
      `UPDATE communication_groups 
       SET member_count = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [memberCount, groupId]
    );

    return result.rows.length > 0 ? rowToGroup(result.rows[0]) : null;
  },
};
