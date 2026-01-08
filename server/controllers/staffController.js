/**
 * Staff Controller
 * CRUD operations for staff (teachers, principals, etc.)
 * Includes salaries, benefits, and documents management
 */

import { staffService } from "../db/services/staffService.js";
import {
  staffSalaryService,
  staffBenefitService,
  staffDocumentService,
} from "../db/services/staffManagementService.js";
import { payrollService } from "../db/services/payrollService.js";
import { query } from "../db/postgresConnect.js";

/**
 * Sync benefits back to payroll when benefits are updated
 */
async function syncBenefitsToPayroll(staffId, benefitData) {
  try {
    // Get current payroll record
    const payroll = await payrollService.findByStaffId(staffId);
    if (!payroll) return; // No payroll record, nothing to sync to

    // Get all current benefits for this staff member
    const allBenefits = await staffBenefitService.findByStaffId(staffId);

    // Map benefit types to payroll fields
    const benefitPayrollMap = {
      'health_insurance': 'insurance',
      'retirement': 'retirement403b',
    };

    const updates = {};

    // Update specific benefit fields
    if (benefitData.benefitType === 'health_insurance') {
      updates.insurance = benefitData.employerContribution || 0;
    } else if (benefitData.benefitType === 'retirement') {
      updates.retirement403b = benefitData.employerContribution || 0;
    } else if (benefitData.benefitType === 'parsonage') {
      updates.parsonage = benefitData.employerContribution || 0;
    } else if (benefitData.benefitType === 'dcap' || benefitData.benefitType === 'childcare') {
      // DCAP/Childcare benefits sync to payroll ccAnnualAmount and ccName
      updates.ccAnnualAmount = benefitData.employerContribution || 0;
      if (benefitData.providerName) {
        updates.ccName = benefitData.providerName;
      } else if (benefitData.benefitName) {
        updates.ccName = benefitData.benefitName;
      }
    } else if (benefitData.benefitType === 'other') {
      // For other benefits, check the benefit name to map to correct field
      const name = (benefitData.benefitName || '').toLowerCase();
      if (name.includes('nachlas')) {
        updates.nachlas = benefitData.employerContribution || 0;
      } else if (name.includes('travel')) {
        updates.travel = benefitData.employerContribution || 0;
      } else if (name.includes('other')) {
        updates.otherBenefit = benefitData.employerContribution || 0;
      }
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      await payrollService.update(payroll.id, updates);
    }
  } catch (error) {
    console.error('Error syncing benefits to payroll:', error);
    // Don't throw - this is a sync operation, shouldn't fail the main update
  }
}

export const getAllStaff = async (req, res) => {
  try {
    const { employmentStatus, search, limit, offset } = req.query;
    const staff = await staffService.findAll({
      employmentStatus,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    
    // Include positions for each staff member
    const staffWithPositions = await Promise.all(
      staff.map(async (member) => {
        const positions = await staffService.getPositions(member.id, true); // Include inactive for list view
        return {
          ...member,
          positions,
        };
      })
    );
    
    res.json({ staff: staffWithPositions });
  } catch (error) {
    console.error("Error getting staff:", error);
    res.status(500).json({ message: "Error fetching staff", error: error.message });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const staff = await staffService.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    
    // Get additional info (include inactive positions for detail view)
    const positions = await staffService.getPositions(staff.id, true);
    const classes = await staffService.getClasses(staff.id);
    const isPrincipal = await staffService.isPrincipal(staff.id);
    const salaries = await staffSalaryService.findByStaffId(staff.id);
    const benefits = await staffBenefitService.findByStaffId(staff.id);
    const documents = await staffDocumentService.findByStaffId(staff.id);
    
    // Get payroll (optional - table might not exist yet)
    let payroll = null;
    try {
      payroll = await payrollService.findByStaffId(staff.id);
    } catch (error) {
      // Table might not exist yet - ignore error
      if (!error.message.includes("does not exist")) {
        console.error("Error fetching payroll:", error.message);
      }
    }
    
    res.json({
      staff: {
        ...staff,
        positions,
        classes,
        isPrincipal,
        salaries,
        benefits,
        documents,
        payroll,
      },
    });
  } catch (error) {
    console.error("Error getting staff:", error);
    res.status(500).json({ message: "Error fetching staff", error: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const staff = await staffService.create(req.body);
    res.status(201).json({ message: "Staff member created successfully", staff });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ message: "Error creating staff", error: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await staffService.update(id, req.body);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.json({ message: "Staff member updated successfully", staff });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Error updating staff", error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await staffService.delete(id);
    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Error deleting staff", error: error.message });
  }
};

// ============================================
// POSITIONS
// ============================================

export const getStaffPositions = async (req, res) => {
  try {
    const { staffId } = req.params;
    const positions = await staffService.getPositions(staffId);
    res.json({ positions });
  } catch (error) {
    console.error("Error getting positions:", error);
    res.status(500).json({ message: "Error fetching positions", error: error.message });
  }
};

export const createPosition = async (req, res) => {
  try {
    const { staffId } = req.params;
    const position = await staffService.addPosition(
      staffId,
      req.body.positionId || null,
      req.body.positionName || null,
      req.body.gradeId || null,
      req.body.startDate || null,
      req.body.endDate || null
    );
    res.status(201).json({ message: "Position added successfully", position });
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ message: "Error creating position", error: error.message });
  }
};

export const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    await staffService.removePosition(id);
    res.json({ message: "Position removed successfully" });
  } catch (error) {
    console.error("Error deleting position:", error);
    res.status(500).json({ message: "Error deleting position", error: error.message });
  }
};

