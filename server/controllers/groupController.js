import { groupService } from "../db/services/groupService.js";
import { groupMemberService } from "../db/services/groupMemberService.js";
import { validateMemberData, sanitizeString, normalizePhone } from "../utils/validation.js";
import XLSX from "xlsx";

// Get all groups
export const getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.findAll();
    res.json({ groups });
  } catch (error) {
    console.error("Error getting groups:", error);
    res.status(500).json({ message: "Error fetching groups", error: error.message });
  }
};

// Get group by ID
export const getGroupById = async (req, res) => {
  try {
    const group = await groupService.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.json({ group });
  } catch (error) {
    console.error("Error getting group:", error);
    res.status(500).json({ message: "Error fetching group", error: error.message });
  }
};

// Create group
export const createGroup = async (req, res) => {
  try {
    const { name, description, pin } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await groupService.create({
      name: name.trim(),
      description: description?.trim() || "",
      pin: pin?.trim() || undefined,
      createdBy: req.user._id || req.user.id,
    });

    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    console.error("Error creating group:", error);
    if (error.message.includes("PIN")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const { name, description, pin } = req.body;
    const groupId = req.params.id;

    const existingGroup = await groupService.findById(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (pin !== undefined) updates.pin = pin.trim();

    const updatedGroup = await groupService.update(groupId, updates);

    res.json({ message: "Group updated successfully", group: updatedGroup });
  } catch (error) {
    console.error("Error updating group:", error);
    if (error.message.includes("PIN")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating group", error: error.message });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    const existingGroup = await groupService.findById(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    await groupService.delete(groupId);

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Error deleting group", error: error.message });
  }
};

// Get group members
export const getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await groupService.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const members = await groupMemberService.findByGroupId(groupId);
    res.json({ members });
  } catch (error) {
    console.error("Error getting group members:", error);
    res.status(500).json({ message: "Error fetching members", error: error.message });
  }
};

// Add member to group
export const addMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name, email, phone, emails, phones, additionalFields } = req.body;

    const group = await groupService.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get existing emails and phones for duplicate checking
    const existingMembers = await groupMemberService.findByGroupId(groupId);
    
    const existingEmails = [];
    const existingPhones = [];
    for (const m of existingMembers) {
      const mEmails = m.emails || (m.email ? [m.email] : []);
      const mPhones = m.phones || (m.phone ? [m.phone] : []);
      existingEmails.push(...mEmails.map(e => e?.toLowerCase?.() || "").filter(e => e));
      // Normalize phones for comparison
      const normalizedPhones = mPhones.map(p => normalizePhone(String(p || ""))).filter(p => p);
      existingPhones.push(...normalizedPhones);
    }

    // Prepare member data for validation
    // Only include name if it's provided (not empty) and firstName/lastName are not being used
    const memberData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emails: emails || (email ? [email] : []),
      phones: phones || (phone ? [phone] : []),
    };
    // Only include name if it's not empty (for backward compatibility)
    if (name && name.trim()) {
      memberData.name = name;
    }

    // Validate and sanitize member data
    const validation = validateMemberData(memberData, {
      existingEmails,
      existingPhones,
      skipDuplicates: false,
    });

    if (!validation.valid) {
      // Create a user-friendly error message from validation errors
      const errorMessages = validation.errors.map(e => e.message);
      const primaryMessage = errorMessages[0] || "Validation failed";
      return res.status(400).json({
        message: primaryMessage,
        errors: validation.errors,
      });
    }

    const member = await groupMemberService.create({
      groupId,
      name: validation.sanitized.name,
      firstName: validation.sanitized.firstName,
      lastName: validation.sanitized.lastName,
      emails: validation.sanitized.emails,
      phones: validation.sanitized.phones,
      // Legacy support
      email: validation.sanitized.emails[0] || "",
      phone: validation.sanitized.phones[0] || "",
      additionalFields: additionalFields || {},
      createdBy: req.user._id || req.user.id,
    });

    res.status(201).json({ message: "Member added successfully", member });
  } catch (error) {
    console.error("Error adding member:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error adding member", error: error.message });
  }
};

