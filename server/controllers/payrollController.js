/**
 * Payroll Controller
 * Handles payroll-related API requests
 */

import { payrollService, payrollHistoryService } from "../db/services/payrollService.js";
import { staffBenefitService } from "../db/services/staffManagementService.js";
import { query } from "../db/postgresConnect.js";

/**
 * Sync benefits from payroll to benefits table
 */
async function syncBenefitsFromPayroll(staffId, payrollData) {
  try {
    // Get the current payroll record to determine effective date
    const payroll = await payrollService.findByStaffId(staffId);
    if (!payroll) return;

    // Merge payrollData with existing payroll to get full data
    const fullPayrollData = { ...payroll, ...payrollData };

    const effectiveDate = payroll.createdAt 
      ? new Date(payroll.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Get existing benefits for matching
    const existingBenefits = await staffBenefitService.findByStaffId(staffId);

    // Benefit mappings from payroll to benefits table
    const benefitMappings = [
      {
        payrollField: 'insurance',
        type: 'health_insurance',
        name: 'Health Insurance',
        value: fullPayrollData.insurance,
      },
      {
        payrollField: 'retirement403b',
        type: 'retirement',
        name: '403B Retirement',
        value: fullPayrollData.retirement403b,
      },
      {
        payrollField: 'ccAnnualAmount',
        type: 'dcap',
        name: fullPayrollData.ccName || 'Childcare',
        value: fullPayrollData.ccAnnualAmount,
      },
      {
        payrollField: 'nachlas',
        type: 'other',
        name: 'Nachlas',
        value: fullPayrollData.nachlas,
      },
      {
        payrollField: 'otherBenefit',
        type: 'other',
        name: 'Other Benefit',
        value: fullPayrollData.otherBenefit,
      },
      {
        payrollField: 'parsonage',
        type: 'parsonage',
        name: 'Parsonage',
        value: fullPayrollData.parsonage,
      },
      {
        payrollField: 'travel',
        type: 'other',
        name: 'Travel',
        value: fullPayrollData.travel,
      },
    ];

    for (const mapping of benefitMappings) {
      const value = mapping.value;
      
      // Skip if value is null, undefined, or 0
      if (!value || parseFloat(value) <= 0) {
        // Remove existing benefit if value is now 0/null
        const existing = existingBenefits.find(
          b => b.benefitType === mapping.type && 
          b.benefitName === mapping.name &&
          (b.notes?.includes('payroll') || b.notes?.includes('Synced'))
        );
        if (existing) {
          await staffBenefitService.delete(existing.id);
        }
        continue;
      }

      const amount = parseFloat(value);

      // Find existing benefit with matching type and name (from payroll)
      // Also match if name matches even if notes don't (for backwards compatibility)
      const existing = existingBenefits.find(
        b => b.benefitType === mapping.type && 
        ((b.benefitName === mapping.name && (b.notes?.includes('payroll') || b.notes?.includes('Synced'))) ||
         (b.benefitName === mapping.name && mapping.type !== 'other')) // For non-other types, match by type and name
      );

      if (existing) {
        // Update existing benefit
        await staffBenefitService.update(existing.id, {
          employerContribution: amount,
          benefitName: mapping.name, // Update name in case ccName changed
        });
      } else {
        // Create new benefit
        await staffBenefitService.create({
          staffId,
          benefitType: mapping.type,
          benefitName: mapping.name,
          employerContribution: amount,
          employeeContribution: 0,
          effectiveDate,
          notes: `Synced from payroll data`,
        });
      }
    }
  } catch (error) {
    console.error('Error syncing benefits from payroll:', error);
    // Don't throw - this is a sync operation, shouldn't fail the main update
  }
}

export const getPayroll = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { academicYear } = req.query;

    const payroll = await payrollService.findByStaffId(staffId, academicYear);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll record not found" });
    }
    res.json({ payroll });
  } catch (error) {
    console.error("Error getting payroll:", error);
    res.status(500).json({ message: "Error getting payroll", error: error.message });
  }
};

export const getAllPayrollByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const payrolls = await payrollService.findAllByStaffId(staffId);
    res.json({ payrolls });
  } catch (error) {
    console.error("Error getting all payroll records:", error);
    res.status(500).json({ message: "Error getting payroll records", error: error.message });
  }
};

export const createPayroll = async (req, res) => {
  try {
    const { staffId } = req.params;
    const payroll = await payrollService.create(staffId, req.body);

    // Sync benefits to benefits table
    if (payroll && payroll.id) {
      await syncBenefitsFromPayroll(staffId, req.body);
    }

    res.status(201).json({ message: "Payroll record created successfully", payroll });
  } catch (error) {
    console.error("Error creating payroll:", error);
    res.status(500).json({ message: "Error creating payroll", error: error.message });
  }
};

export const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await payrollService.update(id, req.body);
    if (!payroll) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    // Sync benefits to benefits table
    const payrollRecord = await payrollService.findById(id);
    if (payrollRecord && payrollRecord.staffId) {
      await syncBenefitsFromPayroll(payrollRecord.staffId, req.body);
    }

    res.json({ message: "Payroll record updated successfully", payroll });
  } catch (error) {
    console.error("Error updating payroll:", error);
    res.status(500).json({ message: "Error updating payroll", error: error.message });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    await payrollService.delete(id);
    res.json({ message: "Payroll record deleted successfully" });
  } catch (error) {
    console.error("Error deleting payroll:", error);
    res.status(500).json({ message: "Error deleting payroll", error: error.message });
  }
};

export const getPayrollHistory = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { payrollId } = req.query;

    let history;
    if (payrollId) {
      history = await payrollHistoryService.findByPayrollId(payrollId);
    } else {
      history = await payrollHistoryService.findByStaffId(staffId);
    }
    res.json({ history });
  } catch (error) {
    console.error("Error getting payroll history:", error);
    res.status(500).json({ message: "Error getting payroll history", error: error.message });
  }
};

export const createPayrollHistory = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { payrollId, changeDate, changeDescription, changeAmount, changeType, changes } = req.body;

    if (!payrollId || !changeDate) {
      return res.status(400).json({ message: "payrollId and changeDate are required" });
    }

    const history = await payrollHistoryService.create(staffId, payrollId, {
      changeDate,
      changeDescription,
      changeAmount,
      changeType,
      changes,
    });
    res.status(201).json({ message: "Payroll history record created successfully", history });
  } catch (error) {
    console.error("Error creating payroll history:", error);
    res.status(500).json({ message: "Error creating payroll history", error: error.message });
  }
};

