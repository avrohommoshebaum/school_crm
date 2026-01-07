/**
 * Payroll Service
 * Handles comprehensive payroll data for staff members
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to payroll object
const rowToPayroll = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    staffId: row.staff_id,
    legalName: row.legal_name,
    grade: row.grade,
    jobNumber2: row.job_number_2,
    freeDaycare: row.free_daycare,
    misc2: row.misc_2,
    misc3: row.misc_3,
    totalPackage2526: row.total_package_25_26 ? parseFloat(row.total_package_25_26) : null,
    maxQuarter: row.max_quarter ? parseFloat(row.max_quarter) : null,
    tuition: row.tuition ? parseFloat(row.tuition) : null,
    actualQuarter: row.actual_quarter ? parseFloat(row.actual_quarter) : null,
    annualGrossSalary: row.annual_gross_salary ? parseFloat(row.annual_gross_salary) : null,
    nachlas: row.nachlas ? parseFloat(row.nachlas) : null,
    otherBenefit: row.other_benefit ? parseFloat(row.other_benefit) : null,
    parsonage: row.parsonage ? parseFloat(row.parsonage) : null,
    parsonageAllocation: row.parsonage_allocation ? parseFloat(row.parsonage_allocation) : null,
    travel: row.travel ? parseFloat(row.travel) : null,
    insurance: row.insurance ? parseFloat(row.insurance) : null,
    ccName: row.cc_name,
    ccAnnualAmount: row.cc_annual_amount ? parseFloat(row.cc_annual_amount) : null,
    retirement403b: row.retirement_403b ? parseFloat(row.retirement_403b) : null,
    paycheckAmount: row.paycheck_amount ? parseFloat(row.paycheck_amount) : null,
    monthlyParsonage: row.monthly_parsonage ? parseFloat(row.monthly_parsonage) : null,
    travelStipend: row.travel_stipend ? parseFloat(row.travel_stipend) : null,
    ccDeduction: row.cc_deduction ? parseFloat(row.cc_deduction) : null,
    insuranceDeduction: row.insurance_deduction ? parseFloat(row.insurance_deduction) : null,
    annualAdjustment: row.annual_adjustment ? parseFloat(row.annual_adjustment) : null,
    paychecksRemaining: row.paychecks_remaining,
    perPaycheckAdjustment: row.per_paycheck_adjustment ? parseFloat(row.per_paycheck_adjustment) : null,
    adjustedCheckAmount: row.adjusted_check_amount ? parseFloat(row.adjusted_check_amount) : null,
    ptoDays: row.pto_days ? parseFloat(row.pto_days) : null,
    academicYear: row.academic_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const payrollService = {
  async findByStaffId(staffId, academicYear = null) {
    if (!staffId) return null;
    try {
      let sql = "SELECT * FROM staff_payroll WHERE staff_id = $1";
      const params = [staffId];
      
      if (academicYear) {
        sql += " AND academic_year = $2";
        params.push(academicYear);
      } else {
        sql += " ORDER BY academic_year DESC LIMIT 1";
      }
      
      const result = await query(sql, params);
      return result.rows.length > 0 ? rowToPayroll(result.rows[0]) : null;
    } catch (error) {
      // If table doesn't exist, return null instead of throwing
      if (error.message && error.message.includes("does not exist")) {
        return null;
      }
      throw error;
    }
  },

  async findAllByStaffId(staffId) {
    if (!staffId) return [];
    try {
      const result = await query(
        "SELECT * FROM staff_payroll WHERE staff_id = $1 ORDER BY academic_year DESC",
        [staffId]
      );
      return result.rows.map(rowToPayroll);
    } catch (error) {
      // If table doesn't exist, return empty array instead of throwing
      if (error.message && error.message.includes("does not exist")) {
        return [];
      }
      throw error;
    }
  },

  async create(staffId, payrollData) {
    const {
      legalName,
      grade,
      jobNumber2,
      freeDaycare,
      misc2,
      misc3,
      totalPackage2526,
      maxQuarter,
      tuition,
      actualQuarter,
      annualGrossSalary,
      nachlas,
      otherBenefit,
      parsonage,
      parsonageAllocation,
      travel,
      insurance,
      ccName,
      ccAnnualAmount,
      retirement403b,
      paycheckAmount,
      monthlyParsonage,
      travelStipend,
      ccDeduction,
      insuranceDeduction,
      annualAdjustment,
      paychecksRemaining,
      perPaycheckAdjustment,
      adjustedCheckAmount,
      ptoDays,
      academicYear,
    } = payrollData;

    const result = await query(
      `INSERT INTO staff_payroll (
        staff_id, legal_name, grade, job_number_2, free_daycare, misc_2, misc_3,
        total_package_25_26, max_quarter, tuition, actual_quarter, annual_gross_salary,
        nachlas, other_benefit, parsonage, parsonage_allocation, travel, insurance,
        cc_name, cc_annual_amount, retirement_403b,
        paycheck_amount, monthly_parsonage, travel_stipend, cc_deduction, insurance_deduction,
        annual_adjustment, paychecks_remaining, per_paycheck_adjustment, adjusted_check_amount,
        pto_days, academic_year
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
      ) RETURNING *`,
      [
        staffId,
        legalName || null,
        grade || null,
        jobNumber2 || null,
        freeDaycare || false,
        misc2 || null,
        misc3 || null,
        totalPackage2526 || null,
        maxQuarter || null,
        tuition || null,
        actualQuarter || null,
        annualGrossSalary || null,
        nachlas || null,
        otherBenefit || null,
        parsonage || null,
        parsonageAllocation || null,
        travel || null,
        insurance || null,
        ccName || null,
        ccAnnualAmount || null,
        retirement403b || null,
        paycheckAmount || null,
        monthlyParsonage || null,
        travelStipend || null,
        ccDeduction || null,
        insuranceDeduction || null,
        annualAdjustment || null,
        paychecksRemaining || null,
        perPaycheckAdjustment || null,
        adjustedCheckAmount || null,
        ptoDays || null,
        academicYear || null,
      ]
    );
    return rowToPayroll(result.rows[0]);
  },

  async update(id, payrollData) {
    const {
      legalName,
      grade,
      jobNumber2,
      freeDaycare,
      misc2,
      misc3,
      totalPackage2526,
      maxQuarter,
      tuition,
      actualQuarter,
      annualGrossSalary,
      nachlas,
      otherBenefit,
      parsonage,
      parsonageAllocation,
      travel,
      insurance,
      ccName,
      ccAnnualAmount,
      retirement403b,
      paycheckAmount,
      monthlyParsonage,
      travelStipend,
      ccDeduction,
      insuranceDeduction,
      annualAdjustment,
      paychecksRemaining,
      perPaycheckAdjustment,
      adjustedCheckAmount,
      ptoDays,
      academicYear,
    } = payrollData;

    const result = await query(
      `UPDATE staff_payroll SET
        legal_name = $1, grade = $2, job_number_2 = $3, free_daycare = $4, misc_2 = $5, misc_3 = $6,
        total_package_25_26 = $7, max_quarter = $8, tuition = $9, actual_quarter = $10, annual_gross_salary = $11,
        nachlas = $12, other_benefit = $13, parsonage = $14, parsonage_allocation = $15, travel = $16, insurance = $17,
        cc_name = $18, cc_annual_amount = $19, retirement_403b = $20,
        paycheck_amount = $21, monthly_parsonage = $22, travel_stipend = $23, cc_deduction = $24, insurance_deduction = $25,
        annual_adjustment = $26, paychecks_remaining = $27, per_paycheck_adjustment = $28, adjusted_check_amount = $29,
        pto_days = $30, academic_year = $31, updated_at = CURRENT_TIMESTAMP
      WHERE id = $32
      RETURNING *`,
      [
        legalName || null,
        grade || null,
        jobNumber2 || null,
        freeDaycare || false,
        misc2 || null,
        misc3 || null,
        totalPackage2526 || null,
        maxQuarter || null,
        tuition || null,
        actualQuarter || null,
        annualGrossSalary || null,
        nachlas || null,
        otherBenefit || null,
        parsonage || null,
        parsonageAllocation || null,
        travel || null,
        insurance || null,
        ccName || null,
        ccAnnualAmount || null,
        retirement403b || null,
        paycheckAmount || null,
        monthlyParsonage || null,
        travelStipend || null,
        ccDeduction || null,
        insuranceDeduction || null,
        annualAdjustment || null,
        paychecksRemaining || null,
        perPaycheckAdjustment || null,
        adjustedCheckAmount || null,
        ptoDays || null,
        academicYear || null,
        id,
      ]
    );
    return result.rows.length > 0 ? rowToPayroll(result.rows[0]) : null;
  },

  async delete(id) {
    await query("DELETE FROM staff_payroll WHERE id = $1", [id]);
    return true;
  },
};

// ============================================
// PAYROLL HISTORY
// ============================================

const rowToPayrollHistory = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    staffId: row.staff_id,
    payrollId: row.payroll_id,
    changeDate: row.change_date,
    changeDescription: row.change_description,
    changeAmount: row.change_amount ? parseFloat(row.change_amount) : null,
    changeType: row.change_type,
    changes: row.changes,
    createdAt: row.created_at,
  };
};

export const payrollHistoryService = {
  async findByPayrollId(payrollId) {
    if (!payrollId) return [];
    const result = await query(
      "SELECT * FROM staff_payroll_history WHERE payroll_id = $1 ORDER BY change_date DESC",
      [payrollId]
    );
    return result.rows.map(rowToPayrollHistory);
  },

  async findByStaffId(staffId) {
    if (!staffId) return [];
    const result = await query(
      "SELECT * FROM staff_payroll_history WHERE staff_id = $1 ORDER BY change_date DESC",
      [staffId]
    );
    return result.rows.map(rowToPayrollHistory);
  },

  async create(staffId, payrollId, historyData) {
    const { changeDate, changeDescription, changeAmount, changeType, changes } = historyData;
    const result = await query(
      `INSERT INTO staff_payroll_history (
        staff_id, payroll_id, change_date, change_description, change_amount, change_type, changes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [staffId, payrollId, changeDate, changeDescription || null, changeAmount || null, changeType || null, changes ? JSON.stringify(changes) : null]
    );
    return rowToPayrollHistory(result.rows[0]);
  },
};

