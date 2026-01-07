/**
 * Staff Service - PostgreSQL Implementation
 * Handles all staff (teachers, principals, etc.) related database operations
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to staff object
const rowToStaff = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    employeeId: row.employee_id,
    employee_id: row.employee_id,
    firstName: row.first_name,
    first_name: row.first_name,
    lastName: row.last_name,
    last_name: row.last_name,
    title: row.title,
    phone: row.phone,
    email: row.email,
    hireDate: row.hire_date,
    hire_date: row.hire_date,
    terminationDate: row.termination_date,
    termination_date: row.termination_date,
    employmentStatus: row.employment_status,
    employment_status: row.employment_status,
    bio: row.bio,
    photoUrl: row.photo_url,
    photo_url: row.photo_url,
    notes: row.notes,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const staffService = {
  async findAll(options = {}) {
    let sql = "SELECT * FROM staff WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (options.employmentStatus) {
      sql += ` AND employment_status = $${paramIndex++}`;
      params.push(options.employmentStatus);
    }

    if (options.search) {
      sql += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR employee_id ILIKE $${paramIndex})`;
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
    return result.rows.map(row => rowToStaff(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM staff WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToStaff(result.rows[0]) : null;
  },

  async findByUserId(userId) {
    if (!userId) return null;
    const result = await query("SELECT * FROM staff WHERE user_id = $1", [userId]);
    return result.rows.length > 0 ? rowToStaff(result.rows[0]) : null;
  },

  async findByEmployeeId(employeeId) {
    if (!employeeId) return null;
    const result = await query("SELECT * FROM staff WHERE employee_id = $1", [employeeId]);
    return result.rows.length > 0 ? rowToStaff(result.rows[0]) : null;
  },

  async getPositions(staffId) {
    if (!staffId) return [];
    const result = await query(
      `SELECT sp.*, g.name as grade_name, g.level as grade_level
       FROM staff_positions sp
       LEFT JOIN grades g ON sp.grade_id = g.id
       WHERE sp.staff_id = $1 AND sp.is_active = true
       ORDER BY sp.start_date DESC`,
      [staffId]
    );
    return result.rows;
  },

  async getClasses(staffId) {
    if (!staffId) return [];
    const result = await query(
      `SELECT c.*, sc.role, sc.start_date, sc.end_date
       FROM classes c
       INNER JOIN staff_classes sc ON c.id = sc.class_id
       WHERE sc.staff_id = $1
       ORDER BY c.academic_year DESC, c.name`,
      [staffId]
    );
    return result.rows.map(row => ({
      ...row,
      grade_id: row.grade_id,
      gradeId: row.grade_id,
    }));
  },

  async isPrincipal(staffId) {
    if (!staffId) return false;
    const result = await query(
      `SELECT COUNT(*) FROM staff_positions
       WHERE staff_id = $1 AND position_name ILIKE '%principal%' AND is_active = true`,
      [staffId]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  },

  async create(staffData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO staff (
        user_id, employee_id, first_name, last_name, title, phone, email,
        hire_date, termination_date, employment_status, bio, photo_url, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        staffData.userId || staffData.user_id || null,
        staffData.employeeId || staffData.employee_id || null,
        staffData.firstName || staffData.first_name,
        staffData.lastName || staffData.last_name,
        staffData.title || null,
        staffData.phone || null,
        staffData.email || null,
        staffData.hireDate || staffData.hire_date || null,
        staffData.terminationDate || staffData.termination_date || null,
        staffData.employmentStatus || staffData.employment_status || 'active',
        staffData.bio || null,
        staffData.photoUrl || staffData.photo_url || null,
        staffData.notes || null,
        now,
        now,
      ]
    );
    return rowToStaff(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid staff id");
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      userId: 'user_id',
      user_id: 'user_id',
      employeeId: 'employee_id',
      employee_id: 'employee_id',
      firstName: 'first_name',
      first_name: 'first_name',
      lastName: 'last_name',
      last_name: 'last_name',
      title: 'title',
      phone: 'phone',
      email: 'email',
      hireDate: 'hire_date',
      hire_date: 'hire_date',
      terminationDate: 'termination_date',
      termination_date: 'termination_date',
      employmentStatus: 'employment_status',
      employment_status: 'employment_status',
      bio: 'bio',
      photoUrl: 'photo_url',
      photo_url: 'photo_url',
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
      `UPDATE staff SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToStaff(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid staff id");
    }
    await query("DELETE FROM staff WHERE id = $1", [id]);
    return true;
  },

  // Assignment management
  async assignToClass(staffId, classId, role = 'teacher', startDate = null, endDate = null) {
    if (!staffId || !classId) {
      throw new Error("Staff ID and Class ID are required");
    }
    const result = await query(
      `INSERT INTO staff_classes (staff_id, class_id, role, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (staff_id, class_id) 
       DO UPDATE SET role = $3, start_date = $4, end_date = $5
       RETURNING *`,
      [staffId, classId, role, startDate, endDate]
    );
    return result.rows[0];
  },

  async removeFromClass(staffId, classId) {
    if (!staffId || !classId) {
      throw new Error("Staff ID and Class ID are required");
    }
    await query("DELETE FROM staff_classes WHERE staff_id = $1 AND class_id = $2", [staffId, classId]);
    return true;
  },

  async assignToGrade(staffId, gradeId) {
    if (!staffId || !gradeId) {
      throw new Error("Staff ID and Grade ID are required");
    }
    const result = await query(
      `INSERT INTO staff_grades (staff_id, grade_id)
       VALUES ($1, $2)
       ON CONFLICT (staff_id, grade_id) DO NOTHING
       RETURNING *`,
      [staffId, gradeId]
    );
    return result.rows[0] || { staffId, gradeId };
  },

  async removeFromGrade(staffId, gradeId) {
    if (!staffId || !gradeId) {
      throw new Error("Staff ID and Grade ID are required");
    }
    await query("DELETE FROM staff_grades WHERE staff_id = $1 AND grade_id = $2", [staffId, gradeId]);
    return true;
  },

  async addPosition(staffId, positionId = null, positionName = null, gradeId = null, startDate = null, endDate = null) {
    if (!staffId || (!positionId && !positionName)) {
      throw new Error("Staff ID and either Position ID or Position Name are required");
    }
    const result = await query(
      `INSERT INTO staff_positions (staff_id, position_id, position_name, grade_id, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [staffId, positionId, positionName, gradeId, startDate, endDate]
    );
    return result.rows[0];
  },
};