// Update member
export const updateMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const { name, email, phone, emails, phones, additionalFields } = req.body;

    const existingMember = await groupMemberService.findById(memberId);
    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Get existing emails and phones from other members for duplicate checking
    const existingMembers = await groupMemberService.findByGroupId(existingMember.groupId);
    const existingEmails = [];
    const existingPhones = [];
    for (const m of existingMembers) {
      // Skip the current member being updated
      if ((m._id || m.id) === memberId) continue;
      const mEmails = m.emails || (m.email ? [m.email] : []);
      const mPhones = m.phones || (m.phone ? [m.phone] : []);
      existingEmails.push(...mEmails.map(e => e?.toLowerCase?.() || "").filter(e => e));
      // Normalize phones for comparison (they should already be normalized in DB, but normalize to be safe)
      existingPhones.push(...mPhones.map(p => normalizePhone(p || "")).filter(p => p));
    }

    // Determine what fields are being updated
    const finalFirstName = req.body.firstName !== undefined ? req.body.firstName : existingMember.firstName || "";
    const finalLastName = req.body.lastName !== undefined ? req.body.lastName : existingMember.lastName || "";
    const finalName = name !== undefined ? name : existingMember.name || "";
    const finalEmails = emails !== undefined ? (Array.isArray(emails) ? emails : [emails]) :
      email !== undefined ? [email] :
      existingMember.emails || (existingMember.email ? [existingMember.email] : []);
    const finalPhones = phones !== undefined ? (Array.isArray(phones) ? phones : [phones]) :
      phone !== undefined ? [phone] :
      existingMember.phones || (existingMember.phone ? [existingMember.phone] : []);

    // Prepare member data for validation
    const memberData = {
      firstName: finalFirstName,
      lastName: finalLastName,
      emails: finalEmails,
      phones: finalPhones,
    };
    // Only include name if it's not empty (for backward compatibility)
    if (finalName && finalName.trim()) {
      memberData.name = finalName;
    }

    // Validate and sanitize member data
    const validation = validateMemberData(memberData, {
      existingEmails,
      existingPhones,
      skipDuplicates: false,
    });

    if (!validation.valid) {
      // Create a user-friendly error message from validation errors
      const errorMessages = validation.errors.map(e => e.message);
      const primaryMessage = errorMessages[0] || "Validation failed";
      return res.status(400).json({
        message: primaryMessage,
        errors: validation.errors,
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = validation.sanitized.name;
    if (req.body.firstName !== undefined) updates.firstName = validation.sanitized.firstName;
    if (req.body.lastName !== undefined) updates.lastName = validation.sanitized.lastName;
    if (emails !== undefined || email !== undefined) {
      updates.emails = validation.sanitized.emails;
    }
    if (phones !== undefined || phone !== undefined) {
      updates.phones = validation.sanitized.phones;
    }
    if (additionalFields !== undefined) updates.additionalFields = additionalFields;

    const updatedMember = await groupMemberService.update(memberId, updates);

    res.json({ message: "Member updated successfully", member: updatedMember });
  } catch (error) {
    console.error("Error updating member:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating member", error: error.message });
  }
};

// Delete member
export const deleteMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;

    const existingMember = await groupMemberService.findById(memberId);
    if (!existingMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    await groupMemberService.delete(memberId);

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ message: "Error deleting member", error: error.message });
  }
};

// Delete multiple members
export const deleteMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ message: "memberIds array is required" });
    }

    await groupMemberService.deleteMany(memberIds);

    res.json({ message: "Members deleted successfully" });
  } catch (error) {
    console.error("Error deleting members:", error);
    res.status(500).json({ message: "Error deleting members", error: error.message });
  }
};

// Parse Excel file and return headers + sample data
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

    // First row is headers
    const headers = data[0].map((h) => String(h || "").trim()).filter((h) => h);
    const sampleRows = data.slice(1, Math.min(6, data.length)); // First 5 data rows

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

