/**
 * Family and Student Import Validation Service
 * Comprehensive validation of import data before processing
 */

import { gradeService } from "./gradeService.js";
import { classService } from "./classService.js";
import { sanitizeText } from "../../utils/sanitization.js";
import { findDuplicateStudents, calculateSimilarityScore } from "./studentDuplicateService.js";

/**
 * Parse parent names from string like "Yehuda and Bracha" or "ALON, Yehuda and Bracha"
 * Returns null if parsing fails
 */
function parseParentNames(parentString) {
  if (!parentString || typeof parentString !== 'string') return null;
  
  const sanitized = sanitizeText(parentString);
  if (!sanitized || sanitized.trim().length === 0) return null;
  
  const parents = [];
  const parts = sanitized.split(/\s+and\s+/i);
  let lastName = '';
  
  // Check if first part has a comma (LASTNAME, FirstName)
  if (parts[0].includes(',')) {
    const [last, first] = parts[0].split(',').map(s => s.trim());
    if (!last || !first) return null; // Invalid format
    lastName = sanitizeText(last);
    parents.push({
      firstName: sanitizeText(first),
      lastName: lastName,
    });
  } else {
    // No comma, assume first part is first name
    if (!parts[0] || parts[0].trim().length === 0) return null;
    parents.push({
      firstName: sanitizeText(parts[0]),
      lastName: '', // Will be set from student's family name
    });
  }
  
  // Add remaining parents (they share the same last name)
  for (let i = 1; i < parts.length; i++) {
    if (!parts[i] || parts[i].trim().length === 0) continue;
    parents.push({
      firstName: sanitizeText(parts[i]),
      lastName: lastName || '', // Use same last name or empty
    });
  }
  
  return parents.length > 0 ? parents : null;
}

/**
 * Parse student name from "Last, First" format
 * Returns null if parsing fails
 */
function parseStudentName(studentString) {
  if (!studentString || typeof studentString !== 'string') {
    return null;
  }
  
  const sanitized = sanitizeText(studentString);
  if (!sanitized || sanitized.trim().length === 0) return null;
  
  if (sanitized.includes(',')) {
    const [last, first] = sanitized.split(',').map(s => s.trim());
    if (!last || !first) return null; // Invalid format
    return {
      firstName: sanitizeText(first),
      lastName: sanitizeText(last),
    };
  } else {
    // No comma, assume it's "First Last"
    const parts = sanitized.split(/\s+/);
    if (parts.length < 2) return null; // Need at least first and last name
    return {
      firstName: sanitizeText(parts[0]),
      lastName: sanitizeText(parts.slice(1).join(' ')),
    };
  }
}

/**
 * Validate phone number format
 */
function validatePhone(phone) {
  if (!phone) return { valid: true }; // Optional field
  const phoneStr = String(phone).trim();
  // Basic validation - should have at least 10 digits
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length < 10) {
    return { valid: false, error: 'Phone number must have at least 10 digits' };
  }
  return { valid: true };
}

/**
 * Validate a single row of import data
 * @param {Object} rowData - Parsed row data
 * @param {Object} options - Options (grades, classes, etc.)
 * @returns {Promise<{valid: boolean, errors: Array, warnings: Array}>}
 */
