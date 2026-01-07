/**
 * Student Service - PostgreSQL Implementation
 * Handles all student-related database operations
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to student object
const rowToStudent = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    user_id: row.user_id,
    familyId: row.family_id,
    family_id: row.family_id,
    gradeId: row.grade_id,
    grade_id: row.grade_id,
    studentId: row.student_id,
    student_id: row.student_id,
    firstName: row.first_name,
    first_name: row.first_name,
    lastName: row.last_name,
    last_name: row.last_name,
    middleName: row.middle_name,
    middle_name: row.middle_name,
    dateOfBirth: row.date_of_birth,
    date_of_birth: row.date_of_birth,
    gender: row.gender,
    enrollmentDate: row.enrollment_date,
    enrollment_date: row.enrollment_date,
    enrollmentStatus: row.enrollment_status,
    enrollment_status: row.enrollment_status,
    photoUrl: row.photo_url,
    photo_url: row.photo_url,
    medicalNotes: row.medical_notes,
    medical_notes: row.medical_notes,
    allergies: row.allergies,
    medications: row.medications,
    emergencyContactName: row.emergency_contact_name,
    emergency_contact_name: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    emergency_contact_phone: row.emergency_contact_phone,
    emergencyContactRelationship: row.emergency_contact_relationship,
    emergency_contact_relationship: row.emergency_contact_relationship,
    notes: row.notes,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const studentService = {
  async findAll(options = {}) {
    let sql = "SELECT * FROM students WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (options.gradeId) {
      sql += ` AND grade_id = $${paramIndex++}`;
      params.push(options.gradeId);
    }

    if (options.familyId) {
      sql += ` AND family_id = $${paramIndex++}`;
      params.push(options.familyId);
    }

    if (options.enrollmentStatus) {
      sql += ` AND enrollment_status = $${paramIndex++}`;
      params.push(options.enrollmentStatus);
    }

    if (options.search) {
      sql += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR student_id ILIKE $${paramIndex})`;
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
    return result.rows.map(row => rowToStudent(row));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM students WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToStudent(result.rows[0]) : null;
  },

  async findByStudentId(studentId) {
    if (!studentId) return null;
    const result = await query("SELECT * FROM students WHERE student_id = $1", [studentId]);
    return result.rows.length > 0 ? rowToStudent(result.rows[0]) : null;
  },

  async findByClassId(classId) {
    if (!classId) return [];
    const result = await query(
      `SELECT s.* FROM students s
       INNER JOIN student_classes sc ON s.id = sc.student_id
       WHERE sc.class_id = $1 AND sc.status = 'active'
       ORDER BY s.last_name, s.first_name`,
      [classId]
    );
    return result.rows.map(row => rowToStudent(row));
  },

  async create(studentData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO students (
        user_id, family_id, grade_id, student_id, first_name, last_name, middle_name,
        date_of_birth, gender, enrollment_date, enrollment_status, photo_url,
        medical_notes, allergies, medications, emergency_contact_name,
        emergency_contact_phone, emergency_contact_relationship, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        studentData.userId || studentData.user_id || null,
        studentData.familyId || studentData.family_id || null,
        studentData.gradeId || studentData.grade_id || null,
        studentData.studentId || studentData.student_id || null,
        studentData.firstName || studentData.first_name,
        studentData.lastName || studentData.last_name,
        studentData.middleName || studentData.middle_name || null,
        studentData.dateOfBirth || studentData.date_of_birth || null,
        studentData.gender || null,
        studentData.enrollmentDate || studentData.enrollment_date || null,
        studentData.enrollmentStatus || studentData.enrollment_status || 'active',
        studentData.photoUrl || studentData.photo_url || null,
        studentData.medicalNotes || studentData.medical_notes || null,
        studentData.allergies || null,
        studentData.medications || null,
        studentData.emergencyContactName || studentData.emergency_contact_name || null,
        studentData.emergencyContactPhone || studentData.emergency_contact_phone || null,
        studentData.emergencyContactRelationship || studentData.emergency_contact_relationship || null,
        studentData.notes || null,
        now,
        now,
      ]
    );
    return rowToStudent(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) {
      throw new Error("Invalid student id");
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      userId: 'user_id',
      user_id: 'user_id',
      familyId: 'family_id',
      family_id: 'family_id',
      gradeId: 'grade_id',
      grade_id: 'grade_id',
      studentId: 'student_id',
      student_id: 'student_id',
      firstName: 'first_name',
      first_name: 'first_name',
      lastName: 'last_name',
      last_name: 'last_name',
      middleName: 'middle_name',
      middle_name: 'middle_name',
      dateOfBirth: 'date_of_birth',
      date_of_birth: 'date_of_birth',
      gender: 'gender',
      enrollmentDate: 'enrollment_date',
      enrollment_date: 'enrollment_date',
      enrollmentStatus: 'enrollment_status',
      enrollment_status: 'enrollment_status',
      photoUrl: 'photo_url',
      photo_url: 'photo_url',
      medicalNotes: 'medical_notes',
      medical_notes: 'medical_notes',
      allergies: 'allergies',
      medications: 'medications',
      emergencyContactName: 'emergency_contact_name',
      emergency_contact_name: 'emergency_contact_name',
      emergencyContactPhone: 'emergency_contact_phone',
      emergency_contact_phone: 'emergency_contact_phone',
      emergencyContactRelationship: 'emergency_contact_relationship',
      emergency_contact_relationship: 'emergency_contact_relationship',
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
      `UPDATE students SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToStudent(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) {
      throw new Error("Invalid student id");
    }
    await query("DELETE FROM students WHERE id = $1", [id]);
    return true;
  },

  async count(options = {}) {
    let sql = "SELECT COUNT(*) FROM students WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (options.gradeId) {
      sql += ` AND grade_id = $${paramIndex++}`;
      params.push(options.gradeId);
    }

    if (options.familyId) {
      sql += ` AND family_id = $${paramIndex++}`;
      params.push(options.familyId);
    }

    if (options.enrollmentStatus) {
      sql += ` AND enrollment_status = $${paramIndex++}`;
      params.push(options.enrollmentStatus);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count, 10);
  },
};

