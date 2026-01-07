/**
 * Import Controller
 * Handles Excel imports for grades, students, classes, staff, and families
 */

import XLSX from "xlsx";
import { gradeService } from "../db/services/gradeService.js";
import { studentService } from "../db/services/studentService.js";
import { classService } from "../db/services/classService.js";
import { staffService } from "../db/services/staffService.js";
import { familyService } from "../db/services/familyService.js";
import { sanitizeString } from "../utils/validation.js";

// Auto-detect column mappings based on common field names
const autoDetectColumns = (headers, type) => {
  const mapping = {};
  const headerLower = headers.map(h => String(h || "").toLowerCase().trim());
  
  if (type === "staff" || type === "teachers") {
    // Staff/Teacher fields
    mapping.firstName = headers[headerLower.findIndex(h => 
      h.includes("first") || h.includes("fname") || h.includes("given")
    )] || null;
    mapping.lastName = headers[headerLower.findIndex(h => 
      h.includes("last") || h.includes("lname") || h.includes("surname") || h.includes("family")
    )] || null;
    mapping.email = headers[headerLower.findIndex(h => 
      h.includes("email") || h.includes("e-mail")
    )] || null;
    mapping.phone = headers[headerLower.findIndex(h => 
      h.includes("phone") || h.includes("tel") || h.includes("mobile")
    )] || null;
    mapping.employeeId = headers[headerLower.findIndex(h => 
      h.includes("employee") || h.includes("emp") || h.includes("id") && !h.includes("student")
    )] || null;
    mapping.title = headers[headerLower.findIndex(h => 
      h.includes("title") || h.includes("prefix") || h.includes("mr") || h.includes("mrs")
    )] || null;
    mapping.hireDate = headers[headerLower.findIndex(h => 
      h.includes("hire") || h.includes("start") || h.includes("join")
    )] || null;
    mapping.employmentStatus = headers[headerLower.findIndex(h => 
      h.includes("status") || h.includes("employment") || h.includes("active")
    )] || null;
  } else if (type === "students") {
    mapping.firstName = headers[headerLower.findIndex(h => 
      h.includes("first") || h.includes("fname") || h.includes("given")
    )] || null;
    mapping.lastName = headers[headerLower.findIndex(h => 
      h.includes("last") || h.includes("lname") || h.includes("surname") || h.includes("family")
    )] || null;
    mapping.middleName = headers[headerLower.findIndex(h => 
      h.includes("middle") || h.includes("mname")
    )] || null;
    mapping.studentId = headers[headerLower.findIndex(h => 
      h.includes("student") && h.includes("id") || h.includes("student_id")
    )] || null;
    mapping.dateOfBirth = headers[headerLower.findIndex(h => 
      h.includes("dob") || h.includes("birth") || h.includes("date") && h.includes("birth")
    )] || null;
    mapping.gender = headers[headerLower.findIndex(h => 
      h.includes("gender") || h.includes("sex")
    )] || null;
    mapping.grade = headers[headerLower.findIndex(h => 
      h.includes("grade") && !h.includes("point")
    )] || null;
    mapping.class = headers[headerLower.findIndex(h => 
      h.includes("class") && !h.includes("room")
    )] || null;
    mapping.enrollmentDate = headers[headerLower.findIndex(h => 
      h.includes("enroll") || h.includes("admit")
    )] || null;
  } else if (type === "classes") {
    mapping.name = headers[headerLower.findIndex(h => 
      h.includes("name") || h.includes("class")
    )] || null;
    mapping.grade = headers[headerLower.findIndex(h => 
      h.includes("grade")
    )] || null;
    mapping.roomNumber = headers[headerLower.findIndex(h => 
      h.includes("room") || h.includes("number")
    )] || null;
    mapping.academicYear = headers[headerLower.findIndex(h => 
      h.includes("year") || h.includes("academic")
    )] || null;
    mapping.maxStudents = headers[headerLower.findIndex(h => 
      h.includes("max") || h.includes("capacity") || h.includes("limit")
    )] || null;
    mapping.status = headers[headerLower.findIndex(h => 
      h.includes("status")
    )] || null;
  } else if (type === "grades") {
    mapping.name = headers[headerLower.findIndex(h => 
      h.includes("name") || h.includes("grade")
    )] || null;
    mapping.level = headers[headerLower.findIndex(h => 
      h.includes("level") || h.includes("number") || h.includes("num")
    )] || null;
    mapping.description = headers[headerLower.findIndex(h => 
      h.includes("description") || h.includes("desc") || h.includes("note")
    )] || null;
  } else if (type === "families") {
    mapping.familyName = headers[headerLower.findIndex(h => 
      h.includes("family") || h.includes("name") || h.includes("last")
    )] || null;
    mapping.address = headers[headerLower.findIndex(h => 
      h.includes("address") || h.includes("street")
    )] || null;
    mapping.city = headers[headerLower.findIndex(h => 
      h.includes("city")
    )] || null;
    mapping.state = headers[headerLower.findIndex(h => 
      h.includes("state") || h.includes("province")
    )] || null;
    mapping.zipCode = headers[headerLower.findIndex(h => 
      h.includes("zip") || h.includes("postal") || h.includes("code")
    )] || null;
    mapping.phone = headers[headerLower.findIndex(h => 
      h.includes("phone") || h.includes("tel")
    )] || null;
    mapping.email = headers[headerLower.findIndex(h => 
      h.includes("email") || h.includes("e-mail")
    )] || null;
  }
  
  // Remove null values
  Object.keys(mapping).forEach(key => {
    if (mapping[key] === null) delete mapping[key];
  });
  
  return mapping;
};