// ============================================
// SALARIES
// ============================================

export const getStaffSalaries = async (req, res) => {
  try {
    const { staffId } = req.params;
    const salaries = await staffSalaryService.findByStaffId(staffId);
    res.json({ salaries });
  } catch (error) {
    console.error("Error getting salaries:", error);
    res.status(500).json({ message: "Error fetching salaries", error: error.message });
  }
};

export const createSalary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const salary = await staffSalaryService.create({
      ...req.body,
      staffId,
      createdBy: req.user._id || req.user.id,
    });
    res.status(201).json({ message: "Salary created successfully", salary });
  } catch (error) {
    console.error("Error creating salary:", error);
    res.status(500).json({ message: "Error creating salary", error: error.message });
  }
};

export const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await staffSalaryService.update(id, req.body);
    if (!salary) {
      return res.status(404).json({ message: "Salary not found" });
    }
    res.json({ message: "Salary updated successfully", salary });
  } catch (error) {
    console.error("Error updating salary:", error);
    res.status(500).json({ message: "Error updating salary", error: error.message });
  }
};

export const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params;
    await staffSalaryService.delete(id);
    res.json({ message: "Salary deleted successfully" });
  } catch (error) {
    console.error("Error deleting salary:", error);
    res.status(500).json({ message: "Error deleting salary", error: error.message });
  }
};

// ============================================
// BENEFITS
// ============================================

export const getStaffBenefits = async (req, res) => {
  try {
    const { staffId } = req.params;
    const benefits = await staffBenefitService.findByStaffId(staffId);
    res.json({ benefits });
  } catch (error) {
    console.error("Error getting benefits:", error);
    res.status(500).json({ message: "Error fetching benefits", error: error.message });
  }
};

export const createBenefit = async (req, res) => {
  try {
    const { staffId } = req.params;
    const benefit = await staffBenefitService.create({
      ...req.body,
      staffId,
      createdBy: req.user._id || req.user.id,
    });

    // Sync to payroll if benefit is from payroll (marked in notes) or is a known payroll benefit type
    if (req.body.notes?.includes('payroll') || 
        ['health_insurance', 'retirement', 'parsonage', 'dcap', 'childcare'].includes(benefit.benefitType) ||
        (benefit.benefitType === 'other' && ['Nachlas', 'Travel', 'Other Benefit'].some(name => 
          benefit.benefitName?.includes(name)))) {
      await syncBenefitsToPayroll(staffId, benefit);
    }

    res.status(201).json({ message: "Benefit created successfully", benefit });
  } catch (error) {
    console.error("Error creating benefit:", error);
    res.status(500).json({ message: "Error creating benefit", error: error.message });
  }
};

export const updateBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the benefit before update to check staff_id and if it's a payroll benefit
    const benefitResult = await query(
      "SELECT staff_id, benefit_type, benefit_name, notes FROM staff_benefits WHERE id = $1",
      [id]
    );
    
    if (benefitResult.rows.length === 0) {
      return res.status(404).json({ message: "Benefit not found" });
    }

    const oldBenefit = benefitResult.rows[0];
    const staffId = oldBenefit.staff_id;
    
    const benefit = await staffBenefitService.update(id, req.body);
    if (!benefit) {
      return res.status(404).json({ message: "Benefit not found" });
    }

    // Sync to payroll if this is a payroll-related benefit
    const benefitToSync = { ...benefit, benefitType: benefit.benefitType || oldBenefit.benefit_type };
    // Check if notes indicate it's from payroll or if it matches payroll benefit patterns
    const isPayrollBenefit = oldBenefit.notes?.includes('payroll') || oldBenefit.notes?.includes('Synced') ||
      oldBenefit.notes?.includes('payroll') ||
      ['health_insurance', 'retirement', 'parsonage', 'dcap', 'childcare'].includes(benefitToSync.benefitType) ||
      (benefitToSync.benefitType === 'other' && ['Nachlas', 'Travel', 'Other Benefit'].some(name => 
        (benefitToSync.benefitName || oldBenefit.benefit_name || '').includes(name)));

    if (isPayrollBenefit && staffId) {
      await syncBenefitsToPayroll(staffId, benefitToSync);
    }

    res.json({ message: "Benefit updated successfully", benefit });
  } catch (error) {
    console.error("Error updating benefit:", error);
    res.status(500).json({ message: "Error updating benefit", error: error.message });
  }
};

