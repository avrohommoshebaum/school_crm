/**
 * Student Duplicate Detection Service
 * Finds potential duplicate students based on name and other criteria
 */

import { query } from "../postgresConnect.js";
import { sanitizeText } from "../../utils/sanitization.js";

/**
 * Find potential duplicate students
 * @param {Object} studentData - Student data to check
 * @returns {Promise<Array>} - Array of potential duplicate students
 */
export async function findDuplicateStudents(studentData) {
  if (!studentData.firstName || !studentData.lastName) {
    return [];
  }

  const firstName = sanitizeText(studentData.firstName).toLowerCase();
  const lastName = sanitizeText(studentData.lastName).toLowerCase();
  const studentId = studentData.studentId ? sanitizeText(studentData.studentId) : null;
  const dateOfBirth = studentData.dateOfBirth || studentData.date_of_birth;

  // Build query to find potential duplicates
  let sql = `
    SELECT s.*, 
           f.family_name,
           g.name as grade_name
    FROM students s
    LEFT JOIN families f ON s.family_id = f.id
    LEFT JOIN grades g ON s.grade_id = g.id
    WHERE LOWER(s.first_name) = $1 
      AND LOWER(s.last_name) = $2
  `;
  const params = [firstName, lastName];
  let paramIndex = 3;

  // If student ID provided, also check for exact match
  if (studentId) {
    sql += ` OR s.student_id = $${paramIndex++}`;
    params.push(studentId);
  }

  // If date of birth provided, also check for match
  if (dateOfBirth) {
    sql += ` OR s.date_of_birth = $${paramIndex++}`;
    params.push(dateOfBirth);
  }

  sql += ` ORDER BY s.created_at DESC`;

  const result = await query(sql, params);
  
  return result.rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    studentId: row.student_id,
    dateOfBirth: row.date_of_birth,
    gradeName: row.grade_name,
    familyName: row.family_name,
    enrollmentStatus: row.enrollment_status,
    createdAt: row.created_at,
  }));
}

/**
 * Calculate similarity score between two students (0-100)
 * Higher score = more likely to be duplicate
 */
export function calculateSimilarityScore(student1, student2) {
  let score = 0;
  let factors = 0;

  // Name match (required)
  if (student1.firstName?.toLowerCase() === student2.firstName?.toLowerCase() &&
      student1.lastName?.toLowerCase() === student2.lastName?.toLowerCase()) {
    score += 50;
    factors++;
  }

  // Student ID match
  if (student1.studentId && student2.studentId && 
      student1.studentId === student2.studentId) {
    score += 40;
    factors++;
  }

  // Date of birth match
  if (student1.dateOfBirth && student2.dateOfBirth &&
      student1.dateOfBirth === student2.dateOfBirth) {
    score += 10;
    factors++;
  }

  // Grade match
  if (student1.gradeId && student2.gradeId &&
      student1.gradeId === student2.gradeId) {
    score += 5;
    factors++;
  }

  return factors > 0 ? Math.min(100, score) : 0;
}
