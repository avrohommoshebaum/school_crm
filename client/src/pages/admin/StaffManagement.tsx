/**
 * Staff Management Page
 * Comprehensive staff management with positions, salaries, benefits, documents, and Excel import
 */

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Grid,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";

// ============================================
// TYPES
// ============================================

type Payroll = {
  id?: string;
  legalName?: string;
  grade?: string;
  jobNumber2?: string;
  freeDaycare?: boolean;
  misc2?: string;
  misc3?: string;
  totalPackage2526?: number;
  maxQuarter?: number;
  tuition?: number;
  actualQuarter?: number;
  annualGrossSalary?: number;
  nachlas?: number;
  otherBenefit?: number;
  parsonage?: number;
  parsonageAllocation?: number;
  travel?: number;
  insurance?: number;
  ccName?: string;
  ccAnnualAmount?: number;
  retirement403b?: number;
  paycheckAmount?: number;
  monthlyParsonage?: number;
  travelStipend?: number;
  ccDeduction?: number;
  insuranceDeduction?: number;
  annualAdjustment?: number;
  paychecksRemaining?: number;
  perPaycheckAdjustment?: number;
  adjustedCheckAmount?: number;
  ptoDays?: number;
  academicYear?: string;
};

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  title?: string;
  hireDate?: string;
  terminationDate?: string;
  employmentStatus: string;
  bio?: string;
  photoUrl?: string;
  notes?: string;
  positions?: Position[];
  salaries?: Salary[];
  benefits?: Benefit[];
  documents?: Document[];
  payroll?: Payroll;
};

type Position = {
  id: string;
  positionId?: string;
  positionName: string;
  gradeId?: string;
  gradeName?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
};

type Salary = {
  id: string;
  salaryAmount: number;
  salaryType: string;
  effectiveDate: string;
  endDate?: string;
  payFrequency: string;
  notes?: string;
};

type Benefit = {
  id: string;
  benefitType: string;
  benefitName?: string;
  provider?: string;
  coverageAmount?: number;
  employeeContribution: number;
  employerContribution: number;
  effectiveDate: string;
  endDate?: string;
  notes?: string;
};

type Document = {
  id: string;
  documentType: string;
  documentName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadDate: string;
  expirationDate?: string;
  notes?: string;
};

type Grade = {
  id: string;
  name: string;
  level: number;
};

// ============================================
// COMPONENT
// ============================================

