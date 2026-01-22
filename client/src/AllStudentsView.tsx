import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
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
} from '@mui/material';
import { Search, Visibility, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router';

// Mock data for students
const mockStudents = [
  { id: '1', firstName: 'Chaya', lastName: 'Schwartz', grade: 'Kindergarten', class: 'Class A', hebrewPerformance: 85, englishPerformance: 82, behavior: 88, attendance: 96, flagged: false },
  { id: '2', firstName: 'Sarah', lastName: 'Cohen', grade: 'Kindergarten', class: 'Class B', hebrewPerformance: 82, englishPerformance: 80, behavior: 86, attendance: 94, flagged: true },
  { id: '3', firstName: 'Rivka', lastName: 'Goldstein', grade: '1st Grade', class: 'Class A', hebrewPerformance: 88, englishPerformance: 90, behavior: 90, attendance: 97, flagged: false },
  { id: '4', firstName: 'Miriam', lastName: 'Levine', grade: '1st Grade', class: 'Class B', hebrewPerformance: 78, englishPerformance: 75, behavior: 75, attendance: 92, flagged: true },
  { id: '5', firstName: 'Devorah', lastName: 'Weiss', grade: '2nd Grade', class: 'Class A', hebrewPerformance: 84, englishPerformance: 86, behavior: 87, attendance: 95, flagged: false },
  { id: '6', firstName: 'Leah', lastName: 'Katz', grade: '2nd Grade', class: 'Class C', hebrewPerformance: 86, englishPerformance: 84, behavior: 88, attendance: 96, flagged: false },
  { id: '7', firstName: 'Esther', lastName: 'Rosenberg', grade: '3rd Grade', class: 'Class A', hebrewPerformance: 90, englishPerformance: 92, behavior: 92, attendance: 98, flagged: false },
  { id: '8', firstName: 'Rachel', lastName: 'Friedman', grade: '3rd Grade', class: 'Class B', hebrewPerformance: 76, englishPerformance: 74, behavior: 72, attendance: 89, flagged: true },
  { id: '9', firstName: 'Bracha', lastName: 'Stern', grade: '4th Grade', class: 'Class A', hebrewPerformance: 85, englishPerformance: 87, behavior: 87, attendance: 95, flagged: false },
  { id: '10', firstName: 'Shira', lastName: 'Klein', grade: '4th Grade', class: 'Class B', hebrewPerformance: 83, englishPerformance: 85, behavior: 85, attendance: 94, flagged: false },
  { id: '11', firstName: 'Yael', lastName: 'Berger', grade: '5th Grade', class: 'Class A', hebrewPerformance: 89, englishPerformance: 88, behavior: 91, attendance: 97, flagged: false },
  { id: '12', firstName: 'Tova', lastName: 'Fried', grade: '5th Grade', class: 'Class C', hebrewPerformance: 87, englishPerformance: 89, behavior: 89, attendance: 96, flagged: false },
  { id: '13', firstName: 'Nechama', lastName: 'Singer', grade: '6th Grade', class: 'Class A', hebrewPerformance: 84, englishPerformance: 86, behavior: 86, attendance: 94, flagged: false },
  { id: '14', firstName: 'Hadassah', lastName: 'Miller', grade: '6th Grade', class: 'Class B', hebrewPerformance: 86, englishPerformance: 84, behavior: 88, attendance: 95, flagged: false },
  { id: '15', firstName: 'Malka', lastName: 'Green', grade: '7th Grade', class: 'Class A', hebrewPerformance: 88, englishPerformance: 87, behavior: 87, attendance: 96, flagged: false },
  { id: '16', firstName: 'Chana', lastName: 'Wolf', grade: '7th Grade', class: 'Class B', hebrewPerformance: 85, englishPerformance: 82, behavior: 84, attendance: 93, flagged: true },
  { id: '17', firstName: 'Gitty', lastName: 'Brown', grade: '8th Grade', class: 'Class A', hebrewPerformance: 90, englishPerformance: 91, behavior: 92, attendance: 98, flagged: false },
  { id: '18', firstName: 'Ruchie', lastName: 'Davis', grade: '8th Grade', class: 'Class C', hebrewPerformance: 86, englishPerformance: 88, behavior: 88, attendance: 95, flagged: false },
];

export default function AllStudentsView() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [gradeFilter, setGradeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter students
  const filteredStudents = mockStudents.filter((student) => {
    const matchesGrade = gradeFilter === 'All' || student.grade === gradeFilter;
    const matchesSearch =
      searchQuery === '' ||
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Flagged' && student.flagged) ||
      (statusFilter === 'Not Flagged' && !student.flagged);
    return matchesGrade && matchesSearch && matchesStatus;
  });

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          All Students View
        </Typography>
        <Typography variant="body2" color="text.secondary">
          School-wide student overview with detailed tracking and logs
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Grade</InputLabel>
              <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} label="Grade">
                <MenuItem value="All">All Grades</MenuItem>
                <MenuItem value="Kindergarten">Kindergarten</MenuItem>
                <MenuItem value="1st Grade">1st Grade</MenuItem>
                <MenuItem value="2nd Grade">2nd Grade</MenuItem>
                <MenuItem value="3rd Grade">3rd Grade</MenuItem>
                <MenuItem value="4th Grade">4th Grade</MenuItem>
                <MenuItem value="5th Grade">5th Grade</MenuItem>
                <MenuItem value="6th Grade">6th Grade</MenuItem>
                <MenuItem value="7th Grade">7th Grade</MenuItem>
                <MenuItem value="8th Grade">8th Grade</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                <MenuItem value="All">All Students</MenuItem>
                <MenuItem value="Flagged">Flagged Only</MenuItem>
                <MenuItem value="Not Flagged">Not Flagged</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Hebrew</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>English</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Behavior</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Attendance</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow
                  key={student.id}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#667eea', fontSize: '0.875rem' }}>
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {student.firstName} {student.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={student.grade} size="small" sx={{ bgcolor: '#e3f2fd' }} />
                  </TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: student.hebrewPerformance >= 85 ? '#43e97b' : student.hebrewPerformance >= 75 ? '#667eea' : '#fa709a',
                        fontWeight: 600,
                      }}
                    >
                      {student.hebrewPerformance}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: student.englishPerformance >= 85 ? '#43e97b' : student.englishPerformance >= 75 ? '#667eea' : '#fa709a',
                        fontWeight: 600,
                      }}
                    >
                      {student.englishPerformance}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: student.behavior >= 85 ? '#43e97b' : student.behavior >= 75 ? '#667eea' : '#fa709a',
                        fontWeight: 600,
                      }}
                    >
                      {student.behavior}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: student.attendance >= 95 ? '#43e97b' : student.attendance >= 90 ? '#667eea' : '#fa709a',
                        fontWeight: 600,
                      }}
                    >
                      {student.attendance}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {student.flagged ? (
                      <Chip icon={<Warning sx={{ fontSize: 14 }} />} label="Flagged" size="small" color="error" />
                    ) : (
                      <Chip label="Good" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}