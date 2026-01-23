/**
 * Family and Student Bulk Import Service
 * Handles complex family/student/parent relationships during bulk import
 */

import { query } from "../postgresConnect.js";
import { familyService } from "./familyService.js";
import { parentService } from "./parentService.js";
import { studentService } from "./studentService.js";
import { gradeService } from "./gradeService.js";
import { classService } from "./classService.js";
import { sanitizeText, sanitizeObject } from "../../utils/sanitization.js";
import { sanitizeString } from "../../utils/validation.js";
import { findDuplicateStudents } from "./studentDuplicateService.js";

/**
 * Parse parent names from string like "Yehuda and Bracha" or "ALON, Yehuda and Bracha"
 * @param {string} parentString - Parent name string
 * @returns {Array<{firstName: string, lastName: string}>} - Array of parent objects
 */
function parseParentNames(parentString) {
  if (!parentString || typeof parentString !== 'string') return [];
  
  const sanitized = sanitizeText(parentString);
  const parents = [];
  
  // Handle format: "LASTNAME, FirstName and FirstName" or "FirstName and FirstName"
  const parts = sanitized.split(/\s+and\s+/i);
  let lastName = '';
  
  // Check if first part has a comma (LASTNAME, FirstName)
  if (parts[0].includes(',')) {
    const [last, first] = parts[0].split(',').map(s => s.trim());
    lastName = sanitizeText(last);
    parents.push({
      firstName: sanitizeText(first),
      lastName: lastName,
    });
  } else {
    // No comma, assume first part is first name
    parents.push({
      firstName: sanitizeText(parts[0]),
      lastName: '', // Will be set from student's family name
    });
  }
  
  // Add remaining parents (they share the same last name)
  for (let i = 1; i < parts.length; i++) {
    parents.push({
      firstName: sanitizeText(parts[i]),
      lastName: lastName || '', // Use same last name or empty
    });
  }
  
  return parents;
}

/**
 * Parse student name from "Last, First" format
 * @param {string} studentString - Student name string
 * @returns {{firstName: string, lastName: string}} - Student name object
 */
function parseStudentName(studentString) {
  if (!studentString || typeof studentString !== 'string') {
    return { firstName: '', lastName: '' };
  }
  
  const sanitized = sanitizeText(studentString);
  
  if (sanitized.includes(',')) {
    const [last, first] = sanitized.split(',').map(s => s.trim());
    return {
      firstName: sanitizeText(first || ''),
      lastName: sanitizeText(last || ''),
    };
  } else {
    // No comma, assume it's "First Last"
    const parts = sanitized.split(/\s+/);
    if (parts.length >= 2) {
      return {
        firstName: sanitizeText(parts[0]),
        lastName: sanitizeText(parts.slice(1).join(' ')),
      };
    } else {
      return {
        firstName: sanitizeText(sanitized),
        lastName: '',
      };
    }
  }
}

/**
 * Find or create family by family ID
 * @param {string} familyId - Family ID from spreadsheet
 * @param {Object} familyData - Family data
 * @param {Map} familyIdMap - Map of external family IDs to database IDs
 * @returns {Promise<Object>} - Family object
 */
async function findOrCreateFamily(familyId, familyData, familyIdMap) {
  // If familyId is provided and we've seen it before, use existing family
  if (familyId && familyIdMap && familyIdMap.has(familyId)) {
    const existingFamilyId = familyIdMap.get(familyId);
    const existingFamily = await familyService.findById(existingFamilyId);
    if (existingFamily) {
      return existingFamily;
    }
    // If family was deleted, remove from map and create new
    familyIdMap.delete(familyId);
  }
  
  // Try to find by family name and address (to avoid duplicates)
  if (familyData.familyName) {
    const allFamilies = await familyService.findAll({ search: familyData.familyName });
    const matchingFamily = allFamilies.find(f => 
      f.familyName?.toLowerCase() === familyData.familyName.toLowerCase() &&
      (!familyData.address || f.address?.toLowerCase() === familyData.address.toLowerCase())
    );
    if (matchingFamily) {
      // Store in map for future reference
      if (familyId && familyIdMap) {
        familyIdMap.set(familyId, matchingFamily.id);
      }
      return matchingFamily;
    }
  }
  
  // Create new family
  const family = await familyService.create({
    familyName: familyData.familyName || familyData.family_name || '',
    address: familyData.address || '',
    city: familyData.city || '',
    state: familyData.state || '',
    zipCode: familyData.zipCode || familyData.zip_code || '',
    phone: familyData.phone || '',
    email: familyData.email || '',
  });
  
  // Store in map for future reference
  if (familyId && familyIdMap) {
    familyIdMap.set(familyId, family.id);
  }
  
  return family;
}

/**
 * Process a single row from the import
 * @param {Object} rowData - Parsed row data
 * @param {Object} options - Options (grades, classes, duplicateActions, etc.)
 * @returns {Promise<{success: boolean, data?: Object, errors?: Array}>}
 */
