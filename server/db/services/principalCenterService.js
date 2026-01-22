/**
 * Principal Center Service - PostgreSQL Implementation
 * Handles principal overviews and grade assignments
 */

import { query } from "../postgresConnect.js";

// ============================================
// PRINCIPAL GRADE ASSIGNMENTS
// ============================================

const rowToGradeAssignment = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    principalId: row.principal_id,
    principal_id: row.principal_id,
    gradeId: row.grade_id,
    grade_id: row.grade_id,
    assignedBy: row.assigned_by,
    assigned_by: row.assigned_by,
    assignedAt: row.assigned_at,
    assigned_at: row.assigned_at,
    isActive: row.is_active,
    is_active: row.is_active,
    notes: row.notes,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const principalGradeAssignmentService = {
  async findByPrincipalId(principalId) {
    if (!principalId) return [];
    const result = await query(
      `SELECT pga.*, g.name as grade_name, g.level as grade_level
       FROM principal_grade_assignments pga
       INNER JOIN grades g ON pga.grade_id = g.id
       WHERE pga.principal_id = $1 AND pga.is_active = true
       ORDER BY g.level`,
      [principalId]
    );
    return result.rows.map(row => ({
      ...rowToGradeAssignment(row),
      gradeName: row.grade_name,
      gradeLevel: row.grade_level,
    }));
  },

  async findByGradeId(gradeId) {
    if (!gradeId) return [];
    const result = await query(
      `SELECT pga.*, s.first_name, s.last_name, s.email
       FROM principal_grade_assignments pga
       INNER JOIN staff s ON pga.principal_id = s.id
       WHERE pga.grade_id = $1 AND pga.is_active = true`,
      [gradeId]
    );
    return result.rows.map(row => ({
      ...rowToGradeAssignment(row),
      principalFirstName: row.first_name,
      principalLastName: row.last_name,
      principalEmail: row.email,
    }));
  },

  async findAll() {
    const result = await query(
      `SELECT pga.*, 
              s.first_name as principal_first_name, 
              s.last_name as principal_last_name, 
              s.email as principal_email,
              g.name as grade_name, 
              g.level as grade_level
       FROM principal_grade_assignments pga
       INNER JOIN staff s ON pga.principal_id = s.id
       INNER JOIN grades g ON pga.grade_id = g.id
       WHERE pga.is_active = true
       ORDER BY g.level, s.last_name, s.first_name`,
      []
    );
    return result.rows.map(row => ({
      ...rowToGradeAssignment(row),
      principalFirstName: row.principal_first_name,
      principalLastName: row.principal_last_name,
      principalEmail: row.principal_email,
      gradeName: row.grade_name,
      gradeLevel: row.grade_level,
    }));
  },

  async create(assignmentData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO principal_grade_assignments (
        principal_id, grade_id, assigned_by, assigned_at, is_active, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        assignmentData.principalId || assignmentData.principal_id,
        assignmentData.gradeId || assignmentData.grade_id,
        assignmentData.assignedBy || assignmentData.assigned_by || null,
        assignmentData.assignedAt || assignmentData.assigned_at || now,
        assignmentData.isActive !== undefined ? assignmentData.isActive : (assignmentData.is_active !== undefined ? assignmentData.is_active : true),
        assignmentData.notes || null,
        now,
        now,
      ]
    );
    return rowToGradeAssignment(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) throw new Error("Invalid assignment id");

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      const result = await query("SELECT * FROM principal_grade_assignments WHERE id = $1", [id]);
      return result.rows.length > 0 ? rowToGradeAssignment(result.rows[0]) : null;
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE principal_grade_assignments SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToGradeAssignment(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) throw new Error("Invalid assignment id");
    await query("DELETE FROM principal_grade_assignments WHERE id = $1", [id]);
    return true;
  },
};

// ============================================
// CLASS OVERVIEWS
// ============================================