async function validateImportRow(rowData, options = {}) {
  const errors = [];
  const warnings = [];
  const { grades = [], classes = [] } = options;
  
  // 1. Validate student name
  if (!rowData.studentName) {
    errors.push('Student name is required');
  } else {
    const studentName = parseStudentName(rowData.studentName);
    if (!studentName) {
      errors.push('Student name format is invalid. Expected "Last, First" or "First Last"');
    } else if (!studentName.firstName || !studentName.lastName) {
      errors.push('Student name must include both first and last name');
    }
  }
  
  // 2. Validate parent name
  if (!rowData.parentName) {
    errors.push('Parent name is required');
  } else {
    const parentNames = parseParentNames(rowData.parentName);
    if (!parentNames || parentNames.length === 0) {
      errors.push('Parent name format is invalid. Expected "Last, First" or "First and First" or "Last, First and First"');
    } else {
      // Check each parent has at least a first name
      for (let i = 0; i < parentNames.length; i++) {
        if (!parentNames[i].firstName) {
          errors.push(`Parent ${i + 1} is missing a first name`);
        }
      }
    }
  }
  
  // 3. Validate address (optional but if provided should be reasonable)
  if (rowData.address) {
    const address = sanitizeText(rowData.address);
    if (address.length < 5) {
      warnings.push('Address seems too short');
    }
  }
  
  // 4. Validate phone numbers
  if (rowData.homePhone) {
    const phoneValidation = validatePhone(rowData.homePhone);
    if (!phoneValidation.valid) {
      errors.push(`Home phone: ${phoneValidation.error}`);
    }
  }
  if (rowData.fatherCell) {
    const phoneValidation = validatePhone(rowData.fatherCell);
    if (!phoneValidation.valid) {
      errors.push(`Father cell: ${phoneValidation.error}`);
    }
  }
  if (rowData.motherCell) {
    const phoneValidation = validatePhone(rowData.motherCell);
    if (!phoneValidation.valid) {
      errors.push(`Mother cell: ${phoneValidation.error}`);
    }
  }
  
  // 5. Validate grade
  if (rowData.grade) {
    const gradeName = sanitizeText(rowData.grade);
    const grade = grades.find(g => 
      g.name.toLowerCase() === gradeName.toLowerCase()
    );
    if (!grade) {
      errors.push(`Grade "${gradeName}" not found in system. Available grades: ${grades.map(g => g.name).join(', ') || 'None'}`);
    }
  } else {
    warnings.push('No grade specified - student will be created without grade assignment');
  }
  
  // 6. Validate class
  if (rowData.class) {
    const className = sanitizeText(rowData.class);
    let foundClass = null;
    let gradeId = null;
    
    // First find the grade if provided
    if (rowData.grade) {
      const gradeName = sanitizeText(rowData.grade);
      const grade = grades.find(g => 
        g.name.toLowerCase() === gradeName.toLowerCase()
      );
      if (grade) {
        gradeId = grade.id;
      }
    }
    
    // Try to find class within grade
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
    
    if (!foundClass) {
      const availableClasses = gradeId 
        ? classes.filter(c => (c.gradeId || c.grade_id) === gradeId).map(c => c.name)
        : classes.map(c => c.name);
      errors.push(`Class "${className}" not found${gradeId ? ` for grade "${rowData.grade}"` : ''}. ${availableClasses.length > 0 ? `Available classes: ${availableClasses.join(', ')}` : 'No classes found in system'}`);
    } else if (gradeId && (foundClass.gradeId || foundClass.grade_id) !== gradeId) {
      warnings.push(`Class "${className}" exists but is not in grade "${rowData.grade}"`);
    }
  } else {
    warnings.push('No class specified - student will be created without class assignment');
  }
  
  // 7. Validate family ID format (if provided)
  if (rowData.familyId) {
    const familyId = String(rowData.familyId).trim();
    if (familyId.length === 0) {
      warnings.push('Family ID is empty');
    }
  }
  
  // 8. Validate financial fields (if provided)
  if (rowData.tuition) {
    const tuition = parseFloat(String(rowData.tuition).replace(/[^0-9.-]/g, ''));
    if (isNaN(tuition) || tuition < 0) {
      warnings.push('Tuition amount is not a valid number');
    }
  }
  if (rowData.paid) {
    const paid = parseFloat(String(rowData.paid).replace(/[^0-9.-]/g, ''));
    if (isNaN(paid) || paid < 0) {
      warnings.push('Paid amount is not a valid number');
    }
  }
  if (rowData.pledges) {
    const pledges = parseFloat(String(rowData.pledges).replace(/[^0-9.-]/g, ''));
    if (isNaN(pledges) || pledges < 0) {
      warnings.push('Pledges amount is not a valid number');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all rows before import
 * @param {Array<Object>} rows - Array of parsed row data
 * @returns {Promise<{valid: boolean, errors: Array, warnings: Array, duplicates: Array, details: Object}>}
 */
export async function validateImportData(rows) {
  const allErrors = [];
  const allWarnings = [];
  const duplicates = [];
  let validRows = 0;
  let invalidRows = 0;
  
  // Load grades and classes for validation
  const grades = await gradeService.findAll();
  const classes = await classService.findAll();
  
  const validationResults = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 1;
    
    const validation = await validateImportRow(row, { grades, classes });
    
    // Check for duplicates if student name is valid
    let duplicateInfo = null;
    if (validation.valid || validation.errors.length === 0) {
      const studentName = parseStudentName(row.studentName);
      if (studentName && studentName.firstName && studentName.lastName) {
        const duplicateStudents = await findDuplicateStudents({
          firstName: studentName.firstName,
          lastName: studentName.lastName,
          studentId: row.studentId || null,
          dateOfBirth: row.dateOfBirth || null,
        });
        
        if (duplicateStudents.length > 0) {
          // Calculate similarity scores
          const duplicateWithScores = duplicateStudents.map(dup => ({
            ...dup,
            similarityScore: calculateSimilarityScore(
              {
                firstName: studentName.firstName,
                lastName: studentName.lastName,
                studentId: row.studentId,
                dateOfBirth: row.dateOfBirth,
                gradeId: grades.find(g => g.name.toLowerCase() === (row.grade || '').toLowerCase())?.id,
              },
              dup
            ),
          }));
          
          duplicateInfo = {
            row: rowIndex,
            studentName: `${studentName.lastName}, ${studentName.firstName}`,
            duplicates: duplicateWithScores,
            action: null, // Will be set by user
          };
          
          duplicates.push(duplicateInfo);
        }
      }
    }
    
    validationResults.push({
      row: rowIndex,
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      duplicates: duplicateInfo,
      data: row,
    });
    
    if (validation.valid) {
      validRows++;
    } else {
      invalidRows++;
      allErrors.push({
        row: rowIndex,
        errors: validation.errors,
        warnings: validation.warnings,
        data: row,
      });
    }
    
    if (validation.warnings.length > 0) {
      allWarnings.push({
        row: rowIndex,
        warnings: validation.warnings,
      });
    }
  }
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    duplicates: duplicates,
    details: {
      totalRows: rows.length,
      validRows,
      invalidRows,
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
      totalDuplicates: duplicates.length,
      validationResults,
    },
  };
}