// Parse Excel file and return headers and sample rows
export const parseExcelFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const headers = data[0].map((h) => String(h || "").trim()).filter((h) => h);
    const sampleRows = data.slice(1, Math.min(6, data.length));

    res.json({
      headers,
      sampleRows: sampleRows.map((row) => headers.map((_, i) => String(row[i] || "").trim())),
      totalRows: data.length - 1,
    });
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    res.status(500).json({ message: "Error parsing Excel file", error: error.message });
  }
};

// Import grades from Excel
export const importGrades = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    // Parse columnMapping or auto-detect
    let columnMapping = req.body.columnMapping;
    if (typeof columnMapping === "string") {
      try {
        columnMapping = JSON.parse(columnMapping);
      } catch (e) {
        columnMapping = null;
      }
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const headers = data[0].map((h) => String(h || "").trim());
    
    // Auto-detect if not provided
    if (!columnMapping || Object.keys(columnMapping).length === 0) {
      columnMapping = autoDetectColumns(headers, "grades");
    }

    if (!columnMapping || (!columnMapping.name && !columnMapping.level)) {
      return res.status(400).json({ message: "Grade name and level mapping are required. Could not auto-detect columns." });
    }
    const skipFirstRow = req.body.skipFirstRow !== false;
    const startRow = skipFirstRow ? 1 : 0;
    const rows = data.slice(startRow);

    const grades = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = startRow + i + 1;

      try {
        const nameCol = headers.indexOf(columnMapping.name);
        const levelCol = headers.indexOf(columnMapping.level);
        const descCol = columnMapping.description ? headers.indexOf(columnMapping.description) : -1;

        if (nameCol < 0 || levelCol < 0) {
          errors.push({ row: rowIndex, error: "Missing required columns" });
          continue;
        }

        const name = String(row[nameCol] || "").trim();
        const level = parseInt(String(row[levelCol] || "").trim(), 10);
        const description = descCol >= 0 ? String(row[descCol] || "").trim() : null;

        if (!name) {
          errors.push({ row: rowIndex, error: "Grade name is required" });
          continue;
        }

        if (isNaN(level)) {
          errors.push({ row: rowIndex, error: "Grade level must be a number" });
          continue;
        }

        // Check if grade already exists
        const existing = await gradeService.findByName(name);
        if (existing) {
          errors.push({ row: rowIndex, error: `Grade "${name}" already exists` });
          continue;
        }

        grades.push({ name, level, description });
      } catch (error) {
        errors.push({ row: rowIndex, error: error.message });
      }
    }

    // Bulk create grades
    let imported = 0;
    for (const gradeData of grades) {
      try {
        await gradeService.create(gradeData);
        imported++;
      } catch (error) {
        errors.push({ row: `Grade: ${gradeData.name}`, error: error.message });
      }
    }

    res.json({
      message: "Import completed",
      imported,
      errors: errors.length,
      details: { imported, errors },
    });
  } catch (error) {
    console.error("Error importing grades:", error);
    res.status(500).json({ message: "Error importing grades", error: error.message });
  }
};