const rowToClassOverview = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    classId: row.class_id,
    class_id: row.class_id,
    principalId: row.principal_id,
    principal_id: row.principal_id,
    overviewDate: row.overview_date,
    overview_date: row.overview_date,
    hebrewNotes: row.hebrew_notes,
    hebrew_notes: row.hebrew_notes,
    englishNotes: row.english_notes,
    english_notes: row.english_notes,
    overallSummary: row.overall_summary,
    overall_summary: row.overall_summary,
    behaviorTrends: row.behavior_trends,
    behavior_trends: row.behavior_trends,
    academicTrends: row.academic_trends,
    academic_trends: row.academic_trends,
    concerns: row.concerns,
    positives: row.positives,
    createdBy: row.created_by,
    created_by: row.created_by,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const classOverviewService = {
  async findByClassId(classId, options = {}) {
    if (!classId) return [];
    let sql = `SELECT co.*, c.name as class_name, g.name as grade_name,
               s.first_name as principal_first_name, s.last_name as principal_last_name
               FROM class_overviews co
               INNER JOIN classes c ON co.class_id = c.id
               LEFT JOIN grades g ON c.grade_id = g.id
               LEFT JOIN staff s ON co.principal_id = s.id
               WHERE co.class_id = $1`;
    const params = [classId];
    let paramIndex = 2;

    if (options.limit) {
      sql += ` ORDER BY co.overview_date DESC LIMIT $${paramIndex++}`;
      params.push(options.limit);
      if (options.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }
    } else {
      sql += " ORDER BY co.overview_date DESC";
    }

    const result = await query(sql, params);
    return result.rows.map(row => ({
      ...rowToClassOverview(row),
      className: row.class_name,
      gradeName: row.grade_name,
      principalFirstName: row.principal_first_name,
      principalLastName: row.principal_last_name,
    }));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query(
      `SELECT co.*, c.name as class_name, g.name as grade_name
       FROM class_overviews co
       INNER JOIN classes c ON co.class_id = c.id
       LEFT JOIN grades g ON c.grade_id = g.id
       WHERE co.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...rowToClassOverview(row),
      className: row.class_name,
      gradeName: row.grade_name,
    };
  },

  async create(overviewData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO class_overviews (
        class_id, principal_id, overview_date, hebrew_notes, english_notes,
        overall_summary, behavior_trends, academic_trends, concerns, positives,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        overviewData.classId || overviewData.class_id,
        overviewData.principalId || overviewData.principal_id || null,
        overviewData.overviewDate || overviewData.overview_date || new Date(),
        overviewData.hebrewNotes || overviewData.hebrew_notes || null,
        overviewData.englishNotes || overviewData.english_notes || null,
        overviewData.overallSummary || overviewData.overall_summary || null,
        overviewData.behaviorTrends || overviewData.behavior_trends || null,
        overviewData.academicTrends || overviewData.academic_trends || null,
        overviewData.concerns || null,
        overviewData.positives || null,
        overviewData.createdBy || overviewData.created_by || null,
        now,
        now,
      ]
    );
    return rowToClassOverview(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) throw new Error("Invalid overview id");

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      principalId: 'principal_id',
      principal_id: 'principal_id',
      overviewDate: 'overview_date',
      overview_date: 'overview_date',
      hebrewNotes: 'hebrew_notes',
      hebrew_notes: 'hebrew_notes',
      englishNotes: 'english_notes',
      english_notes: 'english_notes',
      overallSummary: 'overall_summary',
      overall_summary: 'overall_summary',
      behaviorTrends: 'behavior_trends',
      behavior_trends: 'behavior_trends',
      academicTrends: 'academic_trends',
      academic_trends: 'academic_trends',
      concerns: 'concerns',
      positives: 'positives',
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
      `UPDATE class_overviews SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToClassOverview(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) throw new Error("Invalid overview id");
    await query("DELETE FROM class_overviews WHERE id = $1", [id]);
    return true;
  },
};

// ============================================
// STUDENT OVERVIEWS
// ============================================

const rowToStudentOverview = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    studentId: row.student_id,
    student_id: row.student_id,
    principalId: row.principal_id,
    principal_id: row.principal_id,
    overviewDate: row.overview_date,
    overview_date: row.overview_date,
    hebrewNotes: row.hebrew_notes,
    hebrew_notes: row.hebrew_notes,
    englishNotes: row.english_notes,
    english_notes: row.english_notes,
    behaviorNotes: row.behavior_notes,
    behavior_notes: row.behavior_notes,
    academicNotes: row.academic_notes,
    academic_notes: row.academic_notes,
    socialNotes: row.social_notes,
    social_notes: row.social_notes,
    concerns: row.concerns,
    positives: row.positives,
    followUpRequired: row.follow_up_required,
    follow_up_required: row.follow_up_required,
    followUpNotes: row.follow_up_notes,
    follow_up_notes: row.follow_up_notes,
    createdBy: row.created_by,
    created_by: row.created_by,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const studentOverviewService = {
  async findByStudentId(studentId, options = {}) {
    if (!studentId) return [];
    let sql = `SELECT so.*, s.first_name as student_first_name, s.last_name as student_last_name,
               st.first_name as principal_first_name, st.last_name as principal_last_name
               FROM student_overviews so
               INNER JOIN students s ON so.student_id = s.id
               LEFT JOIN staff st ON so.principal_id = st.id
               WHERE so.student_id = $1`;
    const params = [studentId];
    let paramIndex = 2;

    if (options.limit) {
      sql += ` ORDER BY so.overview_date DESC LIMIT $${paramIndex++}`;
      params.push(options.limit);
      if (options.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }
    } else {
      sql += " ORDER BY so.overview_date DESC";
    }

    const result = await query(sql, params);
    return result.rows.map(row => ({
      ...rowToStudentOverview(row),
      studentFirstName: row.student_first_name,
      studentLastName: row.student_last_name,
      principalFirstName: row.principal_first_name,
      principalLastName: row.principal_last_name,
    }));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query(
      `SELECT so.*, s.first_name as student_first_name, s.last_name as student_last_name
       FROM student_overviews so
       INNER JOIN students s ON so.student_id = s.id
       WHERE so.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...rowToStudentOverview(row),
      studentFirstName: row.student_first_name,
      studentLastName: row.student_last_name,
    };
  },

  async create(overviewData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO student_overviews (
        student_id, principal_id, overview_date, hebrew_notes, english_notes,
        behavior_notes, academic_notes, social_notes, concerns, positives,
        follow_up_required, follow_up_notes, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        overviewData.studentId || overviewData.student_id,
        overviewData.principalId || overviewData.principal_id || null,
        overviewData.overviewDate || overviewData.overview_date || new Date(),
        overviewData.hebrewNotes || overviewData.hebrew_notes || null,
        overviewData.englishNotes || overviewData.english_notes || null,
        overviewData.behaviorNotes || overviewData.behavior_notes || null,
        overviewData.academicNotes || overviewData.academic_notes || null,
        overviewData.socialNotes || overviewData.social_notes || null,
        overviewData.concerns || null,
        overviewData.positives || null,
        overviewData.followUpRequired !== undefined ? overviewData.followUpRequired : (overviewData.follow_up_required !== undefined ? overviewData.follow_up_required : false),
        overviewData.followUpNotes || overviewData.follow_up_notes || null,
        overviewData.createdBy || overviewData.created_by || null,
        now,
        now,
      ]
    );
    return rowToStudentOverview(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) throw new Error("Invalid overview id");

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      principalId: 'principal_id',
      principal_id: 'principal_id',
      overviewDate: 'overview_date',
      overview_date: 'overview_date',
      hebrewNotes: 'hebrew_notes',
      hebrew_notes: 'hebrew_notes',
      englishNotes: 'english_notes',
      english_notes: 'english_notes',
      behaviorNotes: 'behavior_notes',
      behavior_notes: 'behavior_notes',
      academicNotes: 'academic_notes',
      academic_notes: 'academic_notes',
      socialNotes: 'social_notes',
      social_notes: 'social_notes',
      concerns: 'concerns',
      positives: 'positives',
      followUpRequired: 'follow_up_required',
      follow_up_required: 'follow_up_required',
      followUpNotes: 'follow_up_notes',
      follow_up_notes: 'follow_up_notes',
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
      `UPDATE student_overviews SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToStudentOverview(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) throw new Error("Invalid overview id");
    await query("DELETE FROM student_overviews WHERE id = $1", [id]);
    return true;
  },
};

// ============================================
// GRADE OVERVIEWS
// ============================================

const rowToGradeOverview = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    gradeId: row.grade_id,
    grade_id: row.grade_id,
    principalId: row.principal_id,
    principal_id: row.principal_id,
    overviewDate: row.overview_date,
    overview_date: row.overview_date,
    hebrewNotes: row.hebrew_notes,
    hebrew_notes: row.hebrew_notes,
    englishNotes: row.english_notes,
    english_notes: row.english_notes,
    overallSummary: row.overall_summary,
    overall_summary: row.overall_summary,
    behaviorTrends: row.behavior_trends,
    behavior_trends: row.behavior_trends,
    academicTrends: row.academic_trends,
    academic_trends: row.academic_trends,
    concerns: row.concerns,
    positives: row.positives,
    createdBy: row.created_by,
    created_by: row.created_by,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const gradeOverviewService = {
  async findByGradeId(gradeId, options = {}) {
    if (!gradeId) return [];
    let sql = `SELECT go.*, g.name as grade_name, g.level as grade_level,
               s.first_name as principal_first_name, s.last_name as principal_last_name
               FROM grade_overviews go
               INNER JOIN grades g ON go.grade_id = g.id
               LEFT JOIN staff s ON go.principal_id = s.id
               WHERE go.grade_id = $1`;
    const params = [gradeId];
    let paramIndex = 2;

    if (options.limit) {
      sql += ` ORDER BY go.overview_date DESC LIMIT $${paramIndex++}`;
      params.push(options.limit);
      if (options.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(options.offset);
      }
    } else {
      sql += " ORDER BY go.overview_date DESC";
    }

    const result = await query(sql, params);
    return result.rows.map(row => ({
      ...rowToGradeOverview(row),
      gradeName: row.grade_name,
      gradeLevel: row.grade_level,
      principalFirstName: row.principal_first_name,
      principalLastName: row.principal_last_name,
    }));
  },

  async findById(id) {
    if (!id) return null;
    const result = await query(
      `SELECT go.*, g.name as grade_name, g.level as grade_level
       FROM grade_overviews go
       INNER JOIN grades g ON go.grade_id = g.id
       WHERE go.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...rowToGradeOverview(row),
      gradeName: row.grade_name,
      gradeLevel: row.grade_level,
    };
  },

  async create(overviewData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO grade_overviews (
        grade_id, principal_id, overview_date, hebrew_notes, english_notes,
        overall_summary, behavior_trends, academic_trends, concerns, positives,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        overviewData.gradeId || overviewData.grade_id,
        overviewData.principalId || overviewData.principal_id || null,
        overviewData.overviewDate || overviewData.overview_date || new Date(),
        overviewData.hebrewNotes || overviewData.hebrew_notes || null,
        overviewData.englishNotes || overviewData.english_notes || null,
        overviewData.overallSummary || overviewData.overall_summary || null,
        overviewData.behaviorTrends || overviewData.behavior_trends || null,
        overviewData.academicTrends || overviewData.academic_trends || null,
        overviewData.concerns || null,
        overviewData.positives || null,
        overviewData.createdBy || overviewData.created_by || null,
        now,
        now,
      ]
    );
    return rowToGradeOverview(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) throw new Error("Invalid overview id");

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      principalId: 'principal_id',
      principal_id: 'principal_id',
      overviewDate: 'overview_date',
      overview_date: 'overview_date',
      hebrewNotes: 'hebrew_notes',
      hebrew_notes: 'hebrew_notes',
      englishNotes: 'english_notes',
      english_notes: 'english_notes',
      overallSummary: 'overall_summary',
      overall_summary: 'overall_summary',
      behaviorTrends: 'behavior_trends',
      behavior_trends: 'behavior_trends',
      academicTrends: 'academic_trends',
      academic_trends: 'academic_trends',
      concerns: 'concerns',
      positives: 'positives',
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
      `UPDATE grade_overviews SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToGradeOverview(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) throw new Error("Invalid overview id");
    await query("DELETE FROM grade_overviews WHERE id = $1", [id]);
    return true;
  },
};

// ============================================
// PRINCIPAL DIVISION ASSIGNMENTS
// ============================================

const rowToDivisionAssignment = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    principalId: row.principal_id,
    principal_id: row.principal_id,
    divisionId: row.division_id,
    division_id: row.division_id,
    assignedBy: row.assigned_by,
    assigned_by: row.assigned_by,
    assignedAt: row.assigned_at,
    assigned_at: row.assigned_at,
    isActive: row.is_active,
    is_active: row.is_active,
    notes: row.notes,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
};

export const principalDivisionAssignmentService = {
  async findByPrincipalId(principalId) {
    if (!principalId) return [];
    const result = await query(
      `SELECT pda.*, d.name as division_name
       FROM principal_division_assignments pda
       INNER JOIN divisions d ON pda.division_id = d.id
       WHERE pda.principal_id = $1 AND pda.is_active = true
       ORDER BY d.name`,
      [principalId]
    );
    return result.rows.map(row => ({
      ...rowToDivisionAssignment(row),
      divisionName: row.division_name,
    }));
  },

  async findByDivisionId(divisionId) {
    if (!divisionId) return [];
    const result = await query(
      `SELECT pda.*, s.first_name, s.last_name, s.email
       FROM principal_division_assignments pda
       INNER JOIN staff s ON pda.principal_id = s.id
       WHERE pda.division_id = $1 AND pda.is_active = true
       ORDER BY s.last_name, s.first_name`,
      [divisionId]
    );
    return result.rows.map(row => ({
      ...rowToDivisionAssignment(row),
      principalName: `${row.first_name} ${row.last_name}`,
      principalEmail: row.email,
    }));
  },

  async findAll() {
    const result = await query(
      `SELECT pda.*, 
              s.first_name, s.last_name, s.email,
              d.name as division_name
       FROM principal_division_assignments pda
       INNER JOIN staff s ON pda.principal_id = s.id
       INNER JOIN divisions d ON pda.division_id = d.id
       WHERE pda.is_active = true
       ORDER BY d.name, s.last_name, s.first_name`
    );
    return result.rows.map(row => ({
      ...rowToDivisionAssignment(row),
      principalName: `${row.first_name} ${row.last_name}`,
      principalEmail: row.email,
      divisionName: row.division_name,
    }));
  },

  async create(assignmentData) {
    const now = new Date();
    const result = await query(
      `INSERT INTO principal_division_assignments (
        principal_id, division_id, assigned_by, assigned_at, is_active, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        assignmentData.principalId || assignmentData.principal_id,
        assignmentData.divisionId || assignmentData.division_id,
        assignmentData.assignedBy || assignmentData.assigned_by || null,
        assignmentData.assignedAt || assignmentData.assigned_at || now,
        assignmentData.isActive !== undefined ? assignmentData.isActive : (assignmentData.is_active !== undefined ? assignmentData.is_active : true),
        assignmentData.notes || null,
        now,
        now,
      ]
    );
    return rowToDivisionAssignment(result.rows[0]);
  },

  async update(id, updates) {
    if (!id) throw new Error("Invalid assignment id");
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramCount++}`);
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = $${paramCount++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE principal_division_assignments SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? rowToDivisionAssignment(result.rows[0]) : null;
  },

  async findById(id) {
    if (!id) return null;
    const result = await query(
      "SELECT * FROM principal_division_assignments WHERE id = $1",
      [id]
    );
    return result.rows.length > 0 ? rowToDivisionAssignment(result.rows[0]) : null;
  },

  async delete(id) {
    if (!id) throw new Error("Invalid assignment id");
    await query("DELETE FROM principal_division_assignments WHERE id = $1", [id]);
    return true;
  },
};