async function processImportRow(rowData, options = {}) {
  const errors = [];
  const { grades, classes, familyIdMap = new Map(), duplicateActions = {} } = options;
  
  try {
    // Parse student name
    const studentName = parseStudentName(rowData.studentName || '');
    if (!studentName.firstName || !studentName.lastName) {
      errors.push('Student name is required');
      return { success: false, errors };
    }
    
    // Parse parent names
    const parentNames = parseParentNames(rowData.parentName || '');
    if (parentNames.length === 0) {
      errors.push('At least one parent name is required');
      return { success: false, errors };
    }
    
    // Find or create family
    const familyId = rowData.familyId || rowData.family_id;
    let family = null;
    
    if (familyId && familyIdMap.has(familyId)) {
      // Use existing family
      const existingFamilyId = familyIdMap.get(familyId);
      family = await familyService.findById(existingFamilyId);
      if (!family) {
        // Family was deleted, remove from map and create new
        familyIdMap.delete(familyId);
        family = null;
      }
    }
    
    if (!family) {
      // Create new family
      const familyName = parentNames[0].lastName || studentName.lastName;
      family = await findOrCreateFamily(familyId, {
        familyName: sanitizeText(familyName),
        address: sanitizeText(rowData.address || ''),
        phone: sanitizeText(rowData.homePhone || rowData.home_phone || ''),
      }, familyIdMap);
    }
    
    // Find grade
    let gradeId = null;
    if (rowData.grade) {
      const gradeName = sanitizeText(rowData.grade);
      const grade = grades.find(g => 
        g.name.toLowerCase() === gradeName.toLowerCase()
      );
      if (grade) {
        gradeId = grade.id;
      } else {
        errors.push(`Grade "${gradeName}" not found`);
      }
    }
    
    // Find class
    let classId = null;
    if (rowData.class) {
      const className = sanitizeText(rowData.class);
      let foundClass = null;
      
      // Try to find by name within the grade
      if (gradeId) {
        foundClass = classes.find(c => 
          (c.gradeId || c.grade_id) === gradeId &&
          c.name.toLowerCase() === className.toLowerCase()
        );
      }
      
      // Fallback: find by name alone
      if (!foundClass) {
        foundClass = classes.find(c => 
          c.name.toLowerCase() === className.toLowerCase()
        );
      }
      
      if (foundClass) {
        classId = foundClass.id;
      } else {
        errors.push(`Class "${className}" not found${gradeId ? ` for grade "${rowData.grade}"` : ''}`);
      }
    }
    
    // Check for duplicates and handle based on user action
    const duplicateKey = `${studentName.lastName}, ${studentName.firstName}`;
    const rowIndex = options.rowIndex || 0;
    const duplicateAction = duplicateActions[duplicateKey] || duplicateActions[`row_${rowIndex}`] || 'create';
    
    let student = null;
    let wasUpdated = false;
    
    if (duplicateAction === 'merge' || duplicateAction === 'update') {
      // Find existing duplicate
      const duplicates = await findDuplicateStudents({
        firstName: studentName.firstName,
        lastName: studentName.lastName,
        studentId: rowData.studentId || null,
        dateOfBirth: rowData.dateOfBirth || null,
      });
      
      if (duplicates.length > 0) {
        // Use the most similar duplicate (first one, highest similarity)
        const existingStudent = duplicates[0];
        student = await studentService.findById(existingStudent.id);
        
        if (student) {
          if (duplicateAction === 'update') {
            // Update existing student with new data
            student = await studentService.update(student.id, {
              gradeId: gradeId || student.gradeId,
              familyId: family.id,
              enrollmentStatus: 'active',
            });
            wasUpdated = true;
          } else {
            // Merge: update only missing fields
            const updates = {};
            if (gradeId && !student.gradeId) updates.gradeId = gradeId;
            if (family.id && !student.familyId) updates.familyId = family.id;
            if (Object.keys(updates).length > 0) {
              student = await studentService.update(student.id, updates);
              wasUpdated = true;
            }
          }
        }
      }
    }
    
    // Create new student if not using existing
    if (!student) {
      if (!family || !family.id) {
        errors.push('Failed to create or find family');
        return { success: false, errors };
      }
      
      student = await studentService.create({
        familyId: family.id,
        gradeId: gradeId,
        firstName: studentName.firstName,
        lastName: studentName.lastName,
        enrollmentStatus: 'active',
      });
      
      if (!student || !student.id) {
        errors.push('Failed to create student');
        return { success: false, errors };
      }
    }
    
    // Assign to class if classId found
    let classAssigned = false;
    if (classId) {
      try {
        await query(
          `INSERT INTO student_classes (student_id, class_id, status, enrollment_date)
           VALUES ($1, $2, 'active', CURRENT_DATE)
           ON CONFLICT (student_id, class_id) 
           DO UPDATE SET status = 'active'`,
          [student.id, classId]
        );
        classAssigned = true;
      } catch (err) {
        errors.push(`Failed to assign student to class: ${err.message}`);
      }
    }
    
    // Create parents and link to student
    const createdParents = [];
    for (let i = 0; i < parentNames.length; i++) {
      const parentName = parentNames[i];
      if (!parentName.firstName) continue;
      
      // Determine relationship
      let relationship = 'guardian';
      const firstNameLower = parentName.firstName.toLowerCase();
      if (firstNameLower.includes('father') || firstNameLower.includes('dad') || 
          rowData.fatherCell || rowData.father_cell) {
        relationship = 'father';
      } else if (firstNameLower.includes('mother') || firstNameLower.includes('mom') ||
                 rowData.motherCell || rowData.mother_cell) {
        relationship = 'mother';
      }
      
      // Get phone numbers
      let phone = '';
      if (relationship === 'father' && (rowData.fatherCell || rowData.father_cell)) {
        phone = sanitizeText(rowData.fatherCell || rowData.father_cell);
      } else if (relationship === 'mother' && (rowData.motherCell || rowData.mother_cell)) {
        phone = sanitizeText(rowData.motherCell || rowData.mother_cell);
      } else if (rowData.homePhone || rowData.home_phone) {
        phone = sanitizeText(rowData.homePhone || rowData.home_phone);
      }
      
      // Create parent
      if (!parentName.firstName) {
        continue; // Skip if no first name
      }
      
      const parent = await parentService.create({
        familyId: family.id,
        firstName: parentName.firstName,
        lastName: parentName.lastName || (family?.familyName || family?.family_name) || studentName.lastName || '',
        relationship: relationship,
        phone: phone || null,
        isPrimaryContact: i === 0, // First parent is primary
        canPickup: true,
        emergencyContact: true,
      });
      
      if (!parent || !parent.id) {
        errors.push(`Failed to create parent: ${parentName.firstName}`);
        continue;
      }
      
      createdParents.push(parent);
      
      // Link parent to student
      try {
        await parentService.linkToStudent(
          parent.id,
          student.id,
          relationship,
          i === 0 // First parent is primary
        );
      } catch (err) {
        errors.push(`Failed to link parent to student: ${err.message}`);
      }
    }
    
    return {
      success: true,
      data: {
        student,
        family,
        parents: createdParents,
        classAssigned,
        updated: wasUpdated,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [error.message || 'Unknown error'],
    };
  }
}

/**
 * Bulk import families and students
 * @param {Array<Object>} rows - Array of parsed row data
 * @param {Object} options - Options
 * @returns {Promise<{imported: number, errors: Array, details: Object}>}
 */
export async function bulkImportFamiliesAndStudents(rows, options = {}) {
  const errors = [];
  let imported = 0;
  const familyIdMap = new Map(); // Track family IDs to avoid duplicates
  const familiesCreated = new Set(); // Track unique families created
  const parentsCreated = new Set(); // Track unique parents created
  const studentsCreated = new Set(); // Track unique students created
  let classAssignments = 0;
  
  // Load grades and classes
  const grades = await gradeService.findAll();
  const classes = await classService.findAll();
  
  const results = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 1;
    
    try {
      const result = await processImportRow(row, {
        grades,
        classes,
        familyIdMap,
      });
      
      if (result.success) {
        imported++;
        
        // Track created/updated entities
        if (result.data.family) {
          familiesCreated.add(result.data.family.id);
        }
        if (result.data.student) {
          if (result.data.updated) {
            studentsUpdated.add(result.data.student.id);
          } else {
            studentsCreated.add(result.data.student.id);
          }
        }
        if (result.data.parents) {
          result.data.parents.forEach(p => parentsCreated.add(p.id));
        }
        if (result.data.classAssigned) {
          classAssignments++;
        }
        
        results.push({
          row: rowIndex,
          success: true,
          student: result.data.student,
          family: result.data.family,
          parents: result.data.parents,
          warnings: result.data.errors,
        });
      } else {
        errors.push({
          row: rowIndex,
          errors: result.errors,
          data: row,
        });
        results.push({
          row: rowIndex,
          success: false,
          errors: result.errors,
        });
      }
    } catch (error) {
      errors.push({
        row: rowIndex,
        errors: [error.message || 'Unknown error'],
        data: row,
      });
      results.push({
        row: rowIndex,
        success: false,
        errors: [error.message || 'Unknown error'],
      });
    }
  }
  
  return {
    imported,
    errors: errors.length,
    details: {
      imported,
      errors,
      results,
      familiesCreated: familiesCreated.size,
      parentsCreated: parentsCreated.size,
      studentsCreated: studentsCreated.size,
      studentsUpdated: studentsUpdated.size,
      classAssignments,
    },
  };
}
