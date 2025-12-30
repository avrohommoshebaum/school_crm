/**
 * User Service - PostgreSQL Implementation
 * 
 * This service handles all user-related database operations using PostgreSQL
 */

import { query } from "../postgresConnect.js";
import bcrypt from "bcryptjs";
import { roleService } from "./roleService.js";

// Helper to convert database row to user object
const rowToUser = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    hash: row.hash,
    googleId: row.google_id,
    google_id: row.google_id, // Keep both for compatibility
    status: row.status,
    roles: row.roles || [], // UUID array
    permissionsOverride: row.permissions_override || {},
    permissions_override: row.permissions_override || {}, // Keep both for compatibility
    passwordResetToken: row.password_reset_token,
    password_reset_token: row.password_reset_token, // Keep both for compatibility
    passwordResetExpires: row.password_reset_expires,
    password_reset_expires: row.password_reset_expires, // Keep both for compatibility
    employeeId: row.employee_id,
    employee_id: row.employee_id, // Keep both for compatibility
    department: row.department,
    hireDate: row.hire_date,
    hire_date: row.hire_date, // Keep both for compatibility
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    zip_code: row.zip_code, // Keep both for compatibility
    emergencyContact: row.emergency_contact,
    emergency_contact: row.emergency_contact, // Keep both for compatibility
    emergencyPhone: row.emergency_phone,
    emergency_phone: row.emergency_phone, // Keep both for compatibility
    bio: row.bio,
    lastLogin: row.last_login,
    last_login: row.last_login, // Keep both for compatibility
    createdAt: row.created_at,
    created_at: row.created_at, // Keep both for compatibility
    updatedAt: row.updated_at,
    updated_at: row.updated_at, // Keep both for compatibility
  };
};