// Import members from Excel with column mapping
export const importMembersFromExcel = async (req, res) => {
  try {
    const { groupId, skipFirstRow = true } = req.body;
    
    // Parse columnMapping - it might come as a JSON string from FormData
    let columnMapping = req.body.columnMapping;
    if (typeof columnMapping === "string") {
      try {
        columnMapping = JSON.parse(columnMapping);
      } catch (e) {
        return res.status(400).json({ message: "Invalid columnMapping format" });
      }
    }

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    // Validate that at least one field is mapped
    if (!columnMapping || (!columnMapping.firstName && !columnMapping.lastName && !columnMapping.name && !columnMapping.email && !columnMapping.phone)) {
      return res.status(400).json({ 
        message: "At least one field (first name, last name, name, email, or phone) must be mapped" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const group = await groupService.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Parse Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Get headers
    const headers = data[0].map((h) => String(h || "").trim());
    const startRow = skipFirstRow ? 1 : 0;
    const rows = data.slice(startRow);

    // Get existing members for duplicate checking
    const existingMembers = await groupMemberService.findByGroupId(groupId);
    const existingEmails = [];
    const existingPhones = [];
    for (const m of existingMembers) {
      const mEmails = m.emails || (m.email ? [m.email] : []);
      const mPhones = m.phones || (m.phone ? [m.phone] : []);
      existingEmails.push(...mEmails.map(e => e?.toLowerCase?.() || "").filter(e => e));
      // Normalize phones for comparison (they should already be normalized in DB, but normalize to be safe)
      existingPhones.push(...mPhones.map(p => normalizePhone(p || "")).filter(p => p));
    }

    // Map columns to fields with validation
    const members = [];
    const errors = [];
    const allValidatedEmails = [...existingEmails];
    const allValidatedPhones = [...existingPhones];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = startRow + i + 1;

      try {
        const memberData = {
          firstName: "",
          lastName: "",
          emails: [],
          phones: [],
          additionalFields: {},
        };

        // Map firstName
        if (columnMapping.firstName && columnMapping.firstName !== "none") {
          const colIndex = headers.indexOf(columnMapping.firstName);
          if (colIndex >= 0 && row[colIndex] !== undefined && row[colIndex] !== null && String(row[colIndex]).trim()) {
            memberData.firstName = sanitizeString(String(row[colIndex]));
          }
        }

        // Map lastName
        if (columnMapping.lastName && columnMapping.lastName !== "none") {
          const colIndex = headers.indexOf(columnMapping.lastName);
          if (colIndex >= 0 && row[colIndex] !== undefined && row[colIndex] !== null && String(row[colIndex]).trim()) {
            memberData.lastName = sanitizeString(String(row[colIndex]));
          }
        }

        // Map name (legacy support - only if firstName/lastName are not provided)
        if (!memberData.firstName && !memberData.lastName && columnMapping.name && columnMapping.name !== "none") {
          const colIndex = headers.indexOf(columnMapping.name);
          if (colIndex >= 0 && row[colIndex] !== undefined && row[colIndex] !== null && String(row[colIndex]).trim()) {
            memberData.name = sanitizeString(String(row[colIndex]));
          }
        }

        if (columnMapping.email && columnMapping.email !== "none") {
          const colIndex = headers.indexOf(columnMapping.email);
          if (colIndex >= 0 && row[colIndex] !== undefined && row[colIndex] !== null && String(row[colIndex]).trim()) {
            memberData.emails.push(String(row[colIndex]).trim());
          }
        }

        if (columnMapping.phone && columnMapping.phone !== "none") {
          const colIndex = headers.indexOf(columnMapping.phone);
          if (colIndex >= 0 && row[colIndex] !== undefined && row[colIndex] !== null && String(row[colIndex]).trim()) {
            const phoneValue = String(row[colIndex]).trim();
            // Skip invalid phone values like "No longer emloyee"
            if (phoneValue && !phoneValue.toLowerCase().includes("no longer") && !phoneValue.toLowerCase().includes("employee")) {
              memberData.phones.push(phoneValue);
            }
          }
        }

        // Skip empty rows - if row has no firstName, lastName, name, email, or phone data
        const hasData = memberData.firstName || memberData.lastName || memberData.name || 
                       memberData.emails.length > 0 || memberData.phones.length > 0;
        
        if (!hasData) {
          // Skip this row silently (it's empty)
          continue;
        }

        // Map additional fields
        if (columnMapping.additionalFields) {
          for (const [fieldName, columnName] of Object.entries(columnMapping.additionalFields)) {
            if (columnName && columnName !== "none") {
              const colIndex = headers.indexOf(columnName);
              if (colIndex >= 0 && row[colIndex]) {
                memberData.additionalFields[fieldName] = sanitizeString(String(row[colIndex]));
              }
            }
          }
        }

        // Validate member data
        const validation = validateMemberData(memberData, {
          existingEmails: allValidatedEmails,
          existingPhones: allValidatedPhones,
          skipDuplicates: false,
        });

        if (!validation.valid) {
          // Collect validation errors
          const errorMessages = validation.errors.map(e => e.message).join("; ");
          errors.push({ 
            row: rowIndex, 
            error: errorMessages,
            details: validation.errors,
            data: { 
              firstName: memberData.firstName, 
              lastName: memberData.lastName, 
              name: memberData.name || "", 
              emails: memberData.emails, 
              phones: memberData.phones 
            }
          });
          continue;
        }

        // Add validated emails/phones to the tracking arrays for subsequent rows
        allValidatedEmails.push(...validation.sanitized.emails);
        allValidatedPhones.push(...validation.sanitized.phones);

        // Create member object
        const member = {
          groupId,
          firstName: validation.sanitized.firstName,
          lastName: validation.sanitized.lastName,
          name: validation.sanitized.name || "", // Legacy support
          emails: validation.sanitized.emails,
          phones: validation.sanitized.phones,
          // Legacy support
          email: validation.sanitized.emails[0] || "",
          phone: validation.sanitized.phones[0] || "",
          additionalFields: memberData.additionalFields,
          createdBy: req.user._id || req.user.id,
        };

        members.push(member);
      } catch (error) {
        errors.push({ row: rowIndex, error: error.message });
      }
    }

    // Bulk insert members
    let imported = 0;
    if (members.length > 0) {
      // Process in batches of 500 (Firestore batch limit)
      const batchSize = 500;
      for (let i = 0; i < members.length; i += batchSize) {
        const batch = members.slice(i, i + batchSize);
        await groupMemberService.createMany(batch);
        imported += batch.length;
      }
    }

    res.json({
      message: "Import completed",
      imported,
      errors: errors.length,
      details: {
        imported,
        errors: errors, // Return all errors for user to review
      },
    });
  } catch (error) {
    console.error("Error importing members:", error);
    res.status(500).json({ message: "Error importing members", error: error.message });
  }
};

