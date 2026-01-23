import { useState, useEffect } from "react";
import { Search, Plus, Upload, Filter, Edit, Trash2 } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Typography,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  Checkbox,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import api from "../utils/api";
import StudentDialog from "../components/dialogs/StudentDialog";
import { exportTableData } from "../utils/excelExport";
import type { ExportColumn } from "../utils/excelExport";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  gradeName?: string;
  className?: string;
  enrollmentStatus?: string;
  classId?: string;
  gradeId?: string;
};

export default function Students() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string; gradeId?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Bulk upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ imported: number; errors: number; details?: any } | null>(null);
  
  // Student management state
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Export
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const STUDENT_EXPORT_COLUMNS: ExportColumn[] = [
    { key: "name", label: "Name", format: (v, row) => `${row.firstName} ${row.lastName}` },
    { key: "studentId", label: "Student ID" },
    { key: "gradeName", label: "Grade" },
    { key: "className", label: "Class" },
    { key: "enrollmentStatus", label: "Status" },
  ];
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    STUDENT_EXPORT_COLUMNS.map((col) => col.key)
  );
  const [searchExpanded, setSearchExpanded] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentsRes, gradesRes, classesRes] = await Promise.all([
        api.get("/students"),
        api.get("/grades"),
        api.get("/classes"),
      ]);

      const allStudents = studentsRes.data.students || [];
      const allGrades = gradesRes.data.grades || [];
      const allClasses = classesRes.data.classes || [];

      // Enrich students with grade and class info
      const enrichedStudents = allStudents.map((student: any) => {
        const classInfo = allClasses.find(
          (c: any) => c.id === student.classId || c.id === student.class_id
        );
        const gradeInfo = classInfo
          ? allGrades.find((g: any) => g.id === classInfo.gradeId || g.id === classInfo.grade_id)
          : allGrades.find((g: any) => g.id === student.gradeId || g.id === student.grade_id);

        return {
          id: student.id || student._id,
          firstName: student.firstName || student.first_name || "",
          lastName: student.lastName || student.last_name || "",
          studentId: student.studentId || student.student_id,
          gradeName: gradeInfo?.name || "—",
          className: classInfo?.name || "—",
          enrollmentStatus: student.enrollmentStatus || student.enrollment_status || "active",
          classId: student.classId || student.class_id,
          gradeId: student.gradeId || student.grade_id,
        };
      });

      setStudents(enrichedStudents);
      setGrades(allGrades);
      setClasses(allClasses);
    } catch (err: any) {
      console.error("Error loading students:", err);
      setError(err?.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "text/csv" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
      ) {
        setExcelFile(file);
        setUploadError(null);
      } else {
        setUploadError("Please select a valid Excel file (.xlsx, .xls) or CSV file");
      }
    }
  };

  const handleUpload = async () => {
    if (!excelFile) {
      setUploadError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", excelFile);

      const response = await api.post("/import/students", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadResult(response.data);
      setUploadSuccess(true);
      setExcelFile(null);
      setUploadDialogOpen(false);
      
      // Reload students
      await loadData();
    } catch (err: any) {
      console.error("Error uploading students:", err);
      setUploadError(err?.response?.data?.message || "Failed to upload students");
    } finally {
      setUploading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGrade = gradeFilter === "all" || s.gradeName === gradeFilter;
    const matchesStatus = statusFilter === "all" || s.enrollmentStatus === statusFilter;
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student information and records ({filteredStudents.length} students)
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportTableData(filteredStudents, visibleColumns, STUDENT_EXPORT_COLUMNS, "students")}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ViewColumnIcon />}
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
          >
            Columns
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => {
              setSelectedStudent(null);
              setStudentDialogOpen(true);
            }}
          >
            Add Student
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search + Filters - Collapsible */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pb: searchExpanded ? 1 : 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterListIcon color="action" />
              <Typography variant="subtitle2" fontWeight={600}>
                Search & Filters
              </Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setSearchExpanded(!searchExpanded)}
            >
              {searchExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
          <Collapse in={searchExpanded}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <Box sx={{ position: "relative", flex: 1, width: "100%" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                    }}
                  />
                  <TextField
                    fullWidth
                    placeholder="Search students by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{
                      "& .MuiInputBase-input": { pl: 4 },
                    }}
                  />
                </Box>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={gradeFilter}
                    label="Grade"
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Grades</MenuItem>
                    {grades.map((grade) => (
                      <MenuItem key={grade.id} value={grade.name}>
                        {grade.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Class</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchQuery || gradeFilter !== "all" || statusFilter !== "all"
                      ? "No students match your filters"
                      : "No students found"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "primary.main",
                          fontSize: "0.875rem",
                        }}
                      >
                        {student.firstName.charAt(0)}
                      </Avatar>
                      <Typography>
                        {student.firstName} {student.lastName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{student.studentId || "—"}</TableCell>
                  <TableCell>{student.gradeName}</TableCell>
                  <TableCell>{student.className}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.enrollmentStatus || "active"}
                      color={student.enrollmentStatus === "active" ? "success" : "default"}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <Search size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedStudent(student);
                            setStudentDialogOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedStudent(student);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Bulk Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => !uploading && setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bulk Upload Students</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Upload an Excel file (.xlsx, .xls) or CSV file with student information.
              <br />
              <strong>Required columns:</strong> First Name, Last Name
              <br />
              <strong>Optional columns:</strong> Grade, Class, Student ID, Date of Birth, Gender, Enrollment Date
              <br />
              <br />
              <strong>Note:</strong> Grade and Class names must match existing grades and classes in the system.
              The system will automatically match students to the correct grade and class.
            </Alert>

            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload size={16} />}
              fullWidth
            >
              {excelFile ? excelFile.name : "Choose Excel File"}
              <input
                type="file"
                hidden
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
            </Button>

            {uploadError && (
              <Alert severity="error">{uploadError}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!excelFile || uploading}
          >
            {uploading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Student Dialog */}
      <StudentDialog
        open={studentDialogOpen}
        student={selectedStudent || undefined}
        onClose={() => {
          setStudentDialogOpen(false);
          setSelectedStudent(null);
        }}
        onSave={async (studentData) => {
          try {
            if (selectedStudent) {
              // Update existing student
              await api.put(`/students/${selectedStudent.id}`, studentData);
              setSnackbar({ open: true, message: 'Student updated successfully', severity: 'success' });
            } else {
              // Create new student
              await api.post('/students', studentData);
              setSnackbar({ open: true, message: 'Student created successfully', severity: 'success' });
            }
            setStudentDialogOpen(false);
            setSelectedStudent(null);
            await loadData();
          } catch (err: any) {
            setSnackbar({
              open: true,
              message: err?.response?.data?.message || 'Failed to save student',
              severity: 'error',
            });
          }
        }}
        grades={grades}
        classes={classes}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{' '}
            <strong>
              {selectedStudent?.firstName} {selectedStudent?.lastName}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!selectedStudent) return;
              setDeleting(true);
              try {
                await api.delete(`/students/${selectedStudent.id}`);
                setSnackbar({ open: true, message: 'Student deleted successfully', severity: 'success' });
                setDeleteDialogOpen(false);
                setSelectedStudent(null);
                await loadData();
              } catch (err: any) {
                setSnackbar({
                  open: true,
                  message: err?.response?.data?.message || 'Failed to delete student',
                  severity: 'error',
                });
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Success Snackbar */}
      <Snackbar
        open={uploadSuccess}
        autoHideDuration={6000}
        onClose={() => setUploadSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setUploadSuccess(false)}
          sx={{ width: "100%" }}
        >
          {uploadResult
            ? `Successfully imported ${uploadResult.imported} student${uploadResult.imported !== 1 ? "s" : ""}${
                uploadResult.errors > 0
                  ? `. ${uploadResult.errors} error${uploadResult.errors !== 1 ? "s" : ""} occurred.`
                  : ""
              }`
            : "Students uploaded successfully"}
        </Alert>
      </Snackbar>

      {/* General Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
      >
        {STUDENT_EXPORT_COLUMNS.map((col) => (
          <MenuItem key={col.key} onClick={() => {
            setVisibleColumns((prev) =>
              prev.includes(col.key)
                ? prev.filter((key) => key !== col.key)
                : [...prev, col.key]
            );
          }}>
            <Checkbox checked={visibleColumns.includes(col.key)} />
            <Typography sx={{ ml: 1 }}>{col.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

