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

import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";

// ============================================
// TYPES
// ============================================

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

  // Excel import
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

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

  const showSnackbar = (message: string, severity: "success" | "error") => {
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
      });
    }
    setStaffDialog(true);
  };

  const handleSaveStaff = async () => {
    try {
      const { positionId, initialSalary, salaryType, payFrequency, ...staffData } = staffForm;
      
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
            salaryAmount: parseFloat(initialSalary),
            salaryType,
            payFrequency,
            effectiveDate: staffData.hireDate || new Date().toISOString().split('T')[0],
          });
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
      const { data } = await api.get("/staff");
      setStaff(data.staff || []);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || "Failed to save position", "error");
    }
  };

  // Salary management
  const handleOpenSalaryDialog = (staffMember: Staff, salary?: Salary) => {
    setSelectedStaff(staffMember);
    if (salary) {
      setSalaryForm({
        salaryAmount: salary.salaryAmount.toString(),
        salaryType: salary.salaryType,
        effectiveDate: salary.effectiveDate,
        endDate: salary.endDate || "",
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
      await api.post(`/staff/${selectedStaff.id}/salaries`, {
        salaryAmount: parseFloat(salaryForm.salaryAmount),
        salaryType: salaryForm.salaryType,
        effectiveDate: salaryForm.effectiveDate,
        endDate: salaryForm.endDate || null,
        payFrequency: salaryForm.payFrequency,
        notes: salaryForm.notes || null,
      });

      showSnackbar("Salary added successfully", "success");
      setSalaryDialog(false);
      // Reload staff data
      hasLoadedRef.current = false;
      const { data } = await api.get(`/staff/${selectedStaff.id}`);
      const updatedStaff = staff.map((s) => (s.id === selectedStaff.id ? data.staff : s));
      setStaff(updatedStaff);
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
      <Dialog open={staffDialog} onClose={() => setStaffDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStaff ? "Edit Staff Member" : "Add Staff Member"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  value={staffForm.firstName}
                  onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  value={staffForm.lastName}
                  onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={staffForm.employeeId}
                  onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title (Mr., Mrs., etc.)"
                  value={staffForm.title}
                  onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })}
                />
              </Grid>
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
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Initial Salary"
                  type="number"
                  value={staffForm.initialSalary}
                  onChange={(e) => setStaffForm({ ...staffForm, initialSalary: e.target.value })}
                  disabled={!!selectedStaff}
                  helperText={selectedStaff ? "Edit salary in staff details" : "Optional: Set initial salary"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!!selectedStaff}>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={staffForm.bio}
                  onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
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
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveStaff}
            disabled={!staffForm.firstName || !staffForm.lastName}
          >
            {selectedStaff ? "Update" : "Create"}
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
      <Dialog open={salaryDialog} onClose={() => setSalaryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Salary</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Salary Amount"
              type="number"
              required
              value={salaryForm.salaryAmount}
              onChange={(e) => setSalaryForm({ ...salaryForm, salaryAmount: e.target.value })}
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
              label="Effective Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              value={salaryForm.effectiveDate}
              onChange={(e) => setSalaryForm({ ...salaryForm, effectiveDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="End Date (optional)"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={salaryForm.endDate}
              onChange={(e) => setSalaryForm({ ...salaryForm, endDate: e.target.value })}
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
            Add Salary
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
        <DialogContent>
          {selectedStaff && (
            <Box sx={{ mt: 2 }}>
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}>
                <Tab label="Overview" />
                <Tab label="Positions" />
                <Tab label="Salaries" />
                <Tab label="Benefits" />
                <Tab label="Documents" />
              </Tabs>

              <Box sx={{ mt: 3 }}>
                {detailTab === 0 && (
                  <Stack spacing={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography>{selectedStaff.email || "-"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                        <Typography>{selectedStaff.phone || "-"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                        <Typography>{selectedStaff.employeeId || "-"}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Hire Date</Typography>
                        <Typography>{selectedStaff.hireDate || "-"}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                        <Typography>{selectedStaff.bio || "-"}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                        <Typography>{selectedStaff.notes || "-"}</Typography>
                      </Grid>
                    </Grid>
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
                          setDetailDialog(false);
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
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStaff.positions.map((pos) => (
                              <TableRow key={pos.id}>
                                <TableCell>{pos.positionName}</TableCell>
                                <TableCell>{pos.gradeName || "-"}</TableCell>
                                <TableCell>{pos.startDate || "-"}</TableCell>
                                <TableCell>{pos.endDate || "-"}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={pos.isActive ? "Active" : "Inactive"}
                                    size="small"
                                    color={pos.isActive ? "success" : "default"}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
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
                          setDetailDialog(false);
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
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStaff.salaries.map((sal) => (
                              <TableRow key={sal.id}>
                                <TableCell>${sal.salaryAmount.toLocaleString()}</TableCell>
                                <TableCell>{sal.salaryType}</TableCell>
                                <TableCell>{sal.payFrequency}</TableCell>
                                <TableCell>{sal.effectiveDate}</TableCell>
                                <TableCell>{sal.endDate || "Current"}</TableCell>
                              </TableRow>
                            ))}
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

