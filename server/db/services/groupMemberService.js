/**
 * Group Member Service - PostgreSQL Implementation
 * 
 * This service handles all group member-related database operations using PostgreSQL
 */

import { query } from "../postgresConnect.js";
import { normalizePhone } from "../../utils/validation.js";
import { groupService } from "./groupService.js";

// Helper to convert database row to member object
const rowToMember = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    groupId: row.group_id,
    group_id: row.group_id, // Keep both for compatibility
    firstName: row.first_name,
    first_name: row.first_name, // Keep both for compatibility
    lastName: row.last_name,
    last_name: row.last_name, // Keep both for compatibility
    name: row.name, // Legacy field
    emails: row.emails || [], // TEXT[] array
    phones: row.phones || [], // TEXT[] array (normalized)
    // Legacy fields for backward compatibility
    email: row.emails && row.emails.length > 0 ? row.emails[0] : "",
    phone: row.phones && row.phones.length > 0 ? row.phones[0] : "",
    createdAt: row.created_at,
    created_at: row.created_at, // Keep both for compatibility
    updatedAt: row.updated_at,
    updated_at: row.updated_at, // Keep both for compatibility
  };
};

export const groupMemberService = {
  async findByGroupId(groupId) {
    if (!groupId) return [];
    
    // Query with ORDER BY (PostgreSQL supports this natively)
    const result = await query(
      `SELECT * FROM group_members 
       WHERE group_id = $1 
       ORDER BY 
         COALESCE(last_name, '') ASC,
         COALESCE(first_name, '') ASC,
         COALESCE(name, '') ASC`,
      [groupId]
    );

    return result.rows.map(row => rowToMember(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM group_members WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToMember(result.rows[0]) : null;
  },

  async existsInGroup(groupId, emails, phones, excludeMemberId = null) {
    // Normalize inputs to arrays
    const emailArray = Array.isArray(emails) ? emails : emails ? [emails] : [];
    const normalizedEmails = emailArray.map(e => (e?.toLowerCase?.() || "").trim()).filter(e => e);
    
    const phoneArray = Array.isArray(phones) ? phones : phones ? [phones] : [];
    const normalizedPhones = phoneArray.map(p => normalizePhone(String(p || ""))).filter(p => p);

    if (normalizedEmails.length === 0 && normalizedPhones.length === 0) {
      return null; // No data to check
    }

    // Build query to find conflicts
    let querySql = "SELECT * FROM group_members WHERE group_id = $1 AND (";
    const params = [groupId];
    let paramIndex = 2;
    const conditions = [];

    // Check for email conflicts (using array overlap operator)
    if (normalizedEmails.length > 0) {
      conditions.push(`emails && $${paramIndex++}`);
      params.push(normalizedEmails);
    }

    // Check for phone conflicts (using array overlap operator, but need to normalize existing phones)
    // For phones, we need to check normalized versions
    if (normalizedPhones.length > 0) {
      // Get all members and check normalized phones
      const allMembersResult = await query(
        "SELECT id, emails, phones FROM group_members WHERE group_id = $1",
        [groupId]
      );

      const conflicts = { emails: [], phones: [] };

      for (const member of allMembersResult.rows) {
        // Skip excluded member
        if (excludeMemberId && member.id === excludeMemberId) {
          continue;
        }

        // Check email matches
        const memberEmails = (member.emails || []).map(e => e?.toLowerCase?.() || "").filter(e => e);
        for (const email of normalizedEmails) {
          if (memberEmails.includes(email) && !conflicts.emails.includes(email)) {
            conflicts.emails.push(email);
          }
        }

        // Check phone matches (normalize member phones)
        const memberPhones = (member.phones || []).map(p => normalizePhone(String(p || ""))).filter(p => p);
        for (const phone of normalizedPhones) {
          if (memberPhones.includes(phone) && !conflicts.phones.includes(phone)) {
            conflicts.phones.push(phone);
          }
        }
      }

      if (conflicts.emails.length > 0 || conflicts.phones.length > 0) {
        return conflicts;
      }

      return null; // No conflicts found
    }

    // If only checking emails
    if (normalizedEmails.length > 0 && normalizedPhones.length === 0) {
      if (excludeMemberId) {
        querySql += `id != $${paramIndex++} AND (`;
        params.push(excludeMemberId);
      }
      querySql += conditions.join(" OR ");
      querySql += ")";
      
      const result = await query(querySql, params);
      
      if (result.rows.length > 0) {
        // Extract conflicting emails
        const conflicts = { emails: [], phones: [] };
        for (const member of result.rows) {
          const memberEmails = (member.emails || []).map(e => e?.toLowerCase?.() || "").filter(e => e);
          for (const email of normalizedEmails) {
            if (memberEmails.includes(email) && !conflicts.emails.includes(email)) {
              conflicts.emails.push(email);
            }
          }
        }
        return conflicts;
      }
    }

    return null; // No conflicts
  },

  async create(memberData) {
    const now = new Date();

    // Use normalized data from memberData (should come from validation)
    const emails = memberData.emails || [];
    const phones = memberData.phones || [];

    // Check for duplicates
    if (emails.length > 0 || phones.length > 0) {
      const conflicts = await this.existsInGroup(
        memberData.groupId,
        emails,
        phones,
        null
      );
      if (conflicts) {
        const conflictMessages = [];
        if (conflicts.emails.length > 0) {
          conflictMessages.push(`Email${conflicts.emails.length > 1 ? "s" : ""}: ${conflicts.emails.join(", ")}`);
        }
        if (conflicts.phones.length > 0) {
          conflictMessages.push(`Phone${conflicts.phones.length > 1 ? "s" : ""}: ${conflicts.phones.join(", ")}`);
        }
        throw new Error(`Member with this ${conflictMessages.join(" and ")} already exists in this group`);
      }
    }

    // Normalize all phones before storing
    const normalizedPhones = phones.map(p => normalizePhone(String(p || ""))).filter(p => p);

    // Build name from firstName/lastName if provided, otherwise use name
    const fullName = memberData.firstName || memberData.lastName
      ? `${(memberData.firstName || "").trim()} ${(memberData.lastName || "").trim()}`.trim()
      : memberData.name || "";

    const result = await query(
      `INSERT INTO group_members (
        group_id, first_name, last_name, name, emails, phones, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        memberData.groupId,
        memberData.firstName || null,
        memberData.lastName || null,
        fullName || null,
        emails,
        normalizedPhones,
        now,
        now,
      ]
    );

    // Member count is updated automatically by trigger, but we can verify
    // The trigger will update member_count automatically

    return rowToMember(result.rows[0]);
  },

  async createMany(membersData) {
    if (!membersData || membersData.length === 0) return [];
    
    const groupId = membersData[0]?.groupId;
    if (!groupId) {
      throw new Error("groupId is required");
    }

    const created = [];
    const now = new Date();

    // Use a transaction for bulk insert
    for (const memberData of membersData) {
      const emails = memberData.emails
        ? (Array.isArray(memberData.emails) ? memberData.emails : [memberData.emails])
            .map(e => (e?.trim().toLowerCase() || ""))
            .filter(e => e)
        : memberData.email
        ? [memberData.email.trim().toLowerCase()]
        : [];

      const phones = memberData.phones
        ? (Array.isArray(memberData.phones) ? memberData.phones : [memberData.phones])
            .map(p => p?.trim())
            .filter(p => p)
        : memberData.phone
        ? [memberData.phone.trim()]
        : [];

      const normalizedPhones = phones.map(p => normalizePhone(String(p || ""))).filter(p => p);

      const fullName = memberData.firstName || memberData.lastName
        ? `${(memberData.firstName || "").trim()} ${(memberData.lastName || "").trim()}`.trim()
        : memberData.name || "";

      const result = await query(
        `INSERT INTO group_members (
          group_id, first_name, last_name, name, emails, phones, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          groupId,
          memberData.firstName || null,
          memberData.lastName || null,
          fullName || null,
          emails,
          normalizedPhones,
          now,
          now,
        ]
      );

      created.push(rowToMember(result.rows[0]));
    }

    // Member count is updated automatically by trigger

    return created;
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid member id");
    }

    // Get current member
    const current = await this.findById(id);
    if (!current) {
      throw new Error("Member not found");
    }

    // Handle name updates
    let firstName = current.firstName;
    let lastName = current.lastName;
    let fullName = current.name || "";

    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      firstName = updates.firstName !== undefined ? updates.firstName : current.firstName || "";
      lastName = updates.lastName !== undefined ? updates.lastName : current.lastName || "";
      fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    } else if (updates.name !== undefined) {
      fullName = String(updates.name || "").trim();
      const nameParts = fullName.split(/\s+/);
      if (nameParts.length >= 2) {
        firstName = nameParts.slice(0, -1).join(" ");
        lastName = nameParts[nameParts.length - 1];
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = "";
      }
    }

    // Handle emails
    let emails = current.emails || [];
    if (updates.emails !== undefined) {
      emails = Array.isArray(updates.emails)
        ? updates.emails.map(e => (e?.trim().toLowerCase() || "")).filter(e => e)
        : updates.emails
        ? [updates.emails.trim().toLowerCase()]
        : [];
    } else if (updates.email !== undefined) {
      emails = updates.email ? [updates.email.trim().toLowerCase()] : [];
    }

    // Handle phones
    let phones = current.phones || [];
    if (updates.phones !== undefined) {
      const phoneArray = Array.isArray(updates.phones) ? updates.phones : [updates.phones];
      phones = phoneArray.map(p => normalizePhone(String(p || ""))).filter(p => p);
    } else if (updates.phone !== undefined) {
      const normalized = normalizePhone(String(updates.phone || ""));
      phones = normalized ? [normalized] : [];
    }

    // Check for duplicates if emails/phones are changing
    if (emails.length > 0 || phones.length > 0) {
      const conflicts = await this.existsInGroup(
        current.groupId,
        emails,
        phones,
        id
      );

      if (conflicts) {
        const conflictMessages = [];
        if (conflicts.emails.length > 0) {
          conflictMessages.push(`Email${conflicts.emails.length > 1 ? "s" : ""}: ${conflicts.emails.join(", ")}`);
        }
        if (conflicts.phones.length > 0) {
          conflictMessages.push(`Phone${conflicts.phones.length > 1 ? "s" : ""}: ${conflicts.phones.join(", ")}`);
        }
        throw new Error(`Member with this ${conflictMessages.join(" and ")} already exists in this group`);
      }
    }

    // Build update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.firstName !== undefined || updates.lastName !== undefined || updates.name !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      values.push(firstName || null);
      updateFields.push(`last_name = $${paramIndex++}`);
      values.push(lastName || null);
      updateFields.push(`name = $${paramIndex++}`);
      values.push(fullName || null);
    }
    if (updates.emails !== undefined || updates.email !== undefined) {
      updateFields.push(`emails = $${paramIndex++}`);
      values.push(emails);
    }
    if (updates.phones !== undefined || updates.phone !== undefined) {
      updateFields.push(`phones = $${paramIndex++}`);
      values.push(phones);
    }

    if (updateFields.length === 0) {
      return current;
    }

    values.push(id);
    const result = await query(
      `UPDATE group_members 
       SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    // Member count is updated automatically by trigger

    return result.rows.length > 0 ? rowToMember(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid member id");
    }

    const member = await this.findById(id);
    if (!member) {
      throw new Error("Member not found");
    }

    const result = await query("DELETE FROM group_members WHERE id = $1 RETURNING id", [id]);
    
    // Member count is updated automatically by trigger

    return result.rows.length > 0;
  },

  async deleteByGroupId(groupId) {
    if (!groupId) return;
    await query("DELETE FROM group_members WHERE group_id = $1", [groupId]);
    // Member count is updated automatically by trigger (to 0)
  },

  async countByGroupId(groupId) {
    if (!groupId) return 0;
    const result = await query(
      "SELECT COUNT(*) as count FROM group_members WHERE group_id = $1",
      [groupId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async deleteMany(ids) {
    if (!ids || ids.length === 0) return;

    // Get members to find their groupIds (before deletion)
    const members = [];
    for (const id of ids) {
      const member = await this.findById(id);
      if (member) {
        members.push(member);
      }
    }

    // Delete all members
    await query("DELETE FROM group_members WHERE id = ANY($1)", [ids]);

    // Member counts are updated automatically by triggers
  },
};
