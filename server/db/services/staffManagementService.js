/**
 * Staff Management Service
 * Handles salaries, benefits, and documents for staff
 */

import { query } from "../postgresConnect.js";

// ============================================
// SALARIES
// ============================================

const rowToSalary = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    staffId: row.staff_id,
    salaryAmount: parseFloat(row.salary_amount),
    salaryType: row.salary_type,
    effectiveDate: row.effective_date,
    endDate: row.end_date,
    payFrequency: row.pay_frequency,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const staffSalaryService = {
  async findByStaffId(staffId) {
    if (!staffId) return [];
    const result = await query(
      `SELECT * FROM staff_salaries 
       WHERE staff_id = $1 
       ORDER BY effective_date DESC`,
      [staffId]
    );
    return result.rows.map(rowToSalary);
  },

  async findCurrent(staffId) {
    if (!staffId) return null;
    const result = await query(
      `SELECT * FROM staff_salaries 
       WHERE staff_id = $1 
       AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       ORDER BY effective_date DESC 
       LIMIT 1`,
      [staffId]
    );
    return result.rows.length > 0 ? rowToSalary(result.rows[0]) : null;
  },

  async create(salaryData) {
    const result = await query(
      `INSERT INTO staff_salaries (
        staff_id, salary_amount, salary_type, effective_date, end_date,
        pay_frequency, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        salaryData.staffId,
        salaryData.salaryAmount,
        salaryData.salaryType || 'annual',
        salaryData.effectiveDate,
        salaryData.endDate || null,
        salaryData.payFrequency || 'monthly',
        salaryData.notes || null,
        salaryData.createdBy || null,
      ]
    );
    return rowToSalary(result.rows[0]);
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.salaryAmount !== undefined) {
      fields.push(`salary_amount = $${paramIndex++}`);
      values.push(updates.salaryAmount);
    }
    if (updates.salaryType !== undefined) {
      fields.push(`salary_type = $${paramIndex++}`);
      values.push(updates.salaryType);
    }
    if (updates.effectiveDate !== undefined) {
      fields.push(`effective_date = $${paramIndex++}`);
      values.push(updates.effectiveDate);
    }
    if (updates.endDate !== undefined) {
      fields.push(`end_date = $${paramIndex++}`);
      values.push(updates.endDate);
    }
    if (updates.payFrequency !== undefined) {
      fields.push(`pay_frequency = $${paramIndex++}`);
      values.push(updates.payFrequency);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      const result = await query("SELECT * FROM staff_salaries WHERE id = $1", [id]);
      return result.rows.length > 0 ? rowToSalary(result.rows[0]) : null;
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE staff_salaries SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows.length > 0 ? rowToSalary(result.rows[0]) : null;
  },

  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM staff_salaries WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToSalary(result.rows[0]) : null;
  },

  async delete(id) {
    await query("DELETE FROM staff_salaries WHERE id = $1", [id]);
    return true;
  },
};

// ============================================
// BENEFITS
// ============================================

const rowToBenefit = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    staffId: row.staff_id,
    benefitType: row.benefit_type,
    benefitName: row.benefit_name,
    provider: row.provider,
    providerName: row.provider_name,
    providerEinOrSsn: row.provider_ein_or_ssn,
    coverageAmount: row.coverage_amount ? parseFloat(row.coverage_amount) : null,
    employeeContribution: parseFloat(row.employee_contribution || 0),
    employerContribution: parseFloat(row.employer_contribution || 0),
    effectiveDate: row.effective_date,
    endDate: row.end_date,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const staffBenefitService = {
  async findByStaffId(staffId) {
    if (!staffId) return [];
    const result = await query(
      `SELECT * FROM staff_benefits 
       WHERE staff_id = $1 
       ORDER BY effective_date DESC`,
      [staffId]
    );
    return result.rows.map(rowToBenefit);
  },

  async findCurrent(staffId) {
    if (!staffId) return [];
    const result = await query(
      `SELECT * FROM staff_benefits 
       WHERE staff_id = $1 
       AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       ORDER BY effective_date DESC`,
      [staffId]
    );
    return result.rows.map(rowToBenefit);
  },

  async create(benefitData) {
    const result = await query(
      `INSERT INTO staff_benefits (
        staff_id, benefit_type, benefit_name, provider, provider_name, provider_ein_or_ssn, coverage_amount,
        employee_contribution, employer_contribution, effective_date, end_date, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        benefitData.staffId,
        benefitData.benefitType,
        benefitData.benefitName || null,
        benefitData.provider || null,
        benefitData.providerName || null,
        benefitData.providerEinOrSsn || null,
        benefitData.coverageAmount || null,
        benefitData.employeeContribution || 0,
        benefitData.employerContribution || 0,
        benefitData.effectiveDate,
        benefitData.endDate || null,
        benefitData.notes || null,
        benefitData.createdBy || null,
      ]
    );
    return rowToBenefit(result.rows[0]);
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      benefitType: 'benefit_type',
      benefitName: 'benefit_name',
      provider: 'provider',
      providerName: 'provider_name',
      providerEinOrSsn: 'provider_ein_or_ssn',
      coverageAmount: 'coverage_amount',
      employeeContribution: 'employee_contribution',
      employerContribution: 'employer_contribution',
      effectiveDate: 'effective_date',
      endDate: 'end_date',
      notes: 'notes',
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key] && value !== undefined) {
        fields.push(`${fieldMap[key]} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      const result = await query("SELECT * FROM staff_benefits WHERE id = $1", [id]);
      return result.rows.length > 0 ? rowToBenefit(result.rows[0]) : null;
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE staff_benefits SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows.length > 0 ? rowToBenefit(result.rows[0]) : null;
  },

  async delete(id) {
    await query("DELETE FROM staff_benefits WHERE id = $1", [id]);
    return true;
  },
};

// ============================================
// DOCUMENTS
// ============================================

const rowToDocument = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    staffId: row.staff_id,
    documentType: row.document_type,
    documentName: row.document_name,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    uploadDate: row.upload_date,
    expirationDate: row.expiration_date,
    notes: row.notes,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const staffDocumentService = {
  async findById(id) {
    if (!id) return null;
    const result = await query("SELECT * FROM staff_documents WHERE id = $1", [id]);
    return result.rows.length > 0 ? rowToDocument(result.rows[0]) : null;
  },

  async findByStaffId(staffId, documentType = null) {
    if (!staffId) return [];
    let sql = `SELECT * FROM staff_documents WHERE staff_id = $1`;
    const params = [staffId];
    
    if (documentType) {
      sql += ` AND document_type = $2`;
      params.push(documentType);
    }
    
    sql += ` ORDER BY upload_date DESC`;
    
    const result = await query(sql, params);
    return result.rows.map(rowToDocument);
  },

  async create(documentData) {
    const result = await query(
      `INSERT INTO staff_documents (
        staff_id, document_type, document_name, file_url, file_size,
        mime_type, upload_date, expiration_date, notes, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        documentData.staffId,
        documentData.documentType,
        documentData.documentName,
        documentData.fileUrl,
        documentData.fileSize || null,
        documentData.mimeType || null,
        documentData.uploadDate || new Date(),
        documentData.expirationDate || null,
        documentData.notes || null,
        documentData.uploadedBy || null,
      ]
    );
    return rowToDocument(result.rows[0]);
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMap = {
      documentType: 'document_type',
      documentName: 'document_name',
      fileUrl: 'file_url',
      fileSize: 'file_size',
      mimeType: 'mime_type',
      expirationDate: 'expiration_date',
      notes: 'notes',
    };

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key] && value !== undefined) {
        fields.push(`${fieldMap[key]} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      const result = await query("SELECT * FROM staff_documents WHERE id = $1", [id]);
      return result.rows.length > 0 ? rowToDocument(result.rows[0]) : null;
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE staff_documents SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows.length > 0 ? rowToDocument(result.rows[0]) : null;
  },

  async delete(id) {
    await query("DELETE FROM staff_documents WHERE id = $1", [id]);
    return true;
  },
};

