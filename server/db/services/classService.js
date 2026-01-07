/**
 * Class Service - PostgreSQL Implementation
 * Handles all class-related database operations
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to class object
const rowToClass = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    gradeId: row.grade_id,
    grade_id: row.grade_id,
    roomNumber: row.room_number,
    room_number: row.room_number,
    academicYear: row.academic_year,
    academic_year: row.academic_year,
    startDate: row.start_date,
    start_date: row.start_date,
    endDate: row.end_date,
    end_date: row.end_date,
    maxStudents: row.max_students,
    max_students: row.max_students,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const classService = {
  async findAll(options = {}) {
    let sql = "SELECT * FROM classes WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (options.gradeId) {
      sql += ` AND grade_id = $${paramIndex++}`;
      params.push(options.gradeId);
    }

    if (options.academicYear) {
      sql += ` AND academic_year = $${paramIndex++}`;
      params.push(options.academicYear);
    }

    if (options.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(options.status);
    }

    if (options.search) {
      sql += ` AND (name ILIKE $${paramIndex} OR room_number ILIKE $${paramIndex})`;
      params.push(`%${options.search}%`);
      paramIndex++;
    }

    sql += " ORDER BY name";

    if (options.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(options.limit);
      if (options.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }
    }

    const result = await query(sql, params);
    return result.rows.map(row => rowToClass(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM classes WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToClass(result.rows[0]) : null;
  },

  async findByName(name, academicYear = null) {
    if (!name) return null;
    let sql = "SELECT * FROM classes WHERE name = $1";
    const params = [name];
    if (academicYear) {
      sql += " AND academic_year = $2";
      params.push(academicYear);
    }
    const result = await query(sql, params);
    return result.rows.length > 0 ? rowToClass(result.rows[0]) : null;
  },

  async getStudentCount(classId) {
    if (!classId) return 0;
    const result = await query(
      "SELECT COUNT(*) FROM student_classes WHERE class_id = $1 AND status = 'active'",
      [classId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async getTeachers(classId) {
    if (!classId) return [];
    const result = await query(
      `SELECT s.*, sc.role, sc.start_date, sc.end_date
       FROM staff s
       INNER JOIN staff_classes sc ON s.id = sc.staff_id
       WHERE sc.class_id = $1
       ORDER BY sc.role, s.last_name, s.first_name`,
      [classId]
    );
    return result.rows;
  },

  async create(classData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO classes (
        name, grade_id, room_number, academic_year, start_date, end_date,
        max_students, status, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        classData.name,
        classData.gradeId || classData.grade_id || null,
        classData.roomNumber || classData.room_number || null,
        classData.academicYear || classData.academic_year || null,
        classData.startDate || classData.start_date || null,
        classData.endDate || classData.end_date || null,
        classData.maxStudents || classData.max_students || null,
        classData.status || 'active',
        classData.notes || null,
        now,
        now,
      ]
    );
    return rowToClass(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid class id");
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      name: 'name',
      gradeId: 'grade_id',
      grade_id: 'grade_id',
      roomNumber: 'room_number',
      room_number: 'room_number',
      academicYear: 'academic_year',
      academic_year: 'academic_year',
      startDate: 'start_date',
      start_date: 'start_date',
      endDate: 'end_date',
      end_date: 'end_date',
      maxStudents: 'max_students',
      max_students: 'max_students',
      status: 'status',
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
      `UPDATE classes SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToClass(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid class id");
    }
    await query("DELETE FROM classes WHERE id = $1", [id]);
    return true;
  },
};