export default function StaffManagement() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffMenuAnchor, setStaffMenuAnchor] = useState<null | HTMLElement>(null);
  const [staffMenuStaff, setStaffMenuStaff] = useState<Staff | null>(null);

  // Dialogs
  const [staffDialog, setStaffDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [positionDialog, setPositionDialog] = useState(false);
  const [salaryDialog, setSalaryDialog] = useState(false);
  const [benefitDialog, setBenefitDialog] = useState(false);
  const [documentDialog, setDocumentDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [positionsManagementDialog, setPositionsManagementDialog] = useState(false);
  const [positionEditDialog, setPositionEditDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [positionDeleteDialog, setPositionDeleteDialog] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [payrollDialog, setPayrollDialog] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

  // Forms
  const [staffForm, setStaffForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    title: "",
    hireDate: "",
    terminationDate: "",
    employmentStatus: "active",
    bio: "",
    notes: "",
    positionId: "",
    initialSalary: "",
    salaryType: "annual",
    payFrequency: "monthly",
    // Payroll fields
    legalName: "",
    grade: "",
    jobNumber2: "",
    freeDaycare: false,
    misc2: "",
    misc3: "",
    totalPackage2526: "",
    maxQuarter: "",
    tuition: "",
    actualQuarter: "",
    annualGrossSalary: "",
    nachlas: "",
    otherBenefit: "",
    parsonage: "",
    parsonageAllocation: "",
    travel: "",
    insurance: "",
    ccName: "",
    ccAnnualAmount: "",
    retirement403b: "",
    paycheckAmount: "",
    monthlyParsonage: "",
    travelStipend: "",
    ccDeduction: "",
    insuranceDeduction: "",
    annualAdjustment: "",
    paychecksRemaining: "",
    perPaycheckAdjustment: "",
    adjustedCheckAmount: "",
    ptoDays: "",
    academicYear: "",
  });

  const [positionForm, setPositionForm] = useState({
    positionId: "",
    positionName: "",
    gradeId: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [systemPositionForm, setSystemPositionForm] = useState({
    name: "",
    description: "",
    category: "",
    isActive: true,
  });

  const [salaryForm, setSalaryForm] = useState({
    salaryAmount: "",
    salaryType: "annual",
    effectiveDate: "",
    endDate: "",
    payFrequency: "monthly",
    notes: "",
  });

  const [benefitForm, setBenefitForm] = useState({
    benefitType: "",
    benefitName: "",
    provider: "",
    coverageAmount: "",
    employeeContribution: "",
    employerContribution: "",
    effectiveDate: "",
    endDate: "",
    notes: "",
  });

  const [documentForm, setDocumentForm] = useState({
    documentType: "",
    documentName: "",
    file: null as File | null,
    expirationDate: "",
    notes: "",
  });

  const [payrollForm, setPayrollForm] = useState({
    legalName: "",
    grade: "",
    jobNumber2: "",
    freeDaycare: false,
    misc2: "",
    misc3: "",
    totalPackage2526: "",
    maxQuarter: "",
    tuition: "",
    actualQuarter: "",
    annualGrossSalary: "",
    nachlas: "",
    otherBenefit: "",
    parsonage: "",
    parsonageAllocation: "",
    travel: "",
    insurance: "",
    ccName: "",
    ccAnnualAmount: "",
    retirement403b: "",
    paycheckAmount: "",
    monthlyParsonage: "",
    travelStipend: "",
    ccDeduction: "",
    insuranceDeduction: "",
    annualAdjustment: "",
    paychecksRemaining: "",
    perPaycheckAdjustment: "",
    adjustedCheckAmount: "",
    ptoDays: "",
    academicYear: "",
  });

  // Excel import
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "warning" });

  // Detail view tab
  const [detailTab, setDetailTab] = useState(0);

  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const canManage = hasPermission(user, "staff", "view") || user?.roles?.some((r: any) => r.name === "admin");

  // Load staff and grades
  useEffect(() => {
    if (!canManage) return;

    const loadData = async () => {
      if (hasLoadedRef.current || isFetchingRef.current) return;
      hasLoadedRef.current = true;
      isFetchingRef.current = true;

      try {
        setLoading(true);
        const [staffRes, gradesRes, positionsRes] = await Promise.all([
          api.get("/staff"),
          api.get("/grades"),
          api.get("/positions"),
        ]);

        setStaff(staffRes.data.staff || []);
        setGrades(gradesRes.data.grades || []);
        setPositions(positionsRes.data.positions || []);
      } catch (err: any) {
        console.error("Error loading data:", err);
        showSnackbar(err?.response?.data?.message || "Failed to load data", "error");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadData();
  }, [canManage]);

  const showSnackbar = (message: string, severity: "success" | "error" | "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter staff
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      !search ||
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeId?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.employmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Staff CRUD
  const handleOpenStaffDialog = (staffMember?: Staff) => {
    if (staffMember) {
      setSelectedStaff(staffMember);
      setStaffForm({
        firstName: staffMember.firstName || "",
        lastName: staffMember.lastName || "",
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        employeeId: staffMember.employeeId || "",
        title: staffMember.title || "",
        hireDate: staffMember.hireDate || "",
        terminationDate: staffMember.terminationDate || "",
        employmentStatus: staffMember.employmentStatus || "active",
        bio: staffMember.bio || "",
        notes: staffMember.notes || "",
        positionId: "",
        initialSalary: "",
        salaryType: "annual",
        payFrequency: "monthly",
        // Payroll fields
        legalName: "",
        grade: "",
        jobNumber2: "",
        freeDaycare: false,
        misc2: "",
        misc3: "",
        totalPackage2526: "",
        maxQuarter: "",
        tuition: "",
        actualQuarter: "",
        annualGrossSalary: "",
        nachlas: "",
        otherBenefit: "",
        parsonage: "",
        parsonageAllocation: "",
        travel: "",
        insurance: "",
        ccName: "",
        ccAnnualAmount: "",
        retirement403b: "",
        paycheckAmount: "",
        monthlyParsonage: "",
        travelStipend: "",
        ccDeduction: "",
        insuranceDeduction: "",
        annualAdjustment: "",
        paychecksRemaining: "",
        perPaycheckAdjustment: "",
        adjustedCheckAmount: "",
        ptoDays: "",
        academicYear: "",
      });
    } else {
      setSelectedStaff(null);
      setStaffForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        employeeId: "",
        title: "",
        hireDate: "",
        terminationDate: "",
        employmentStatus: "active",
        bio: "",
        notes: "",
        positionId: "",
        initialSalary: "",
        salaryType: "annual",
        payFrequency: "monthly",
        // Payroll fields
        legalName: "",
        grade: "",
        jobNumber2: "",
        freeDaycare: false,
        misc2: "",
        misc3: "",
        totalPackage2526: "",
        maxQuarter: "",
        tuition: "",
        actualQuarter: "",
        annualGrossSalary: "",
        nachlas: "",
        otherBenefit: "",
        parsonage: "",
        parsonageAllocation: "",
        travel: "",
        insurance: "",
        ccName: "",
        ccAnnualAmount: "",
        retirement403b: "",
        paycheckAmount: "",
        monthlyParsonage: "",
        travelStipend: "",
        ccDeduction: "",
        insuranceDeduction: "",
        annualAdjustment: "",
        paychecksRemaining: "",
        perPaycheckAdjustment: "",
        adjustedCheckAmount: "",
        ptoDays: "",
        academicYear: "",
      });
    }
    setStaffDialog(true);
  };

  const handleSaveStaff = async () => {
    try {
      const { 
        positionId, 
        initialSalary, 
        salaryType, 
        payFrequency,
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
        ...staffData 
      } = staffForm;
      
      if (selectedStaff) {
        await api.put(`/staff/${selectedStaff.id}`, staffData);
        showSnackbar("Staff member updated successfully", "success");
      } else {
        // Create staff member
        const { data } = await api.post("/staff", staffData);
        const newStaffId = data.staff.id;

        // Add position if selected
        if (positionId) {
          await api.post(`/staff/${newStaffId}/positions`, {
            positionId,
            startDate: staffData.hireDate || new Date().toISOString().split('T')[0],
          });
        }

        // Add initial salary if provided
        if (initialSalary) {
          await api.post(`/staff/${newStaffId}/salaries`, {
            salaryAmount: parseFloat(parseCurrency(initialSalary)),
            salaryType,
            payFrequency,
            effectiveDate: staffData.hireDate || new Date().toISOString().split('T')[0],
          });
        }

        // Add payroll if any payroll field is provided
        const hasPayrollData = legalName || grade || jobNumber2 || totalPackage2526 || 
          maxQuarter || tuition || actualQuarter || annualGrossSalary || nachlas || 
          otherBenefit || parsonage || parsonageAllocation || travel || insurance || 
          ccName || ccAnnualAmount || retirement403b || paycheckAmount || monthlyParsonage || 
          travelStipend || ccDeduction || insuranceDeduction || annualAdjustment || 
          paychecksRemaining || perPaycheckAdjustment || adjustedCheckAmount || ptoDays || 
          academicYear || misc2 || misc3;
        
        if (hasPayrollData) {
          const payrollData: any = {};
          if (legalName) payrollData.legalName = legalName;
          if (grade) payrollData.grade = grade;
          if (jobNumber2) payrollData.jobNumber2 = jobNumber2;
          payrollData.freeDaycare = freeDaycare || false;
          if (misc2) payrollData.misc2 = misc2;
          if (misc3) payrollData.misc3 = misc3;
          if (totalPackage2526) payrollData.totalPackage2526 = parseFloat(parseCurrency(totalPackage2526)) || null;
          if (maxQuarter) payrollData.maxQuarter = parseFloat(parseCurrency(maxQuarter)) || null;
          if (tuition) payrollData.tuition = parseFloat(parseCurrency(tuition)) || null;
          if (actualQuarter) payrollData.actualQuarter = parseFloat(parseCurrency(actualQuarter)) || null;
          if (annualGrossSalary) payrollData.annualGrossSalary = parseFloat(parseCurrency(annualGrossSalary)) || null;
          if (nachlas) payrollData.nachlas = parseFloat(parseCurrency(nachlas)) || null;
          if (otherBenefit) payrollData.otherBenefit = parseFloat(parseCurrency(otherBenefit)) || null;
          if (parsonage) payrollData.parsonage = parseFloat(parseCurrency(parsonage)) || null;
          if (parsonageAllocation) payrollData.parsonageAllocation = parseFloat(parseCurrency(parsonageAllocation)) || null;
          if (travel) payrollData.travel = parseFloat(parseCurrency(travel)) || null;
          if (insurance) payrollData.insurance = parseFloat(parseCurrency(insurance)) || null;
          if (ccName) payrollData.ccName = ccName;
          if (ccAnnualAmount) payrollData.ccAnnualAmount = parseFloat(parseCurrency(ccAnnualAmount)) || null;
          if (retirement403b) payrollData.retirement403b = parseFloat(parseCurrency(retirement403b)) || null;
          if (paycheckAmount) payrollData.paycheckAmount = parseFloat(parseCurrency(paycheckAmount)) || null;
          if (monthlyParsonage) payrollData.monthlyParsonage = parseFloat(parseCurrency(monthlyParsonage)) || null;
          if (travelStipend) payrollData.travelStipend = parseFloat(parseCurrency(travelStipend)) || null;
          if (ccDeduction) payrollData.ccDeduction = parseFloat(parseCurrency(ccDeduction)) || null;
          if (insuranceDeduction) payrollData.insuranceDeduction = parseFloat(parseCurrency(insuranceDeduction)) || null;
          if (annualAdjustment) payrollData.annualAdjustment = parseFloat(parseCurrency(annualAdjustment)) || null;
          if (paychecksRemaining) payrollData.paychecksRemaining = parseFloat(paychecksRemaining) || null;
          if (perPaycheckAdjustment) payrollData.perPaycheckAdjustment = parseFloat(parseCurrency(perPaycheckAdjustment)) || null;
          if (adjustedCheckAmount) payrollData.adjustedCheckAmount = parseFloat(parseCurrency(adjustedCheckAmount)) || null;
          if (ptoDays) payrollData.ptoDays = parseFloat(ptoDays) || null;
          if (academicYear) payrollData.academicYear = academicYear;

          try {
            await api.post(`/payroll/staff/${newStaffId}`, payrollData);
          } catch (payrollErr: any) {
            console.error("Error creating payroll:", payrollErr);
            // Don't fail the whole operation if payroll creation fails
            showSnackbar("Staff created but payroll creation failed", "warning");
          }
        }

        showSnackbar("Staff member created successfully", "success");
      }

      setStaffDialog(false);
      hasLoadedRef.current = false;
      const { data } = await api.get("/staff");
      setStaff(data.staff || []);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to save staff member", "error");
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      await api.delete(`/staff/${selectedStaff.id}`);
      showSnackbar("Staff member deleted successfully", "success");
      setDeleteDialog(false);
      hasLoadedRef.current = false;
      const { data } = await api.get("/staff");
      setStaff(data.staff || []);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to delete staff member", "error");
    }
  };

  // Position management
  const handleOpenPositionDialog = (staffMember: Staff, position?: Position) => {
    setSelectedStaff(staffMember);
    if (position) {
      setPositionForm({
        positionId: position.positionId || "",
        positionName: position.positionName || "",
        gradeId: position.gradeId || "",
        startDate: position.startDate || "",
        endDate: position.endDate || "",
        notes: position.notes || "",
      });
    } else {
      setPositionForm({
        positionId: "",
        positionName: "",
        gradeId: "",
        startDate: "",
        endDate: "",
        notes: "",
      });
    }
    setPositionDialog(true);
  };

  const handleSavePosition = async () => {
    if (!selectedStaff) return;

    try {
      await api.post(`/staff/${selectedStaff.id}/positions`, {
        positionId: positionForm.positionId || null,
        positionName: positionForm.positionName || null,
        gradeId: positionForm.gradeId || null,
        startDate: positionForm.startDate || null,
        endDate: positionForm.endDate || null,
        notes: positionForm.notes || null,
      });

      showSnackbar("Position added successfully", "success");
      setPositionDialog(false);
      // Reload staff data
      hasLoadedRef.current = false;
      const { data } = await api.get(`/staff/${selectedStaff.id}`);
      const updatedStaff = staff.map((s) => (s.id === selectedStaff.id ? data.staff : s));
      setStaff(updatedStaff);
      setSelectedStaff(data.staff); // Update selected staff in detail dialog
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to save position", "error");
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    if (!selectedStaff) return;

    if (!window.confirm("Are you sure you want to remove this position from this staff member?")) {
      return;
    }

    try {
      await api.delete(`/staff/positions/${positionId}`);
      showSnackbar("Position removed successfully", "success");
      // Reload staff data
      hasLoadedRef.current = false;
      const { data } = await api.get(`/staff/${selectedStaff.id}`);
      const updatedStaff = staff.map((s) => (s.id === selectedStaff.id ? data.staff : s));
      setStaff(updatedStaff);
      setSelectedStaff(data.staff); // Update selected staff in detail dialog
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to remove position", "error");
    }
  };

  // Currency formatting helpers
  const formatCurrency = (value: string | number): string => {
    if (!value && value !== 0) return "";
    // Remove all non-digit characters except decimal point
    const numStr = String(value).replace(/[^\d.]/g, "");
    if (!numStr) return "";
    const num = parseFloat(numStr);
    if (isNaN(num)) return "";
    // Format with commas and 2 decimal places
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const parseCurrency = (value: string): string => {
    // Remove all non-digit characters except decimal point
    return value.replace(/[^\d.]/g, "");
  };

  // Salary management
  const handleOpenSalaryDialog = (staffMember: Staff, salary?: Salary) => {
    setSelectedStaff(staffMember);
    setSelectedSalary(salary || null);
    if (salary) {
      // Format dates for display (convert from YYYY-MM-DD to mm/dd/yy)
      const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${day}/${year}`;
      };
      
      setSalaryForm({
        salaryAmount: formatCurrency(salary.salaryAmount),
        salaryType: salary.salaryType,
        effectiveDate: formatDateForInput(salary.effectiveDate),
        endDate: salary.endDate ? formatDateForInput(salary.endDate) : "",
        payFrequency: salary.payFrequency,
        notes: salary.notes || "",
      });
    } else {
      setSalaryForm({
        salaryAmount: "",
        salaryType: "annual",
        effectiveDate: "",
        endDate: "",
        payFrequency: "monthly",
        notes: "",
      });
    }
    setSalaryDialog(true);
  };

  const handleSaveSalary = async () => {
    if (!selectedStaff) return;

    try {
      // Convert mm/dd/yy back to YYYY-MM-DD format
      const convertDateToISO = (dateStr: string) => {
        if (!dateStr) return null;
        // Handle both mm/dd/yy and YYYY-MM-DD formats
        if (dateStr.includes("/")) {
          const [month, day, year] = dateStr.split("/");
          const fullYear = year.length === 2 ? `20${year}` : year;
          return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
        return dateStr;
      };

      const salaryData = {
        salaryAmount: parseFloat(parseCurrency(salaryForm.salaryAmount)),
        salaryType: salaryForm.salaryType,
        effectiveDate: convertDateToISO(salaryForm.effectiveDate) || "",
        endDate: salaryForm.endDate ? convertDateToISO(salaryForm.endDate) : null,
        payFrequency: salaryForm.payFrequency,
        notes: salaryForm.notes || null,
      };

      if (selectedSalary) {
        // Update existing salary
        await api.put(`/staff/salaries/${selectedSalary.id}`, salaryData);
        showSnackbar("Salary updated successfully", "success");
      } else {
        // Create new salary
        await api.post(`/staff/${selectedStaff.id}/salaries`, salaryData);
        showSnackbar("Salary added successfully", "success");
      }
      
      setSalaryDialog(false);
      setSelectedSalary(null);
      // Reload staff data
      hasLoadedRef.current = false;
      const { data } = await api.get(`/staff/${selectedStaff.id}`);
      const updatedStaff = staff.map((s) => (s.id === selectedStaff.id ? data.staff : s));
      setStaff(updatedStaff);
      setSelectedStaff(data.staff); // Update selected staff in detail dialog
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to save salary", "error");
    }
  };

  // Benefit management
  const handleOpenBenefitDialog = (staffMember: Staff, benefit?: Benefit) => {
    setSelectedStaff(staffMember);
    if (benefit) {
      setBenefitForm({
        benefitType: benefit.benefitType,
        benefitName: benefit.benefitName || "",
        provider: benefit.provider || "",
        coverageAmount: benefit.coverageAmount?.toString() || "",
        employeeContribution: benefit.employeeContribution.toString(),
        employerContribution: benefit.employerContribution.toString(),
        effectiveDate: benefit.effectiveDate,
        endDate: benefit.endDate || "",
        notes: benefit.notes || "",
      });
    } else {
      setBenefitForm({
        benefitType: "",
        benefitName: "",
        provider: "",
        coverageAmount: "",
        employeeContribution: "",
        employerContribution: "",
        effectiveDate: "",
        endDate: "",
        notes: "",
      });
    }
    setBenefitDialog(true);
  };

  const handleSaveBenefit = async () => {
    if (!selectedStaff) return;

    try {
      await api.post(`/staff/${selectedStaff.id}/benefits`, {
        benefitType: benefitForm.benefitType,
        benefitName: benefitForm.benefitName || null,
        provider: benefitForm.provider || null,
        coverageAmount: benefitForm.coverageAmount ? parseFloat(benefitForm.coverageAmount) : null,
        employeeContribution: parseFloat(benefitForm.employeeContribution || "0"),
        employerContribution: parseFloat(benefitForm.employerContribution || "0"),
        effectiveDate: benefitForm.effectiveDate,
        endDate: benefitForm.endDate || null,
        notes: benefitForm.notes || null,
      });

      showSnackbar("Benefit added successfully", "success");
      setBenefitDialog(false);
      // Reload staff data
      hasLoadedRef.current = false;
      const { data } = await api.get(`/staff/${selectedStaff.id}`);
      const updatedStaff = staff.map((s) => (s.id === selectedStaff.id ? data.staff : s));
      setStaff(updatedStaff);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to save benefit", "error");
    }
  };

  // Document management
  const handleOpenDocumentDialog = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setDocumentForm({
      documentType: "",
      documentName: "",
      file: null,
      expirationDate: "",
      notes: "",
    });
    setDocumentDialog(true);
  };

  const handleSaveDocument = async () => {
    if (!selectedStaff || !documentForm.file) {
      showSnackbar("Please select a file", "error");
      return;
    }

    try {
      // Upload file first (you'll need to implement file upload endpoint)
      const formData = new FormData();
      formData.append("file", documentForm.file);
      formData.append("staffId", selectedStaff.id);
      formData.append("documentType", documentForm.documentType);
      formData.append("documentName", documentForm.documentName);
      if (documentForm.expirationDate) formData.append("expirationDate", documentForm.expirationDate);
      if (documentForm.notes) formData.append("notes", documentForm.notes);

      await api.post(`/staff/${selectedStaff.id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSnackbar("Document uploaded successfully", "success");
      setDocumentDialog(false);
      // Reload staff data
      hasLoadedRef.current = false;
      const { data } = await api.get(`/staff/${selectedStaff.id}`);
      const updatedStaff = staff.map((s) => (s.id === selectedStaff.id ? data.staff : s));
      setStaff(updatedStaff);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to upload document", "error");
    }
  };

  // Excel import
  const handleExcelImport = async () => {
    if (!excelFile) {
      showSnackbar("Please select an Excel file", "error");
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append("file", excelFile);

      const { data } = await api.post("/import/staff", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImportResult(data);
      showSnackbar(`Import completed: ${data.imported} imported, ${data.errors} errors`, "success");
      setImportDialog(false);
      setExcelFile(null);
      hasLoadedRef.current = false;
      const { data: staffData } = await api.get("/staff");
      setStaff(staffData.staff || []);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to import staff", "error");
    } finally {
      setImporting(false);
    }
  };

  // Staff menu
  const handleStaffMenuOpen = (event: React.MouseEvent<HTMLElement>, staffMember: Staff) => {
    setStaffMenuAnchor(event.currentTarget);
    setStaffMenuStaff(staffMember);
  };

  const handleStaffMenuClose = () => {
    setStaffMenuAnchor(null);
    setStaffMenuStaff(null);
  };

  const handleViewDetails = async (staffMember: Staff) => {
    try {
      const { data } = await api.get(`/staff/${staffMember.id}`);
      setSelectedStaff(data.staff);
      setDetailTab(0);
      setDetailDialog(true);
      handleStaffMenuClose();
    } catch (err: any) {
      showSnackbar("Failed to load staff details", "error");
    }
  };

  // Payroll management
  const handleOpenPayrollDialog = async (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    try {
      // Try to fetch existing payroll
      const { data } = await api.get(`/payroll/staff/${staffMember.id}`);
      if (data.payroll) {
        setPayrollForm({
          legalName: data.payroll.legalName || "",
          grade: data.payroll.grade || "",
          jobNumber2: data.payroll.jobNumber2 || "",
          freeDaycare: data.payroll.freeDaycare || false,
          misc2: data.payroll.misc2 || "",
          misc3: data.payroll.misc3 || "",
          totalPackage2526: data.payroll.totalPackage2526?.toString() || "",
          maxQuarter: data.payroll.maxQuarter?.toString() || "",
          tuition: data.payroll.tuition?.toString() || "",
          actualQuarter: data.payroll.actualQuarter?.toString() || "",
          annualGrossSalary: data.payroll.annualGrossSalary?.toString() || "",
          nachlas: data.payroll.nachlas?.toString() || "",
          otherBenefit: data.payroll.otherBenefit?.toString() || "",
          parsonage: data.payroll.parsonage?.toString() || "",
          parsonageAllocation: data.payroll.parsonageAllocation?.toString() || "",
          travel: data.payroll.travel?.toString() || "",
          insurance: data.payroll.insurance?.toString() || "",
          ccName: data.payroll.ccName || "",
          ccAnnualAmount: data.payroll.ccAnnualAmount?.toString() || "",
          retirement403b: data.payroll.retirement403b?.toString() || "",
          paycheckAmount: data.payroll.paycheckAmount?.toString() || "",
          monthlyParsonage: data.payroll.monthlyParsonage?.toString() || "",
          travelStipend: data.payroll.travelStipend?.toString() || "",
          ccDeduction: data.payroll.ccDeduction?.toString() || "",
          insuranceDeduction: data.payroll.insuranceDeduction?.toString() || "",
          annualAdjustment: data.payroll.annualAdjustment?.toString() || "",
          paychecksRemaining: data.payroll.paychecksRemaining?.toString() || "",
          perPaycheckAdjustment: data.payroll.perPaycheckAdjustment?.toString() || "",
          adjustedCheckAmount: data.payroll.adjustedCheckAmount?.toString() || "",
          ptoDays: data.payroll.ptoDays?.toString() || "",
          academicYear: data.payroll.academicYear || "",
        });
      } else {
        // Initialize empty form
        setPayrollForm({
          legalName: "",
          grade: "",
          jobNumber2: "",
          freeDaycare: false,
          misc2: "",
          misc3: "",
          totalPackage2526: "",
          maxQuarter: "",
          tuition: "",
          actualQuarter: "",
          annualGrossSalary: "",
          nachlas: "",
          otherBenefit: "",
          parsonage: "",
          parsonageAllocation: "",
          travel: "",
          insurance: "",
          ccName: "",
          ccAnnualAmount: "",
          retirement403b: "",
          paycheckAmount: "",
          monthlyParsonage: "",
          travelStipend: "",
          ccDeduction: "",
          insuranceDeduction: "",
          annualAdjustment: "",
          paychecksRemaining: "",
          perPaycheckAdjustment: "",
          adjustedCheckAmount: "",
          ptoDays: "",
          academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        });
      }
    } catch (err: any) {
      // If no payroll exists, initialize empty form
      if (err?.response?.status === 404) {
        setPayrollForm({
          legalName: "",
          grade: "",
          jobNumber2: "",
          freeDaycare: false,
          misc2: "",
          misc3: "",
          totalPackage2526: "",
          maxQuarter: "",
          tuition: "",
          actualQuarter: "",
          annualGrossSalary: "",
          nachlas: "",
          otherBenefit: "",
          parsonage: "",
          parsonageAllocation: "",
          travel: "",
          insurance: "",
          ccName: "",
          ccAnnualAmount: "",
          retirement403b: "",
          paycheckAmount: "",
          monthlyParsonage: "",
          travelStipend: "",
          ccDeduction: "",
          insuranceDeduction: "",
          annualAdjustment: "",
          paychecksRemaining: "",
          perPaycheckAdjustment: "",
          adjustedCheckAmount: "",
          ptoDays: "",
          academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        });
      } else {
        showSnackbar("Failed to load payroll data", "error");
        return;
      }
    }
    setPayrollDialog(true);
  };

  const handleSavePayroll = async () => {
    if (!selectedStaff) return;

    try {
      const payrollData = {
        legalName: payrollForm.legalName || null,
        grade: payrollForm.grade || null,
        jobNumber2: payrollForm.jobNumber2 || null,
        freeDaycare: payrollForm.freeDaycare,
        misc2: payrollForm.misc2 || null,
        misc3: payrollForm.misc3 || null,
        totalPackage2526: payrollForm.totalPackage2526 ? parseFloat(payrollForm.totalPackage2526) : null,
        maxQuarter: payrollForm.maxQuarter ? parseFloat(payrollForm.maxQuarter) : null,
        tuition: payrollForm.tuition ? parseFloat(payrollForm.tuition) : null,
        actualQuarter: payrollForm.actualQuarter ? parseFloat(payrollForm.actualQuarter) : null,
        annualGrossSalary: payrollForm.annualGrossSalary ? parseFloat(payrollForm.annualGrossSalary) : null,
        nachlas: payrollForm.nachlas ? parseFloat(payrollForm.nachlas) : null,
        otherBenefit: payrollForm.otherBenefit ? parseFloat(payrollForm.otherBenefit) : null,
        parsonage: payrollForm.parsonage ? parseFloat(payrollForm.parsonage) : null,
        parsonageAllocation: payrollForm.parsonageAllocation ? parseFloat(payrollForm.parsonageAllocation) : null,
        travel: payrollForm.travel ? parseFloat(payrollForm.travel) : null,
        insurance: payrollForm.insurance ? parseFloat(payrollForm.insurance) : null,
        ccName: payrollForm.ccName || null,
        ccAnnualAmount: payrollForm.ccAnnualAmount ? parseFloat(payrollForm.ccAnnualAmount) : null,
        retirement403b: payrollForm.retirement403b ? parseFloat(payrollForm.retirement403b) : null,
        paycheckAmount: payrollForm.paycheckAmount ? parseFloat(payrollForm.paycheckAmount) : null,
        monthlyParsonage: payrollForm.monthlyParsonage ? parseFloat(payrollForm.monthlyParsonage) : null,
        travelStipend: payrollForm.travelStipend ? parseFloat(payrollForm.travelStipend) : null,
        ccDeduction: payrollForm.ccDeduction ? parseFloat(payrollForm.ccDeduction) : null,
        insuranceDeduction: payrollForm.insuranceDeduction ? parseFloat(payrollForm.insuranceDeduction) : null,
        annualAdjustment: payrollForm.annualAdjustment ? parseFloat(payrollForm.annualAdjustment) : null,
        paychecksRemaining: payrollForm.paychecksRemaining ? parseInt(payrollForm.paychecksRemaining) : null,
        perPaycheckAdjustment: payrollForm.perPaycheckAdjustment ? parseFloat(payrollForm.perPaycheckAdjustment) : null,
        adjustedCheckAmount: payrollForm.adjustedCheckAmount ? parseFloat(payrollForm.adjustedCheckAmount) : null,
        ptoDays: payrollForm.ptoDays ? parseFloat(payrollForm.ptoDays) : null,
        academicYear: payrollForm.academicYear || null,
      };

      // Check if payroll exists
      try {
        const { data: existing } = await api.get(`/payroll/staff/${selectedStaff.id}`);
        if (existing.payroll) {
          // Update existing
          await api.put(`/payroll/${existing.payroll.id}`, payrollData);
          showSnackbar("Payroll updated successfully", "success");
        } else {
          throw new Error("Not found");
        }
      } catch (err: any) {
        if (err?.response?.status === 404 || err.message === "Not found") {
          // Create new
          await api.post(`/payroll/staff/${selectedStaff.id}`, payrollData);
          showSnackbar("Payroll created successfully", "success");
        } else {
          throw err;
        }
      }

      setPayrollDialog(false);
      // Reload staff data
      hasLoadedRef.current = false;
      const { data } = await api.get(`/staff/${selectedStaff.id}`);
      const updatedStaff = staff.map((s) => (s.id === selectedStaff.id ? data.staff : s));
      setStaff(updatedStaff);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to save payroll", "error");
    }
  };

  if (!canManage) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have permission to access this page.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<WorkIcon />}
              onClick={() => setPositionsManagementDialog(true)}
            >
              Manage Positions
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => setImportDialog(true)}
            >
              Import Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => handleOpenStaffDialog()}
            >
              Add Staff
            </Button>
          </Stack>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="terminated">Terminated</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Staff Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Positions</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStaff.map((staffMember) => (
                <TableRow key={staffMember.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {staffMember.firstName} {staffMember.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{staffMember.employeeId || "-"}</TableCell>
                  <TableCell>{staffMember.email || "-"}</TableCell>
                  <TableCell>{staffMember.phone || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.employmentStatus}
                      size="small"
                      color={
                        staffMember.employmentStatus === "active"
                          ? "success"
                          : staffMember.employmentStatus === "inactive"
                          ? "warning"
                          : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {staffMember.positions?.slice(0, 2).map((pos) => (
                        <Chip key={pos.id} label={pos.positionName} size="small" variant="outlined" />
                      ))}
                      {staffMember.positions && staffMember.positions.length > 2 && (
                        <Chip label={`+${staffMember.positions.length - 2}`} size="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleStaffMenuOpen(e, staffMember)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredStaff.length === 0 && (
          <Alert severity="info">No staff members found.</Alert>
        )}
      </Stack>

      {/* Staff Menu */}
      <Menu
        anchorEl={staffMenuAnchor}
        open={Boolean(staffMenuAnchor)}
        onClose={handleStaffMenuClose}
      >
        <MenuItem onClick={() => staffMenuStaff && handleViewDetails(staffMenuStaff)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => staffMenuStaff && handleOpenStaffDialog(staffMenuStaff)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => staffMenuStaff && handleOpenPositionDialog(staffMenuStaff)}>
          <ListItemIcon>
            <WorkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Position</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => staffMenuStaff && handleOpenSalaryDialog(staffMenuStaff)}>
          <ListItemIcon>
            <AttachMoneyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Salary</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => staffMenuStaff && handleOpenBenefitDialog(staffMenuStaff)}>
          <ListItemIcon>
            <HealthAndSafetyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Benefit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => staffMenuStaff && handleOpenDocumentDialog(staffMenuStaff)}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Upload Document</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (staffMenuStaff) {
              setSelectedStaff(staffMenuStaff);
              setDeleteDialog(true);
            }
            handleStaffMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Staff Dialog */}
      <Dialog open={staffDialog} onClose={() => setStaffDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonAddIcon color="primary" />
            <Typography variant="h6">
              {selectedStaff ? "Edit Staff Member" : "Add Staff Member"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={4} sx={{ mt: 1 }}>
            {/* Personal Information Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Personal Information
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    required
                    value={staffForm.firstName}
                    onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    required
                    value={staffForm.lastName}
                    onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Title (Mr., Mrs., etc.)"
                    value={staffForm.title}
                    onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })}
                    placeholder="e.g., Mr., Mrs., Dr."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={staffForm.employeeId}
                    onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                    placeholder="Enter employee ID"
                    helperText="Optional unique identifier"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Contact Information Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Contact Information
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="staff@example.com"
                    helperText="Optional email address"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    helperText="Optional phone number"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Employment Information Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Employment Information
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hire Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={staffForm.hireDate}
                    onChange={(e) => setStaffForm({ ...staffForm, hireDate: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date (optional)"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={staffForm.terminationDate}
                    onChange={(e) => setStaffForm({ ...staffForm, terminationDate: e.target.value })}
                    helperText="Leave blank if currently employed"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Status</InputLabel>
                    <Select
                      value={staffForm.employmentStatus}
                      label="Employment Status"
                      onChange={(e) => setStaffForm({ ...staffForm, employmentStatus: e.target.value })}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Position</InputLabel>
                    <Select
                      value={staffForm.positionId}
                      label="Position"
                      onChange={(e) => setStaffForm({ ...staffForm, positionId: e.target.value })}
                      disabled={!!selectedStaff}
                    >
                      <MenuItem value="">None</MenuItem>
                      {positions.filter(p => p.isActive).map((pos) => (
                        <MenuItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {selectedStaff ? "Positions can be managed in staff details" : "Select initial position (optional)"}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            {/* Initial Compensation Section (only for new staff) */}
            {!selectedStaff && (
              <>
                <Divider />
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <AttachMoneyIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Initial Compensation (Optional)
                    </Typography>
                  </Stack>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You can set an initial salary here, or add it later in the staff member's details.
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Initial Salary"
                        value={staffForm.initialSalary}
                        onChange={(e) => {
                          // Allow free typing - only remove invalid characters
                          let value = e.target.value.replace(/[^\d.]/g, "");
                          // Ensure only one decimal point
                          const parts = value.split(".");
                          if (parts.length > 2) {
                            value = parts[0] + "." + parts.slice(1).join("");
                          }
                          // Limit decimal places to 2
                          if (parts.length > 1 && parts[1].length > 2) {
                            value = parts[0] + "." + parts[1].slice(0, 2);
                          }
                          setStaffForm({ ...staffForm, initialSalary: value });
                        }}
                        onBlur={(e) => {
                          // Format with commas and 2 decimal places when user leaves field
                          const rawValue = parseCurrency(e.target.value);
                          if (rawValue) {
                            const formatted = formatCurrency(rawValue);
                            setStaffForm({ ...staffForm, initialSalary: formatted });
                          }
                        }}
                        placeholder="0.00"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Salary Type</InputLabel>
                        <Select
                          value={staffForm.salaryType}
                          label="Salary Type"
                          onChange={(e) => setStaffForm({ ...staffForm, salaryType: e.target.value })}
                        >
                          <MenuItem value="annual">Annual</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="per_diem">Per Diem</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Pay Frequency</InputLabel>
                        <Select
                          value={staffForm.payFrequency}
                          label="Pay Frequency"
                          onChange={(e) => setStaffForm({ ...staffForm, payFrequency: e.target.value })}
                        >
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="bi-weekly">Bi-Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="semi-monthly">Semi-Monthly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}

            {/* Payroll Information Section (only for new staff) */}
            {!selectedStaff && (
              <>
                <Divider />
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AttachMoneyIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={600} color="primary">
                        Payroll Information (Optional)
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      You can add payroll information here, or add it later in the staff member's details.
                    </Alert>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Legal Name"
                          value={staffForm.legalName}
                          onChange={(e) => setStaffForm({ ...staffForm, legalName: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Grade"
                          value={staffForm.grade}
                          onChange={(e) => setStaffForm({ ...staffForm, grade: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Academic Year"
                          value={staffForm.academicYear}
                          onChange={(e) => setStaffForm({ ...staffForm, academicYear: e.target.value })}
                          placeholder="e.g., 2025-2026"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Job #2"
                          value={staffForm.jobNumber2}
                          onChange={(e) => setStaffForm({ ...staffForm, jobNumber2: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={staffForm.freeDaycare}
                              onChange={(e) => setStaffForm({ ...staffForm, freeDaycare: e.target.checked })}
                            />
                          }
                          label="Free Daycare"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Annual Gross Salary"
                          value={staffForm.annualGrossSalary}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, annualGrossSalary: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, annualGrossSalary: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Total Package (25-26)"
                          value={staffForm.totalPackage2526}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, totalPackage2526: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, totalPackage2526: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Max Quarter"
                          value={staffForm.maxQuarter}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, maxQuarter: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, maxQuarter: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tuition"
                          value={staffForm.tuition}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, tuition: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, tuition: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Actual Quarter"
                          value={staffForm.actualQuarter}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, actualQuarter: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, actualQuarter: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nachlas"
                          value={staffForm.nachlas}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, nachlas: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, nachlas: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Other Benefit"
                          value={staffForm.otherBenefit}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, otherBenefit: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, otherBenefit: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Parsonage"
                          value={staffForm.parsonage}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, parsonage: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, parsonage: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Parsonage Allocation"
                          value={staffForm.parsonageAllocation}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, parsonageAllocation: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, parsonageAllocation: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Travel"
                          value={staffForm.travel}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, travel: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, travel: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Insurance"
                          value={staffForm.insurance}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, insurance: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, insurance: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="CC Name"
                          value={staffForm.ccName}
                          onChange={(e) => setStaffForm({ ...staffForm, ccName: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="CC Annual Amount"
                          value={staffForm.ccAnnualAmount}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, ccAnnualAmount: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, ccAnnualAmount: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Retirement 403b"
                          value={staffForm.retirement403b}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, retirement403b: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, retirement403b: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Paycheck Amount"
                          value={staffForm.paycheckAmount}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, paycheckAmount: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, paycheckAmount: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Monthly Parsonage"
                          value={staffForm.monthlyParsonage}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, monthlyParsonage: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, monthlyParsonage: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Travel Stipend"
                          value={staffForm.travelStipend}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, travelStipend: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, travelStipend: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="CC Deduction"
                          value={staffForm.ccDeduction}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, ccDeduction: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, ccDeduction: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Insurance Deduction"
                          value={staffForm.insuranceDeduction}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, insuranceDeduction: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, insuranceDeduction: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Annual Adjustment"
                          value={staffForm.annualAdjustment}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, annualAdjustment: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, annualAdjustment: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Paychecks Remaining"
                          type="number"
                          value={staffForm.paychecksRemaining}
                          onChange={(e) => setStaffForm({ ...staffForm, paychecksRemaining: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Per Paycheck Adjustment"
                          value={staffForm.perPaycheckAdjustment}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, perPaycheckAdjustment: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, perPaycheckAdjustment: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Adjusted Check Amount"
                          value={staffForm.adjustedCheckAmount}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^\d.]/g, "");
                            const parts = value.split(".");
                            if (parts.length > 2) {
                              value = parts[0] + "." + parts.slice(1).join("");
                            }
                            if (parts.length > 1 && parts[1].length > 2) {
                              value = parts[0] + "." + parts[1].slice(0, 2);
                            }
                            setStaffForm({ ...staffForm, adjustedCheckAmount: value });
                          }}
                          onBlur={(e) => {
                            const rawValue = parseCurrency(e.target.value);
                            if (rawValue) {
                              const formatted = formatCurrency(rawValue);
                              setStaffForm({ ...staffForm, adjustedCheckAmount: formatted });
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="PTO Days"
                          type="number"
                          value={staffForm.ptoDays}
                          onChange={(e) => setStaffForm({ ...staffForm, ptoDays: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Misc 2"
                          value={staffForm.misc2}
                          onChange={(e) => setStaffForm({ ...staffForm, misc2: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Misc 3"
                          value={staffForm.misc3}
                          onChange={(e) => setStaffForm({ ...staffForm, misc3: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </>
            )}

            <Divider />

            {/* Additional Information Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Additional Information
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={staffForm.bio}
                    onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
                    placeholder="Enter a brief biography or background information"
                    helperText="Optional biographical information"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={staffForm.notes}
                    onChange={(e) => setStaffForm({ ...staffForm, notes: e.target.value })}
                    placeholder="Enter any additional notes or comments"
                    helperText="Internal notes (not visible to staff member)"
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStaffDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveStaff}
            disabled={!staffForm.firstName || !staffForm.lastName}
            startIcon={selectedStaff ? <EditIcon /> : <PersonAddIcon />}
          >
            {selectedStaff ? "Update Staff Member" : "Create Staff Member"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Position Dialog */}
      <Dialog open={positionDialog} onClose={() => setPositionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Position</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={positionForm.positionId}
                label="Position"
                onChange={(e) => {
                  const selectedPos = positions.find(p => p.id === e.target.value);
                  setPositionForm({ 
                    ...positionForm, 
                    positionId: e.target.value,
                    positionName: selectedPos?.name || ""
                  });
                }}
              >
                <MenuItem value="">Select Position</MenuItem>
                {positions.filter(p => p.isActive).map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Custom Position Name (if not using system position)"
              placeholder="e.g., 3rd Grade Math Teacher"
              value={positionForm.positionName}
              onChange={(e) => setPositionForm({ ...positionForm, positionName: e.target.value })}
              disabled={!!positionForm.positionId}
            />
            <Autocomplete
              options={grades}
              getOptionLabel={(option) => option.name}
              value={grades.find((g) => g.id === positionForm.gradeId) || null}
              onChange={(_, value) => setPositionForm({ ...positionForm, gradeId: value?.id || "" })}
              renderInput={(params) => (
                <TextField {...params} label="Grade (optional)" placeholder="Select grade if position is grade-specific" />
              )}
            />
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={positionForm.startDate}
              onChange={(e) => setPositionForm({ ...positionForm, startDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="End Date (optional)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={positionForm.endDate}
              onChange={(e) => setPositionForm({ ...positionForm, endDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={positionForm.notes}
              onChange={(e) => setPositionForm({ ...positionForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPositionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePosition}
            disabled={!positionForm.positionId && !positionForm.positionName}
          >
            Add Position
          </Button>
        </DialogActions>
      </Dialog>

      {/* Salary Dialog */}
      <Dialog open={salaryDialog} onClose={() => {
        setSalaryDialog(false);
        setSelectedSalary(null);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedSalary ? "Edit Salary" : "Add Salary"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Salary Amount"
              required
              value={salaryForm.salaryAmount}
              onChange={(e) => {
                // Allow free typing - only remove invalid characters
                let value = e.target.value.replace(/[^\d.]/g, "");
                // Ensure only one decimal point
                const parts = value.split(".");
                if (parts.length > 2) {
                  value = parts[0] + "." + parts.slice(1).join("");
                }
                // Limit decimal places to 2
                if (parts.length > 1 && parts[1].length > 2) {
                  value = parts[0] + "." + parts[1].slice(0, 2);
                }
                setSalaryForm({ ...salaryForm, salaryAmount: value });
              }}
              onBlur={(e) => {
                // Format with commas and 2 decimal places when user leaves field
                const rawValue = parseCurrency(e.target.value);
                if (rawValue) {
                  const formatted = formatCurrency(rawValue);
                  setSalaryForm({ ...salaryForm, salaryAmount: formatted });
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              placeholder="0.00"
            />
            <FormControl fullWidth>
              <InputLabel>Salary Type</InputLabel>
              <Select
                value={salaryForm.salaryType}
                label="Salary Type"
                onChange={(e) => setSalaryForm({ ...salaryForm, salaryType: e.target.value })}
              >
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="per_diem">Per Diem</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Pay Frequency</InputLabel>
              <Select
                value={salaryForm.payFrequency}
                label="Pay Frequency"
                onChange={(e) => setSalaryForm({ ...salaryForm, payFrequency: e.target.value })}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="bi-weekly">Bi-Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="semi-monthly">Semi-Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Effective Date (mm/dd/yy)"
              required
              placeholder="mm/dd/yy"
              value={salaryForm.effectiveDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2);
                if (value.length >= 5) value = value.slice(0, 5) + "/" + value.slice(5, 7);
                setSalaryForm({ ...salaryForm, effectiveDate: value });
              }}
            />
            <TextField
              fullWidth
              label="End Date (optional) (mm/dd/yy)"
              placeholder="mm/dd/yy"
              value={salaryForm.endDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2);
                if (value.length >= 5) value = value.slice(0, 5) + "/" + value.slice(5, 7);
                setSalaryForm({ ...salaryForm, endDate: value });
              }}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={salaryForm.notes}
              onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSalaryDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSalary}
            disabled={!salaryForm.salaryAmount || !salaryForm.effectiveDate}
          >
            {selectedSalary ? "Update Salary" : "Add Salary"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Benefit Dialog */}
      <Dialog open={benefitDialog} onClose={() => setBenefitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Benefit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Benefit Type</InputLabel>
              <Select
                value={benefitForm.benefitType}
                label="Benefit Type"
                onChange={(e) => setBenefitForm({ ...benefitForm, benefitType: e.target.value })}
              >
                <MenuItem value="health_insurance">Health Insurance</MenuItem>
                <MenuItem value="dental">Dental</MenuItem>
                <MenuItem value="vision">Vision</MenuItem>
                <MenuItem value="retirement">Retirement</MenuItem>
                <MenuItem value="life_insurance">Life Insurance</MenuItem>
                <MenuItem value="disability">Disability</MenuItem>
                <MenuItem value="tuition_reimbursement">Tuition Reimbursement</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Benefit Name / Plan"
              value={benefitForm.benefitName}
              onChange={(e) => setBenefitForm({ ...benefitForm, benefitName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Provider"
              value={benefitForm.provider}
              onChange={(e) => setBenefitForm({ ...benefitForm, provider: e.target.value })}
            />
            <TextField
              fullWidth
              label="Coverage Amount (optional)"
              type="number"
              value={benefitForm.coverageAmount}
              onChange={(e) => setBenefitForm({ ...benefitForm, coverageAmount: e.target.value })}
            />
            <TextField
              fullWidth
              label="Employee Contribution"
              type="number"
              value={benefitForm.employeeContribution}
              onChange={(e) => setBenefitForm({ ...benefitForm, employeeContribution: e.target.value })}
            />
            <TextField
              fullWidth
              label="Employer Contribution"
              type="number"
              value={benefitForm.employerContribution}
              onChange={(e) => setBenefitForm({ ...benefitForm, employerContribution: e.target.value })}
            />
            <TextField
              fullWidth
              label="Effective Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={benefitForm.effectiveDate}
              onChange={(e) => setBenefitForm({ ...benefitForm, effectiveDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="End Date (optional)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={benefitForm.endDate}
              onChange={(e) => setBenefitForm({ ...benefitForm, endDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={benefitForm.notes}
              onChange={(e) => setBenefitForm({ ...benefitForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBenefitDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveBenefit}
            disabled={!benefitForm.benefitType || !benefitForm.effectiveDate}
          >
            Add Benefit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Dialog */}
      <Dialog open={documentDialog} onClose={() => setDocumentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentForm.documentType}
                label="Document Type"
                onChange={(e) => setDocumentForm({ ...documentForm, documentType: e.target.value })}
              >
                <MenuItem value="resume">Resume</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="certification">Certification</MenuItem>
                <MenuItem value="license">License</MenuItem>
                <MenuItem value="background_check">Background Check</MenuItem>
                <MenuItem value="performance_review">Performance Review</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Document Name"
              required
              value={documentForm.documentName}
              onChange={(e) => setDocumentForm({ ...documentForm, documentName: e.target.value })}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              {documentForm.file ? documentForm.file.name : "Select File"}
              <input
                type="file"
                hidden
                onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })}
              />
            </Button>
            <TextField
              fullWidth
              label="Expiration Date (optional)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={documentForm.expirationDate}
              onChange={(e) => setDocumentForm({ ...documentForm, expirationDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={documentForm.notes}
              onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveDocument}
            disabled={!documentForm.documentType || !documentForm.documentName || !documentForm.file}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Excel Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Staff from Excel</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Upload an Excel file with staff information. The system will auto-detect columns.
            </Alert>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              {excelFile ? excelFile.name : "Select Excel File"}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              />
            </Button>
            {importResult && (
              <Alert severity={importResult.errors > 0 ? "warning" : "success"}>
                Imported: {importResult.imported}, Errors: {importResult.errors}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleExcelImport}
            disabled={!excelFile || importing}
            startIcon={importing ? <CircularProgress size={20} /> : <UploadFileIcon />}
          >
            {importing ? "Importing..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedStaff?.firstName} {selectedStaff?.lastName}
            </Typography>
            <IconButton onClick={() => setDetailDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ height: { xs: "70vh", sm: "75vh", md: "80vh" }, overflowY: "auto" }}>
          {selectedStaff && (
            <Box sx={{ mt: 2 }}>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}>
                <Tab label="Overview" />
                <Tab label="Positions" />
                <Tab label="Salaries" />
                <Tab label="Benefits" />
                <Tab label="Documents" />
                <Tab label="Payroll" />
              </Tabs>

              <Box sx={{ mt: 3, minHeight: { xs: "50vh", sm: "55vh", md: "60vh" } }}>
                {detailTab === 0 && (
                  <Stack spacing={3}>
                    {/* Quick Stats Cards */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <WorkIcon color="primary" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Positions
                              </Typography>
                              <Typography variant="h6">
                                {selectedStaff.positions?.length || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AttachMoneyIcon color="primary" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Salary Records
                              </Typography>
                              <Typography variant="h6">
                                {selectedStaff.salaries?.length || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <HealthAndSafetyIcon color="primary" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Benefits
                              </Typography>
                              <Typography variant="h6">
                                {selectedStaff.benefits?.length || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <DescriptionIcon color="primary" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Documents
                              </Typography>
                              <Typography variant="h6">
                                {selectedStaff.documents?.length || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Personal Information Section */}
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <PersonAddIcon color="primary" />
                          <Typography variant="h6">Personal Information</Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Full Name
                              </Typography>
                              <Typography variant="body1">
                                {selectedStaff.title ? `${selectedStaff.title} ` : ""}
                                {selectedStaff.firstName} {selectedStaff.lastName}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Employee ID
                              </Typography>
                              <Typography variant="body1">{selectedStaff.employeeId || "-"}</Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Email
                              </Typography>
                              <Typography variant="body1">
                                {selectedStaff.email ? (
                                  <a href={`mailto:${selectedStaff.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                                    {selectedStaff.email}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Phone
                              </Typography>
                              <Typography variant="body1">
                                {selectedStaff.phone ? (
                                  <a href={`tel:${selectedStaff.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                                    {selectedStaff.phone}
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </Typography>
                            </Stack>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Employment Information Section */}
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                          <WorkIcon color="primary" />
                          <Typography variant="h6">Employment Information</Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Employment Status
                              </Typography>
                              <Chip
                                label={selectedStaff.employmentStatus || "Unknown"}
                                size="small"
                                color={
                                  selectedStaff.employmentStatus === "active"
                                    ? "success"
                                    : selectedStaff.employmentStatus === "inactive"
                                    ? "warning"
                                    : "error"
                                }
                                sx={{ width: "fit-content" }}
                              />
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Stack spacing={0.5}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Hire Date
                              </Typography>
                              <Typography variant="body1">
                                {selectedStaff.hireDate
                                  ? new Date(selectedStaff.hireDate).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </Typography>
                            </Stack>
                          </Grid>
                          {selectedStaff.terminationDate && (
                            <Grid item xs={12} sm={6}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  Termination Date
                                </Typography>
                                <Typography variant="body1">
                                  {new Date(selectedStaff.terminationDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </Typography>
                              </Stack>
                            </Grid>
                          )}
                          {selectedStaff.positions && selectedStaff.positions.length > 0 && (
                            <Grid item xs={12}>
                              <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  Current Positions
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {selectedStaff.positions
                                    .filter((p) => p.isActive)
                                    .map((pos) => (
                                      <Chip
                                        key={pos.id}
                                        label={pos.positionName}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                                    ))}
                                  {selectedStaff.positions.filter((p) => p.isActive).length === 0 && (
                                    <Typography variant="body2" color="text.secondary">
                                      No active positions
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Current Salary Summary */}
                    {selectedStaff.salaries && selectedStaff.salaries.length > 0 && (
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <AttachMoneyIcon color="primary" />
                            <Typography variant="h6">Current Salary</Typography>
                          </Stack>
                          <Divider sx={{ mb: 2 }} />
                          {(() => {
                            const currentSalary = selectedStaff.salaries.find(
                              (s) => !s.endDate || new Date(s.endDate) >= new Date()
                            ) || selectedStaff.salaries[0];
                            return currentSalary ? (
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                      Amount
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                      ${currentSalary.salaryAmount.toLocaleString()}
                                    </Typography>
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                      Type
                                    </Typography>
                                    <Typography variant="body1" textTransform="capitalize">
                                      {currentSalary.salaryType}
                                    </Typography>
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                      Frequency
                                    </Typography>
                                    <Typography variant="body1" textTransform="capitalize">
                                      {currentSalary.payFrequency}
                                    </Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                            ) : null;
                          })()}
                        </CardContent>
                      </Card>
                    )}

                    {/* Bio Section */}
                    {selectedStaff.bio && (
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <DescriptionIcon color="primary" />
                            <Typography variant="h6">Biography</Typography>
                          </Stack>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {selectedStaff.bio}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}

                    {/* Notes Section */}
                    {selectedStaff.notes && (
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <DescriptionIcon color="primary" />
                            <Typography variant="h6">Notes</Typography>
                          </Stack>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {selectedStaff.notes}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Quick Actions
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => {
                              handleOpenStaffDialog(selectedStaff);
                            }}
                          >
                            Edit Staff
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<WorkIcon />}
                            onClick={() => {
                              handleOpenPositionDialog(selectedStaff);
                            }}
                          >
                            Add Position
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AttachMoneyIcon />}
                            onClick={() => {
                              handleOpenSalaryDialog(selectedStaff);
                            }}
                          >
                            Add Salary
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<HealthAndSafetyIcon />}
                            onClick={() => {
                              handleOpenBenefitDialog(selectedStaff);
                            }}
                          >
                            Add Benefit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DescriptionIcon />}
                            onClick={() => {
                              handleOpenDocumentDialog(selectedStaff);
                            }}
                          >
                            Upload Document
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                )}

                {detailTab === 1 && (
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Positions</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          handleOpenPositionDialog(selectedStaff);
                        }}
                      >
                        Add Position
                      </Button>
                    </Stack>
                    {selectedStaff.positions && selectedStaff.positions.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Position</TableCell>
                              <TableCell>Grade</TableCell>
                              <TableCell>Start Date</TableCell>
                              <TableCell>End Date</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStaff.positions.map((pos) => {
                              // Format date as mm/dd/yy
                              const formatDate = (dateStr: string | null | undefined) => {
                                if (!dateStr) return "-";
                                try {
                                  const date = new Date(dateStr);
                                  if (isNaN(date.getTime())) return dateStr;
                                  const month = String(date.getMonth() + 1).padStart(2, "0");
                                  const day = String(date.getDate()).padStart(2, "0");
                                  const year = String(date.getFullYear()).slice(-2);
                                  return `${month}/${day}/${year}`;
                                } catch {
                                  return dateStr;
                                }
                              };
                              
                              return (
                                <TableRow key={pos.id}>
                                  <TableCell>{pos.positionName}</TableCell>
                                  <TableCell>{pos.gradeName || "-"}</TableCell>
                                  <TableCell>{formatDate(pos.startDate)}</TableCell>
                                  <TableCell>{formatDate(pos.endDate)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={pos.isActive ? "Active" : "Inactive"}
                                      size="small"
                                      color={pos.isActive ? "success" : "default"}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Tooltip title="Remove Position">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeletePosition(pos.id)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">No positions assigned.</Alert>
                    )}
                  </Stack>
                )}

                {detailTab === 2 && (
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Salaries</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          handleOpenSalaryDialog(selectedStaff);
                        }}
                      >
                        Add Salary
                      </Button>
                    </Stack>
                    {selectedStaff.salaries && selectedStaff.salaries.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Amount</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Frequency</TableCell>
                              <TableCell>Effective Date</TableCell>
                              <TableCell>End Date</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStaff.salaries.map((sal) => {
                              // Format date as mm/dd/yy
                              const formatDate = (dateStr: string | null | undefined) => {
                                if (!dateStr) return "Current";
                                try {
                                  const date = new Date(dateStr);
                                  if (isNaN(date.getTime())) return dateStr;
                                  const month = String(date.getMonth() + 1).padStart(2, "0");
                                  const day = String(date.getDate()).padStart(2, "0");
                                  const year = String(date.getFullYear()).slice(-2);
                                  return `${month}/${day}/${year}`;
                                } catch {
                                  return dateStr;
                                }
                              };
                              
                              return (
                                <TableRow key={sal.id}>
                                  <TableCell>${sal.salaryAmount.toLocaleString()}</TableCell>
                                  <TableCell>{sal.salaryType}</TableCell>
                                  <TableCell>{sal.payFrequency}</TableCell>
                                  <TableCell>{formatDate(sal.effectiveDate)}</TableCell>
                                  <TableCell>{formatDate(sal.endDate)}</TableCell>
                                  <TableCell align="right">
                                    <Tooltip title="Edit">
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          handleOpenSalaryDialog(selectedStaff, sal);
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">No salary records.</Alert>
                    )}
                  </Stack>
                )}

                {detailTab === 3 && (
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Benefits</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setDetailDialog(false);
                          handleOpenBenefitDialog(selectedStaff);
                        }}
                      >
                        Add Benefit
                      </Button>
                    </Stack>
                    {selectedStaff.benefits && selectedStaff.benefits.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Type</TableCell>
                              <TableCell>Name/Plan</TableCell>
                              <TableCell>Provider</TableCell>
                              <TableCell>Employee Contribution</TableCell>
                              <TableCell>Employer Contribution</TableCell>
                              <TableCell>Effective Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStaff.benefits.map((ben) => (
                              <TableRow key={ben.id}>
                                <TableCell>{ben.benefitType}</TableCell>
                                <TableCell>{ben.benefitName || "-"}</TableCell>
                                <TableCell>{ben.provider || "-"}</TableCell>
                                <TableCell>${ben.employeeContribution.toLocaleString()}</TableCell>
                                <TableCell>${ben.employerContribution.toLocaleString()}</TableCell>
                                <TableCell>{ben.effectiveDate}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">No benefits assigned.</Alert>
                    )}
                  </Stack>
                )}

                {detailTab === 4 && (
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Documents</Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setDetailDialog(false);
                          handleOpenDocumentDialog(selectedStaff);
                        }}
                      >
                        Upload Document
                      </Button>
                    </Stack>
                    {selectedStaff.documents && selectedStaff.documents.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Type</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Upload Date</TableCell>
                              <TableCell>Expiration</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStaff.documents.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell>{doc.documentType}</TableCell>
                                <TableCell>{doc.documentName}</TableCell>
                                <TableCell>{doc.uploadDate}</TableCell>
                                <TableCell>
                                  {doc.expirationDate ? (
                                    <Chip
                                      label={doc.expirationDate}
                                      size="small"
                                      color={new Date(doc.expirationDate) < new Date() ? "error" : "default"}
                                    />
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Download">
                                    <IconButton
                                      size="small"
                                      onClick={async () => {
                                        try {
                                          // Generate signed URL for download
                                          const { data } = await api.get(`/staff/documents/${doc.id}/download`);
                                          window.open(data.signedUrl, "_blank");
                                        } catch (err: any) {
                                          showSnackbar("Failed to generate download link", "error");
                                        }
                                      }}
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">No documents uploaded.</Alert>
                    )}
                  </Stack>
                )}

                {detailTab === 5 && (
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Payroll Information</Typography>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          handleOpenPayrollDialog(selectedStaff);
                        }}
                      >
                        {selectedStaff.payroll ? "Edit Payroll" : "Add Payroll"}
                      </Button>
                    </Stack>
                    {selectedStaff.payroll ? (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Legal Name</Typography>
                          <Typography>{selectedStaff.payroll.legalName || "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Grade</Typography>
                          <Typography>{selectedStaff.payroll.grade || "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Academic Year</Typography>
                          <Typography>{selectedStaff.payroll.academicYear || "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Annual Gross Salary</Typography>
                          <Typography>
                            {selectedStaff.payroll.annualGrossSalary
                              ? `$${selectedStaff.payroll.annualGrossSalary.toLocaleString()}`
                              : "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Total Package (25-26)</Typography>
                          <Typography>
                            {selectedStaff.payroll.totalPackage2526
                              ? `$${selectedStaff.payroll.totalPackage2526.toLocaleString()}`
                              : "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Paycheck Amount</Typography>
                          <Typography>
                            {selectedStaff.payroll.paycheckAmount
                              ? `$${selectedStaff.payroll.paycheckAmount.toLocaleString()}`
                              : "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">PTO Days</Typography>
                          <Typography>{selectedStaff.payroll.ptoDays || "-"}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">Free Daycare</Typography>
                          <Chip
                            label={selectedStaff.payroll.freeDaycare ? "Yes" : "No"}
                            size="small"
                            color={selectedStaff.payroll.freeDaycare ? "success" : "default"}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert severity="info">No payroll information available. Click "Add Payroll" to create a payroll record.</Alert>
                    )}
                  </Stack>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Positions Management Dialog */}
      <Dialog open={positionsManagementDialog} onClose={() => setPositionsManagementDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Manage Positions</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedPosition(null);
                setSystemPositionForm({
                  name: "",
                  description: "",
                  category: "",
                  isActive: true,
                });
                setPositionEditDialog(true);
              }}
            >
              Add Position
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No positions found. Click "Add Position" to create one.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((pos) => (
                    <TableRow key={pos.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {pos.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {pos.description || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {pos.category ? (
                          <Chip label={pos.category} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pos.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={pos.isActive ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedPosition(pos);
                                setSystemPositionForm({
                                  name: pos.name || "",
                                  description: pos.description || "",
                                  category: pos.category || "",
                                  isActive: pos.isActive !== false,
                                });
                                setPositionEditDialog(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setPositionToDelete(pos);
                                setDeleteConfirmText("");
                                setPositionDeleteDialog(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPositionsManagementDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Position Add/Edit Dialog */}
      <Dialog open={positionEditDialog} onClose={() => setPositionEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPosition ? "Edit Position" : "Add New Position"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Position Name"
              required
              value={systemPositionForm.name}
              onChange={(e) => setSystemPositionForm({ ...systemPositionForm, name: e.target.value })}
              placeholder="e.g., Teacher, Principal, Curriculum Director"
              helperText="This will be used across the system for all staff members"
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={systemPositionForm.description}
              onChange={(e) => setSystemPositionForm({ ...systemPositionForm, description: e.target.value })}
              placeholder="Optional description of this position"
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={systemPositionForm.category}
                label="Category"
                onChange={(e) => setSystemPositionForm({ ...systemPositionForm, category: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="Business Office">Business Office</MenuItem>
                <MenuItem value="Administration">Administration</MenuItem>
                <MenuItem value="Janitorial">Janitorial</MenuItem>
                <MenuItem value="Specialist">Specialist</MenuItem>
                <MenuItem value="Support">Support</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={systemPositionForm.isActive ? "active" : "inactive"}
                label="Status"
                onChange={(e) => setSystemPositionForm({ ...systemPositionForm, isActive: e.target.value === "active" })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPositionEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!systemPositionForm.name.trim()) {
                showSnackbar("Position name is required", "error");
                return;
              }

              try {
                if (selectedPosition) {
                  await api.put(`/positions/${selectedPosition.id}`, {
                    name: systemPositionForm.name,
                    description: systemPositionForm.description || null,
                    category: systemPositionForm.category || null,
                    isActive: systemPositionForm.isActive,
                  });
                  showSnackbar("Position updated successfully", "success");
                } else {
                  await api.post("/positions", {
                    name: systemPositionForm.name,
                    description: systemPositionForm.description || null,
                    category: systemPositionForm.category || null,
                    isActive: systemPositionForm.isActive,
                  });
                  showSnackbar("Position created successfully", "success");
                }
                setPositionEditDialog(false);
                hasLoadedRef.current = false;
                const { data } = await api.get("/positions");
                setPositions(data.positions || []);
              } catch (err: any) {
                showSnackbar(err?.response?.data?.message || "Failed to save position", "error");
              }
            }}
            disabled={!systemPositionForm.name.trim()}
          >
            {selectedPosition ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Position Confirmation */}
      <Dialog open={positionDeleteDialog} onClose={() => {
        setPositionDeleteDialog(false);
        setPositionToDelete(null);
        setDeleteConfirmText("");
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon color="error" />
            <Typography variant="h6">Delete Position</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="warning" icon={<DeleteIcon />}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Warning: This action cannot be undone.
              </Typography>
              <Typography variant="body2">
                Any staff members currently assigned to this position will have the position removed from their profile.
              </Typography>
            </Alert>
            <Typography variant="body1">
              To confirm deletion, please type the position name: <strong>{positionToDelete?.name}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Position Name"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={`Type "${positionToDelete?.name}" to confirm`}
              error={deleteConfirmText !== "" && deleteConfirmText !== positionToDelete?.name}
              helperText={
                deleteConfirmText !== "" && deleteConfirmText !== positionToDelete?.name
                  ? "Position name does not match"
                  : ""
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setPositionDeleteDialog(false);
            setPositionToDelete(null);
            setDeleteConfirmText("");
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteConfirmText !== positionToDelete?.name}
            onClick={async () => {
              if (!positionToDelete) return;
              
              try {
                await api.delete(`/positions/${positionToDelete.id}`);
                showSnackbar("Position deleted successfully", "success");
                setPositionDeleteDialog(false);
                setPositionToDelete(null);
                setDeleteConfirmText("");
                hasLoadedRef.current = false;
                const { data } = await api.get("/positions");
                setPositions(data.positions || []);
              } catch (err: any) {
                showSnackbar(err?.response?.data?.message || "Failed to delete position", "error");
              }
            }}
            startIcon={<DeleteIcon />}
          >
            Delete Position
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payroll Dialog */}
      <Dialog open={payrollDialog} onClose={() => setPayrollDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <AttachMoneyIcon color="primary" />
            <Typography variant="h6">Payroll Information</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={4} sx={{ mt: 1, maxHeight: "70vh", overflowY: "auto" }}>
            {/* Basic Information Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Basic Information
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Legal Name"
                    value={payrollForm.legalName}
                    onChange={(e) => setPayrollForm({ ...payrollForm, legalName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Grade"
                    value={payrollForm.grade}
                    onChange={(e) => setPayrollForm({ ...payrollForm, grade: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={payrollForm.academicYear}
                    onChange={(e) => setPayrollForm({ ...payrollForm, academicYear: e.target.value })}
                    placeholder="e.g., 2025-2026"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job #2"
                    value={payrollForm.jobNumber2}
                    onChange={(e) => setPayrollForm({ ...payrollForm, jobNumber2: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Free Daycare</InputLabel>
                    <Select
                      value={payrollForm.freeDaycare ? "yes" : "no"}
                      label="Free Daycare"
                      onChange={(e) => setPayrollForm({ ...payrollForm, freeDaycare: e.target.value === "yes" })}
                    >
                      <MenuItem value="no">No</MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Misc 2"
                    value={payrollForm.misc2}
                    onChange={(e) => setPayrollForm({ ...payrollForm, misc2: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Misc 3"
                    value={payrollForm.misc3}
                    onChange={(e) => setPayrollForm({ ...payrollForm, misc3: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Package/Salary Information Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Package & Salary Information
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Package (25-26)"
                    type="number"
                    value={payrollForm.totalPackage2526}
                    onChange={(e) => setPayrollForm({ ...payrollForm, totalPackage2526: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Quarter"
                    type="number"
                    value={payrollForm.maxQuarter}
                    onChange={(e) => setPayrollForm({ ...payrollForm, maxQuarter: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tuition"
                    type="number"
                    value={payrollForm.tuition}
                    onChange={(e) => setPayrollForm({ ...payrollForm, tuition: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Actual Quarter"
                    type="number"
                    value={payrollForm.actualQuarter}
                    onChange={(e) => setPayrollForm({ ...payrollForm, actualQuarter: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Gross Salary"
                    type="number"
                    value={payrollForm.annualGrossSalary}
                    onChange={(e) => setPayrollForm({ ...payrollForm, annualGrossSalary: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Benefits Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Benefits
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nachlas"
                    type="number"
                    value={payrollForm.nachlas}
                    onChange={(e) => setPayrollForm({ ...payrollForm, nachlas: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Other Benefit"
                    type="number"
                    value={payrollForm.otherBenefit}
                    onChange={(e) => setPayrollForm({ ...payrollForm, otherBenefit: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parsonage"
                    type="number"
                    value={payrollForm.parsonage}
                    onChange={(e) => setPayrollForm({ ...payrollForm, parsonage: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parsonage Allocation"
                    type="number"
                    value={payrollForm.parsonageAllocation}
                    onChange={(e) => setPayrollForm({ ...payrollForm, parsonageAllocation: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Travel"
                    type="number"
                    value={payrollForm.travel}
                    onChange={(e) => setPayrollForm({ ...payrollForm, travel: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance"
                    type="number"
                    value={payrollForm.insurance}
                    onChange={(e) => setPayrollForm({ ...payrollForm, insurance: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CC Name"
                    value={payrollForm.ccName}
                    onChange={(e) => setPayrollForm({ ...payrollForm, ccName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CC Annual Amount"
                    type="number"
                    value={payrollForm.ccAnnualAmount}
                    onChange={(e) => setPayrollForm({ ...payrollForm, ccAnnualAmount: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="403B+F:V (Retirement)"
                    type="number"
                    value={payrollForm.retirement403b}
                    onChange={(e) => setPayrollForm({ ...payrollForm, retirement403b: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Paycheck Details Section */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Paycheck Details
                </Typography>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Paycheck Amount"
                    type="number"
                    value={payrollForm.paycheckAmount}
                    onChange={(e) => setPayrollForm({ ...payrollForm, paycheckAmount: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Parsonage"
                    type="number"
                    value={payrollForm.monthlyParsonage}
                    onChange={(e) => setPayrollForm({ ...payrollForm, monthlyParsonage: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Travel Stipend"
                    type="number"
                    value={payrollForm.travelStipend}
                    onChange={(e) => setPayrollForm({ ...payrollForm, travelStipend: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CC Deduction"
                    type="number"
                    value={payrollForm.ccDeduction}
                    onChange={(e) => setPayrollForm({ ...payrollForm, ccDeduction: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Insurance Deduction"
                    type="number"
                    value={payrollForm.insuranceDeduction}
                    onChange={(e) => setPayrollForm({ ...payrollForm, insuranceDeduction: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Adjustment"
                    type="number"
                    value={payrollForm.annualAdjustment}
                    onChange={(e) => setPayrollForm({ ...payrollForm, annualAdjustment: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Paychecks Remaining"
                    type="number"
                    value={payrollForm.paychecksRemaining}
                    onChange={(e) => setPayrollForm({ ...payrollForm, paychecksRemaining: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Per Paycheck Adjustment"
                    type="number"
                    value={payrollForm.perPaycheckAdjustment}
                    onChange={(e) => setPayrollForm({ ...payrollForm, perPaycheckAdjustment: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Adjusted Check Amount"
                    type="number"
                    value={payrollForm.adjustedCheckAmount}
                    onChange={(e) => setPayrollForm({ ...payrollForm, adjustedCheckAmount: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="PTO Days"
                    type="number"
                    value={payrollForm.ptoDays}
                    onChange={(e) => setPayrollForm({ ...payrollForm, ptoDays: e.target.value })}
                    helperText="Can be fractional (e.g., 2.5)"
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayrollDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePayroll} startIcon={<AttachMoneyIcon />}>
            Save Payroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Staff Confirmation */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Staff Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedStaff?.firstName} {selectedStaff?.lastName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteStaff}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