export const deleteBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    await staffBenefitService.delete(id);
    res.json({ message: "Benefit deleted successfully" });
  } catch (error) {
    console.error("Error deleting benefit:", error);
    res.status(500).json({ message: "Error deleting benefit", error: error.message });
  }
};

// ============================================
// DOCUMENTS
// ============================================

export const getStaffDocuments = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { documentType } = req.query;
    const documents = await staffDocumentService.findByStaffId(staffId, documentType);
    res.json({ documents });
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).json({ message: "Error fetching documents", error: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { documentType, documentName, expirationDate, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    if (!documentType || !documentName) {
      return res.status(400).json({ message: "Document type and name are required" });
    }

    // Upload file to GCS
    const { uploadFile } = await import("../utils/storage/gcsStorage.js");
    const fileExtension = req.file.originalname.split('.').pop() || 'bin';
    const fileName = `staff-documents/${staffId}/${Date.now()}-${documentName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
    
    const uploadResult = await uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype || 'application/octet-stream',
      'staff-documents', // pathPrefix
      365 // expiresInDays - 1 year for documents
    );

    const document = await staffDocumentService.create({
      staffId,
      documentType,
      documentName,
      fileUrl: uploadResult.gcsPath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      expirationDate: expirationDate || null,
      notes: notes || null,
      uploadedBy: req.user._id || req.user.id,
    });

    res.status(201).json({ message: "Document uploaded successfully", document });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ message: "Error creating document", error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await staffDocumentService.update(id, req.body);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json({ message: "Document updated successfully", document });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ message: "Error updating document", error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await staffDocumentService.delete(id);
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Error deleting document", error: error.message });
  }
};

export const getDocumentDownloadUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await staffDocumentService.findById(id);
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Generate signed URL for download
    const { getSignedUrl } = await import("../utils/storage/gcsStorage.js");
    const signedUrl = await getSignedUrl(document.fileUrl, 24); // 24 hour expiry

    res.json({ signedUrl });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({ message: "Error generating download URL", error: error.message });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "Photo file is required" });
    }

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." });
    }

    // Upload photo to GCS
    const { uploadFile } = await import("../utils/storage/gcsStorage.js");
    const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
    const fileName = `staff-photos/${staffId}/${Date.now()}-photo.${fileExtension}`;
    
    const uploadResult = await uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype,
      'staff-photos', // pathPrefix
      365 // expiresInDays - 1 year
    );

    // Get existing staff to check for old photo
    const existingStaff = await staffService.findById(staffId);
    if (existingStaff?.photoUrl) {
      try {
        // Delete old photo from GCS
        const { deleteFile } = await import("../utils/storage/gcsStorage.js");
        await deleteFile(existingStaff.photoUrl);
      } catch (err) {
        console.warn("Warning: Could not delete old photo:", err.message);
        // Continue even if old photo deletion fails
      }
    }

    // Update staff record with new photo URL
    const updatedStaff = await staffService.update(staffId, {
      photoUrl: uploadResult.gcsPath,
    });

    // Generate signed URL for immediate use
    const { getSignedUrl } = await import("../utils/storage/gcsStorage.js");
    const photoUrl = await getSignedUrl(uploadResult.gcsPath, 8760); // 1 year expiry

    res.status(200).json({ 
      message: "Photo uploaded successfully", 
      photoUrl,
      gcsPath: uploadResult.gcsPath,
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ message: "Error uploading photo", error: error.message });
  }
};

export const getPhotoUrl = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await staffService.findById(staffId);
    
    if (!staff || !staff.photoUrl) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Generate signed URL for display
    const { getSignedUrl } = await import("../utils/storage/gcsStorage.js");
    const signedUrl = await getSignedUrl(staff.photoUrl, 8760); // 1 year expiry

    res.json({ url: signedUrl });
  } catch (error) {
    console.error("Error getting photo URL:", error);
    res.status(500).json({ message: "Error getting photo URL", error: error.message });
  }
};