// Import students from Excel
export const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    let columnMapping = req.body.columnMapping;
    if (typeof columnMapping === "string") {
      try {
        columnMapping = JSON.parse(columnMapping);
      } catch (e) {
        columnMapping = null;
      }
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const headers = data[0].map((h) => String(h || "").trim());
    
    // Auto-detect if not provided
    if (!columnMapping || Object.keys(columnMapping).length === 0) {
      columnMapping = autoDetectColumns(headers, "students");
    }

    if (!columnMapping || (!columnMapping.firstName && !columnMapping.lastName)) {
      return res.status(400).json({ message: "First name and last name mapping are required. Could not auto-detect columns." });
    }
    
    const skipFirstRow = req.body.skipFirstRow !== false;
    const startRow = skipFirstRow ? 1 : 0;
    const rows = data.slice(startRow);

    const students = [];
    const errors = [];

    // Get all grades for lookup
    const allGrades = await gradeService.findAll();
    const gradeMap = new Map(allGrades.map(g => [g.name.toLowerCase(), g.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = startRow + i + 1;

      try {
        const firstName = columnMapping.firstName ? String(row[headers.indexOf(columnMapping.firstName)] || "").trim() : "";
        const lastName = columnMapping.lastName ? String(row[headers.indexOf(columnMapping.lastName)] || "").trim() : "";

        if (!firstName || !lastName) {
          errors.push({ row: rowIndex, error: "First name and last name are required" });
          continue;
        }

        const studentData = {
          firstName: sanitizeString(firstName),
          lastName: sanitizeString(lastName),
          middleName: columnMapping.middleName ? sanitizeString(String(row[headers.indexOf(columnMapping.middleName)] || "").trim()) : null,
          studentId: columnMapping.studentId ? String(row[headers.indexOf(columnMapping.studentId)] || "").trim() : null,
          dateOfBirth: columnMapping.dateOfBirth ? String(row[headers.indexOf(columnMapping.dateOfBirth)] || "").trim() : null,
          gender: columnMapping.gender ? String(row[headers.indexOf(columnMapping.gender)] || "").trim() : null,
          enrollmentDate: columnMapping.enrollmentDate ? String(row[headers.indexOf(columnMapping.enrollmentDate)] || "").trim() : null,
          enrollmentStatus: columnMapping.enrollmentStatus ? String(row[headers.indexOf(columnMapping.enrollmentStatus)] || "").trim() : 'active',
        };

        // Map grade if provided
        if (columnMapping.grade) {
          const gradeName = String(row[headers.indexOf(columnMapping.grade)] || "").trim();
          if (gradeName) {
            const gradeId = gradeMap.get(gradeName.toLowerCase());
            if (gradeId) {
              studentData.gradeId = gradeId;
            } else {
              errors.push({ row: rowIndex, error: `Grade "${gradeName}" not found` });
              continue;
            }
          }
        }

        students.push(studentData);
      } catch (error) {
        errors.push({ row: rowIndex, error: error.message });
      }
    }

    // Bulk create students
    let imported = 0;
    for (const studentData of students) {
      try {
        await studentService.create(studentData);
        imported++;
      } catch (error) {
        errors.push({ row: `Student: ${studentData.firstName} ${studentData.lastName}`, error: error.message });
      }
    }

    res.json({
      message: "Import completed",
      imported,
      errors: errors.length,
      details: { imported, errors },
    });
  } catch (error) {
    console.error("Error importing students:", error);
    res.status(500).json({ message: "Error importing students", error: error.message });
  }
};

// Import classes from Excel
export const importClasses = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    let columnMapping = req.body.columnMapping;
    if (typeof columnMapping === "string") {
      try {
        columnMapping = JSON.parse(columnMapping);
      } catch (e) {
        columnMapping = null;
      }
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const headers = data[0].map((h) => String(h || "").trim());
    
    // Auto-detect if not provided
    if (!columnMapping || Object.keys(columnMapping).length === 0) {
      columnMapping = autoDetectColumns(headers, "classes");
    }

    if (!columnMapping || !columnMapping.name) {
      return res.status(400).json({ message: "Class name mapping is required. Could not auto-detect columns." });
    }
    const skipFirstRow = req.body.skipFirstRow !== false;
    const startRow = skipFirstRow ? 1 : 0;
    const rows = data.slice(startRow);

    const classes = [];
    const errors = [];

    // Get all grades for lookup
    const allGrades = await gradeService.findAll();
    const gradeMap = new Map(allGrades.map(g => [g.name.toLowerCase(), g.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = startRow + i + 1;

      try {
        const name = String(row[headers.indexOf(columnMapping.name)] || "").trim();
        if (!name) {
          errors.push({ row: rowIndex, error: "Class name is required" });
          continue;
        }

        const classData = {
          name: sanitizeString(name),
          roomNumber: columnMapping.roomNumber ? String(row[headers.indexOf(columnMapping.roomNumber)] || "").trim() : null,
          academicYear: columnMapping.academicYear ? String(row[headers.indexOf(columnMapping.academicYear)] || "").trim() : null,
          startDate: columnMapping.startDate ? String(row[headers.indexOf(columnMapping.startDate)] || "").trim() : null,
          endDate: columnMapping.endDate ? String(row[headers.indexOf(columnMapping.endDate)] || "").trim() : null,
          maxStudents: columnMapping.maxStudents ? parseInt(String(row[headers.indexOf(columnMapping.maxStudents)] || "").trim(), 10) : null,
          status: columnMapping.status ? String(row[headers.indexOf(columnMapping.status)] || "").trim() : 'active',
        };

        // Map grade if provided
        if (columnMapping.grade) {
          const gradeName = String(row[headers.indexOf(columnMapping.grade)] || "").trim();
          if (gradeName) {
            const gradeId = gradeMap.get(gradeName.toLowerCase());
            if (gradeId) {
              classData.gradeId = gradeId;
            }
          }
        }

        classes.push(classData);
      } catch (error) {
        errors.push({ row: rowIndex, error: error.message });
      }
    }

    // Bulk create classes
    let imported = 0;
    for (const classData of classes) {
      try {
        await classService.create(classData);
        imported++;
      } catch (error) {
        errors.push({ row: `Class: ${classData.name}`, error: error.message });
      }
    }

    res.json({
      message: "Import completed",
      imported,
      errors: errors.length,
      details: { imported, errors },
    });
  } catch (error) {
    console.error("Error importing classes:", error);
    res.status(500).json({ message: "Error importing classes", error: error.message });
  }
};

// Import staff from Excel
export const importStaff = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    let columnMapping = req.body.columnMapping;
    if (typeof columnMapping === "string") {
      try {
        columnMapping = JSON.parse(columnMapping);
      } catch (e) {
        columnMapping = null;
      }
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const headers = data[0].map((h) => String(h || "").trim());
    
    // Auto-detect if not provided
    if (!columnMapping || Object.keys(columnMapping).length === 0) {
      columnMapping = autoDetectColumns(headers, "staff");
    }

    if (!columnMapping || (!columnMapping.firstName && !columnMapping.lastName)) {
      return res.status(400).json({ message: "First name and last name mapping are required. Could not auto-detect columns." });
    }
    
    const skipFirstRow = req.body.skipFirstRow !== false;
    const startRow = skipFirstRow ? 1 : 0;
    const rows = data.slice(startRow);

    const staff = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = startRow + i + 1;

      try {
        const firstName = columnMapping.firstName ? String(row[headers.indexOf(columnMapping.firstName)] || "").trim() : "";
        const lastName = columnMapping.lastName ? String(row[headers.indexOf(columnMapping.lastName)] || "").trim() : "";

        if (!firstName || !lastName) {
          errors.push({ row: rowIndex, error: "First name and last name are required" });
          continue;
        }

        const staffData = {
          firstName: sanitizeString(firstName),
          lastName: sanitizeString(lastName),
          employeeId: columnMapping.employeeId ? String(row[headers.indexOf(columnMapping.employeeId)] || "").trim() : null,
          title: columnMapping.title ? String(row[headers.indexOf(columnMapping.title)] || "").trim() : null,
          phone: columnMapping.phone ? String(row[headers.indexOf(columnMapping.phone)] || "").trim() : null,
          email: columnMapping.email ? String(row[headers.indexOf(columnMapping.email)] || "").trim() : null,
          hireDate: columnMapping.hireDate ? String(row[headers.indexOf(columnMapping.hireDate)] || "").trim() : null,
          employmentStatus: columnMapping.employmentStatus ? String(row[headers.indexOf(columnMapping.employmentStatus)] || "").trim() : 'active',
        };

        staff.push(staffData);
      } catch (error) {
        errors.push({ row: rowIndex, error: error.message });
      }
    }

    // Bulk create staff
    let imported = 0;
    for (const staffData of staff) {
      try {
        await staffService.create(staffData);
        imported++;
      } catch (error) {
        errors.push({ row: `Staff: ${staffData.firstName} ${staffData.lastName}`, error: error.message });
      }
    }

    res.json({
      message: "Import completed",
      imported,
      errors: errors.length,
      details: { imported, errors },
    });
  } catch (error) {
    console.error("Error importing staff:", error);
    res.status(500).json({ message: "Error importing staff", error: error.message });
  }
};

