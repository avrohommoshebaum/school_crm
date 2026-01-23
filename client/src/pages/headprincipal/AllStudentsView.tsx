import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Search, Visibility, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  classId?: string;
  className?: string;
  gradeName?: string;
  enrollmentStatus?: string;
  flagged?: boolean;
}

export default function AllStudentsView() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [gradeFilter, setGradeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Array<{ id: string; name: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string; gradeId?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentsRes, gradesRes, classesRes] = await Promise.all([
        api.get('/students'),
        api.get('/grades'),
        api.get('/classes'),
      ]);

      const allStudents = studentsRes.data.students || [];
      const allGrades = gradesRes.data.grades || [];
      const allClasses = classesRes.data.classes || [];

      // Get flagged students
      let flaggedStudentIds = new Set<string>();
      try {
        const flaggedRes = await api.get('/principal/flagged-students');
        flaggedStudentIds = new Set(
          (flaggedRes.data.flaggedStudents || []).map((s: any) => s.id || s._id)
        );
      } catch (err) {
        console.warn('Could not fetch flagged students:', err);
      }

      // Enrich students with class and grade info
      const enrichedStudents = allStudents.map((student: any) => {
        const classInfo = allClasses.find(
          (c: any) => c.id === student.classId || c.id === student.class_id
        );
        const gradeInfo = classInfo
          ? allGrades.find((g: any) => g.id === classInfo.gradeId || g.id === classInfo.grade_id)
          : null;

        return {
          id: student.id || student._id,
          firstName: student.firstName || student.first_name || '',
          lastName: student.lastName || student.last_name || '',
          studentId: student.studentId || student.student_id,
          classId: student.classId || student.class_id,
          className: classInfo?.name || '—',
          gradeName: gradeInfo?.name || '—',
          enrollmentStatus: student.enrollmentStatus || student.enrollment_status || 'active',
          flagged: flaggedStudentIds.has(student.id || student._id),
        };
      });

      setStudents(enrichedStudents);
      setGrades(allGrades.map((g: any) => ({ id: g.id || g._id, name: g.name })));
      setClasses(allClasses.map((c: any) => ({ id: c.id || c._id, name: c.name, gradeId: c.gradeId || c.grade_id })));
    } catch (err: any) {
      console.error('Error loading students:', err);
      setError(err?.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesGrade = gradeFilter === 'All' || student.gradeName === gradeFilter;
    const matchesSearch =
      searchQuery === '' ||
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Flagged' && student.flagged) ||
      (statusFilter === 'Not Flagged' && !student.flagged) ||
      (statusFilter === 'Active' && student.enrollmentStatus === 'active') ||
      (statusFilter === 'Inactive' && student.enrollmentStatus !== 'active');
    return matchesGrade && matchesSearch && matchesStatus;
  });

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadData}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          All Students View
        </Typography>
        <Typography variant="body2" color="text.secondary">
          School-wide student overview with detailed tracking and logs ({filteredStudents.length} students)
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Search Students"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Grade</InputLabel>
              <Select
                value={gradeFilter}
                label="Grade"
                onChange={(e) => {
                  setGradeFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">All Grades</MenuItem>
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.name}>
                    {grade.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Flagged">Flagged</MenuItem>
                <MenuItem value="Not Flagged">Not Flagged</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell><strong>Student</strong></TableCell>
              <TableCell><strong>Student ID</strong></TableCell>
              <TableCell><strong>Grade</strong></TableCell>
              <TableCell><strong>Class</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No students found matching your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#667eea',
                          fontSize: '0.875rem',
                        }}
                      >
                        {student.firstName[0]}{student.lastName[0]}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {student.firstName} {student.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {student.studentId || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={student.gradeName || '—'} size="small" sx={{ bgcolor: '#e3f2fd' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{student.className || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    {student.flagged ? (
                      <Chip
                        icon={<Warning sx={{ fontSize: 14 }} />}
                        label="Flagged"
                        size="small"
                        color="error"
                      />
                    ) : (
                      <Chip
                        label={student.enrollmentStatus === 'active' ? 'Active' : 'Inactive'}
                        size="small"
                        color={student.enrollmentStatus === 'active' ? 'success' : 'default'}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/principal/students/${student.id}`)}
                    >
                      <Visibility />
                    </IconButton>
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
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>
    </Box>
  );
}

