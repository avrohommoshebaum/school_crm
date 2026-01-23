import { useState, useEffect } from "react";
import { Search, Plus, Mail, Phone, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";
import api from "../utils/api";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  gradeNames?: string[];
  classNames?: string[];
  studentCount?: number;
  employmentStatus?: string;
};

export default function Teachers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [staffRes, classesRes, studentsRes] = await Promise.all([
        api.get("/staff"),
        api.get("/classes"),
        api.get("/students"),
      ]);

      const allStaff = staffRes.data.staff || [];
      const allClasses = classesRes.data.classes || [];
      const allStudents = studentsRes.data.students || [];

      // Filter for teachers (staff with teacher positions or assigned to classes)
      const teachersData = allStaff
        .filter((staff: any) => {
          // Check if staff has teacher position or is assigned to classes
          const hasTeacherPosition = staff.positions?.some(
            (p: any) => p.positionName?.toLowerCase().includes("teacher") || 
                       p.position_name?.toLowerCase().includes("teacher")
          );
          const hasClassAssignment = allClasses.some(
            (c: any) => c.teacherId === staff.id || c.teacher_id === staff.id
          );
          return hasTeacherPosition || hasClassAssignment;
        })
        .map((staff: any) => {
          // Get classes assigned to this teacher
          const assignedClasses = allClasses.filter(
            (c: any) => c.teacherId === staff.id || c.teacher_id === staff.id
          );
          
          // Get grades from classes
          const gradeIds = new Set(
            assignedClasses
              .map((c: any) => c.gradeId || c.grade_id)
              .filter(Boolean)
          );
          
          // Count students in assigned classes
          const studentCount = allStudents.filter((s: any) =>
            assignedClasses.some(
              (c: any) => (s.classId || s.class_id) === (c.id || c._id)
            )
          ).length;

          return {
            id: staff.id || staff._id,
            firstName: staff.firstName || staff.first_name || "",
            lastName: staff.lastName || staff.last_name || "",
            email: staff.email,
            phone: staff.phone,
            title: staff.title,
            gradeNames: Array.from(gradeIds).map((gradeId) => {
              // You'd need to fetch grades to get names, but for now just show count
              return `Grade ${gradeId}`;
            }),
            classNames: assignedClasses.map((c: any) => c.name),
            studentCount,
            employmentStatus: staff.employmentStatus || staff.employment_status || "active",
          };
        });

      setTeachers(teachersData);
    } catch (err: any) {
      console.error("Error loading teachers:", err);
      setError(err?.response?.data?.message || "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedTeachers = filteredTeachers.slice(
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
    <Box sx={{ maxWidth: 1300, mx: "auto", p: 2, pb: 8 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Teachers & Staff
          </Typography>
          <Typography color="text.secondary">
            Manage teaching staff and assignments ({filteredTeachers.length} teachers)
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => navigate("/admin/staff")}
        >
          Add Teacher
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        {[
          { label: "Total Teachers", value: teachers.length, icon: <Users /> },
          { label: "Active Teachers", value: teachers.filter(t => t.employmentStatus === "active").length, icon: <BookOpen /> },
          { label: "Total Students", value: teachers.reduce((sum, t) => sum + (t.studentCount || 0), 0), icon: <Users /> },
        ].map((stat, idx) => (
          <Card key={idx} sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h6">{stat.value}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.light" }}>
                  {stat.icon}
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Search size={16} />
            <TextField
              fullWidth
              placeholder="Search teachers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Classes</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Students</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchQuery ? "No teachers match your search" : "No teachers found"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTeachers.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
                        {t.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>
                          {t.title ? `${t.title} ` : ""}{t.firstName} {t.lastName}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{t.email || "—"}</TableCell>
                  <TableCell>{t.phone || "—"}</TableCell>
                  <TableCell>
                    {t.classNames && t.classNames.length > 0 ? (
                      <Chip label={t.classNames.join(", ")} size="small" />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{t.studentCount || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={t.employmentStatus || "active"}
                      color={t.employmentStatus === "active" ? "success" : "default"}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {t.email && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Mail size={14} />}
                          href={`mailto:${t.email}`}
                        >
                          Email
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/admin/staff/${t.id}`)}
                      >
                        View
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTeachers.length}
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

      {/* Add Teacher Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Teacher</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              To add a new teacher, please use the Staff Management page.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => navigate("/admin/staff")}>
            Go to Staff Management
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