// Import families from Excel
export const importFamilies = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    let columnMapping = req.body.columnMapping;
    if (typeof columnMapping === "string") {
      try {
        columnMapping = JSON.parse(columnMapping);
      } catch (e) {
        columnMapping = null;
      }
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const headers = data[0].map((h) => String(h || "").trim());
    
    // Auto-detect if not provided
    if (!columnMapping || Object.keys(columnMapping).length === 0) {
      columnMapping = autoDetectColumns(headers, "families");
    }
    const skipFirstRow = req.body.skipFirstRow !== false;
    const startRow = skipFirstRow ? 1 : 0;
    const rows = data.slice(startRow);

    const families = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = startRow + i + 1;

      try {
        const familyData = {
          familyName: columnMapping.familyName ? String(row[headers.indexOf(columnMapping.familyName)] || "").trim() : null,
          address: columnMapping.address ? String(row[headers.indexOf(columnMapping.address)] || "").trim() : null,
          city: columnMapping.city ? String(row[headers.indexOf(columnMapping.city)] || "").trim() : null,
          state: columnMapping.state ? String(row[headers.indexOf(columnMapping.state)] || "").trim() : null,
          zipCode: columnMapping.zipCode ? String(row[headers.indexOf(columnMapping.zipCode)] || "").trim() : null,
          phone: columnMapping.phone ? String(row[headers.indexOf(columnMapping.phone)] || "").trim() : null,
          email: columnMapping.email ? String(row[headers.indexOf(columnMapping.email)] || "").trim() : null,
        };

        // At least family name or email/phone should be provided
        if (!familyData.familyName && !familyData.email && !familyData.phone) {
          errors.push({ row: rowIndex, error: "Family name, email, or phone is required" });
          continue;
        }

        families.push(familyData);
      } catch (error) {
        errors.push({ row: rowIndex, error: error.message });
      }
    }

    // Bulk create families
    let imported = 0;
    for (const familyData of families) {
      try {
        await familyService.create(familyData);
        imported++;
      } catch (error) {
        errors.push({ row: `Family: ${familyData.familyName || familyData.email}`, error: error.message });
      }
    }

    res.json({
      message: "Import completed",
      imported,
      errors: errors.length,
      details: { imported, errors },
    });
  } catch (error) {
    console.error("Error importing families:", error);
    res.status(500).json({ message: "Error importing families", error: error.message });
  }
};