export const userService = {
  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
  },

  async findByEmail(email) {
    if (!email) return null;
    const result = await query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [email]);
    return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
  },

  async findByGoogleId(googleId) {
    if (!googleId) return null;
    const result = await query("SELECT * FROM users WHERE google_id = $1 LIMIT 1", [googleId]);
    return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
  },

  async findByPasswordResetToken(token) {
    if (!token) return null;
    
    const result = await query(
      "SELECT * FROM users WHERE password_reset_token = $1 LIMIT 1",
      [token]
    );

    if (result.rows.length === 0) return null;

    const user = rowToUser(result.rows[0]);
    if (!user || !user.passwordResetExpires) return null;

    // Check expiration
    const expiresAt = user.passwordResetExpires instanceof Date
      ? user.passwordResetExpires
      : new Date(user.passwordResetExpires);

    if (expiresAt < new Date()) {
      return null; // Token expired
    }

    return user;
  },

  async findAll() {
    const result = await query("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows.map(row => rowToUser(row));
  },

  async create(userData) {
    const now = new Date();

    // Hash password if provided
    let hash = userData.hash;
    if (userData.password && !hash) {
      hash = await bcrypt.hash(userData.password, 10);
    }

    const result = await query(
      `INSERT INTO users (
        email, name, phone, hash, google_id, status, roles, permissions_override,
        password_reset_token, password_reset_expires, employee_id, department,
        hire_date, address, city, state, zip_code, emergency_contact, emergency_phone, bio,
        created_at, updated_at
       ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
       )
       RETURNING *`,
      [
        (userData.email || "").toLowerCase(),
        userData.name || null,
        userData.phone || null,
        hash || null,
        userData.googleId || userData.google_id || null,
        userData.status || "invited",
        userData.roles || [],
        JSON.stringify(userData.permissionsOverride || userData.permissions_override || {}),
        userData.passwordResetToken || userData.password_reset_token || null,
        userData.passwordResetExpires || userData.password_reset_expires || null,
        userData.employeeId || userData.employee_id || null,
        userData.department || null,
        userData.hireDate || userData.hire_date || null,
        userData.address || null,
        userData.city || null,
        userData.state || null,
        userData.zipCode || userData.zip_code || null,
        userData.emergencyContact || userData.emergency_contact || null,
        userData.emergencyPhone || userData.emergency_phone || null,
        userData.bio || null,
        now,
        now,
      ]
    );

    return rowToUser(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid user id");
    }

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Hash password if provided
    if (updates.password) {
      updates.hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    // Build dynamic update query
    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }
    if (updates.hash !== undefined) {
      updateFields.push(`hash = $${paramIndex++}`);
      values.push(updates.hash);
    }
    if (updates.googleId !== undefined || updates.google_id !== undefined) {
      updateFields.push(`google_id = $${paramIndex++}`);
      values.push(updates.googleId || updates.google_id);
    }
    if (updates.status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.roles !== undefined) {
      updateFields.push(`roles = $${paramIndex++}`);
      values.push(updates.roles);
    }
    if (updates.permissionsOverride !== undefined || updates.permissions_override !== undefined) {
      updateFields.push(`permissions_override = $${paramIndex++}`);
      values.push(JSON.stringify(updates.permissionsOverride || updates.permissions_override || {}));
    }
    if (updates.passwordResetToken !== undefined || updates.password_reset_token !== undefined) {
      updateFields.push(`password_reset_token = $${paramIndex++}`);
      values.push(updates.passwordResetToken || updates.password_reset_token);
    }
    if (updates.passwordResetExpires !== undefined || updates.password_reset_expires !== undefined) {
      updateFields.push(`password_reset_expires = $${paramIndex++}`);
      values.push(updates.passwordResetExpires || updates.password_reset_expires);
    }
    if (updates.employeeId !== undefined || updates.employee_id !== undefined) {
      updateFields.push(`employee_id = $${paramIndex++}`);
      values.push(updates.employeeId || updates.employee_id);
    }
    if (updates.department !== undefined) {
      updateFields.push(`department = $${paramIndex++}`);
      values.push(updates.department);
    }
    if (updates.hireDate !== undefined || updates.hire_date !== undefined) {
      updateFields.push(`hire_date = $${paramIndex++}`);
      values.push(updates.hireDate || updates.hire_date);
    }
    if (updates.address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`);
      values.push(updates.address);
    }
    if (updates.city !== undefined) {
      updateFields.push(`city = $${paramIndex++}`);
      values.push(updates.city);
    }
    if (updates.state !== undefined) {
      updateFields.push(`state = $${paramIndex++}`);
      values.push(updates.state);
    }
    if (updates.zipCode !== undefined || updates.zip_code !== undefined) {
      updateFields.push(`zip_code = $${paramIndex++}`);
      values.push(updates.zipCode || updates.zip_code);
    }
    if (updates.emergencyContact !== undefined || updates.emergency_contact !== undefined) {
      updateFields.push(`emergency_contact = $${paramIndex++}`);
      values.push(updates.emergencyContact || updates.emergency_contact);
    }
    if (updates.emergencyPhone !== undefined || updates.emergency_phone !== undefined) {
      updateFields.push(`emergency_phone = $${paramIndex++}`);
      values.push(updates.emergencyPhone || updates.emergency_phone);
    }
    if (updates.bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      values.push(updates.bio);
    }
    if (updates.lastLogin !== undefined || updates.last_login !== undefined) {
      updateFields.push(`last_login = $${paramIndex++}`);
      values.push(updates.lastLogin || updates.last_login);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users 
       SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid user id");
    }

    const result = await query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return result.rows.length > 0;
  },

  async setPassword(id, password) {
    const hash = await bcrypt.hash(password, 10);
    return this.update(id, { hash });
  },

  async verifyPassword(user, password) {
    if (!user.hash) return false;
    return await bcrypt.compare(password, user.hash);
  },

  async populateRoles(user) {
    if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return { ...user, roles: [] };
    }

    // Filter out invalid role IDs
    let validRoleIds = user.roles.filter(
      (id) => id && typeof id === "string" && id.trim() !== ""
    );

    if (validRoleIds.length === 0) {
      return { ...user, roles: [] };
    }

    // Check if any role IDs are Firestore IDs (not UUIDs) and map them
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const needsMapping = validRoleIds.filter(id => !uuidRegex.test(id));
    
    if (needsMapping.length > 0) {
      // Map Firestore role IDs to PostgreSQL UUIDs
      const { query } = await import("../postgresConnect.js");
      const mappingResults = await Promise.all(
        needsMapping.map(async (firestoreId) => {
          const result = await query(
            "SELECT postgres_uuid FROM id_mapping WHERE firestore_id = $1 AND entity_type = 'roles' LIMIT 1",
            [firestoreId]
          );
          return result.rows.length > 0 ? { firestoreId, uuid: result.rows[0].postgres_uuid } : null;
        })
      );

      // Replace Firestore IDs with PostgreSQL UUIDs
      const idMap = new Map();
      mappingResults.forEach(mapping => {
        if (mapping) {
          idMap.set(mapping.firestoreId, mapping.uuid);
        }
      });

      validRoleIds = validRoleIds.map(id => idMap.get(id) || id);
      
      // Filter out any IDs that couldn't be mapped
      validRoleIds = validRoleIds.filter(id => uuidRegex.test(id));
    }

    if (validRoleIds.length === 0) {
      return { ...user, roles: [] };
    }

    const roles = await roleService.findByIds(validRoleIds);

    return {
      ...user,
      roles: roles.filter((r) => r !== null),
    };
  },

  async populateRolesForUsers(users) {
    return Promise.all(users.map((user) => this.populateRoles(user)));
  },
};
