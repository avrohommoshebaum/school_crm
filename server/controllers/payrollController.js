/**
 * Payroll Controller
 * Handles payroll-related API requests
 */

import { payrollService, payrollHistoryService } from "../db/services/payrollService.js";

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

