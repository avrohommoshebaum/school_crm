import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClassDialog from '../components/dialogs/ClassDialog';
import ViewClassDialog from '../components/dialogs/ViewClassDialog';

import SamplePageOverlay from '../components/samplePageOverlay';

// Mock data - replace with actual API calls
const mockClasses = [
  {
    id: '1',
    className: 'Kindergarten A',
    grade: 'K',
    teacher: 'Mrs. Sarah Goldberg',
    teacherId: 't1',
    room: '101',
    studentCount: 18,
    maxCapacity: 20,
    schedule: 'Mon-Fri 8:30 AM - 3:00 PM',
    subjects: ['Hebrew', 'English', 'Math', 'Art'],
    status: 'active',
    schoolYear: '2024-2025',
    notes: 'Morning snack provided',
  },
  {
    id: '2',
    className: '1st Grade A',
    grade: '1',
    teacher: 'Mrs. Rachel Cohen',
    teacherId: 't2',
    room: '102',
    studentCount: 22,
    maxCapacity: 22,
    schedule: 'Mon-Fri 8:15 AM - 3:15 PM',
    subjects: ['Hebrew', 'English', 'Math', 'Science', 'Judaics'],
    status: 'active',
    schoolYear: '2024-2025',
    notes: '',
  },
  {
    id: '3',
    className: '1st Grade B',
    grade: '1',
    teacher: 'Mrs. Miriam Levy',
    teacherId: 't3',
    room: '103',
    studentCount: 20,
    maxCapacity: 22,
    schedule: 'Mon-Fri 8:15 AM - 3:15 PM',
    subjects: ['Hebrew', 'English', 'Math', 'Science', 'Judaics'],
    status: 'active',
    schoolYear: '2024-2025',
    notes: '',
  },
  {
    id: '4',
    className: '2nd Grade A',
    grade: '2',
    teacher: 'Mrs. Chaya Schwartz',
    teacherId: 't4',
    room: '201',
    studentCount: 21,
    maxCapacity: 24,
    schedule: 'Mon-Fri 8:00 AM - 3:30 PM',
    subjects: ['Hebrew', 'English', 'Math', 'Science', 'Social Studies', 'Judaics'],
    status: 'active',
    schoolYear: '2024-2025',
    notes: '',
  },
  {
    id: '5',
    className: '3rd Grade A',
    grade: '3',
    teacher: 'Mrs. Devorah Klein',
    teacherId: 't5',
    room: '202',
    studentCount: 19,
    maxCapacity: 24,
    schedule: 'Mon-Fri 8:00 AM - 3:30 PM',
    subjects: ['Hebrew', 'English', 'Math', 'Science', 'Social Studies', 'Judaics'],
    status: 'active',
    schoolYear: '2024-2025',
    notes: '',
  },
  {
    id: '6',
    className: '4th Grade A',
    grade: '4',
    teacher: 'Mrs. Leah Friedman',
    teacherId: 't6',
    room: '203',
    studentCount: 23,
    maxCapacity: 24,
    schedule: 'Mon-Fri 8:00 AM - 3:45 PM',
    subjects: ['Hebrew', 'English', 'Math', 'Science', 'Social Studies', 'Judaics', 'Art'],
    status: 'active',
    schoolYear: '2024-2025',
    notes: 'Advanced Math group',
  },
  {
    id: '7',
    className: 'Summer Program',
    grade: 'Mixed',
    teacher: 'Mrs. Rivka Stein',
    teacherId: 't7',
    room: '105',
    studentCount: 15,
    maxCapacity: 20,
    schedule: 'Mon-Thu 9:00 AM - 12:00 PM',
    subjects: ['Art', 'Music', 'Recreation'],
    status: 'inactive',
    schoolYear: '2024-2025',
    notes: 'Summer only',
  },
];

export default function Classes() {
  const [classes, setClasses] = useState(mockClasses);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  // Simulate fetching data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleView = (classData: any) => {
    setSelectedClass(classData);
    setViewDialogOpen(true);
  };

  const handleEdit = (classData: any) => {
    setSelectedClass(classData);
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedClass(null);
    setAddDialogOpen(true);
  };

  const handleSave = (classData: any) => {
    if (selectedClass) {
      // Update existing class
      setClasses(prev => prev.map(c => c.id === classData.id ? classData : c));
    } else {
      // Add new class
      setClasses(prev => [...prev, { ...classData, id: Date.now().toString() }]);
    }
    setEditDialogOpen(false);
    setAddDialogOpen(false);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtered and searched classes
  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const matchesSearch = 
        classItem.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.room.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || classItem.status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || classItem.grade === gradeFilter;
      
      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [classes, searchQuery, statusFilter, gradeFilter]);

  // Paginated classes
  const paginatedClasses = useMemo(() => {
    return filteredClasses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredClasses, page, rowsPerPage]);

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <SamplePageOverlay />
      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search classes, teachers, or rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Grade</InputLabel>
            <Select
              value={gradeFilter}
              label="Grade"
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <MenuItem value="all">All Grades</MenuItem>
              <MenuItem value="K">Kindergarten</MenuItem>
              <MenuItem value="1">Grade 1</MenuItem>
              <MenuItem value="2">Grade 2</MenuItem>
              <MenuItem value="3">Grade 3</MenuItem>
              <MenuItem value="4">Grade 4</MenuItem>
              <MenuItem value="5">Grade 5</MenuItem>
              <MenuItem value="6">Grade 6</MenuItem>
              <MenuItem value="7">Grade 7</MenuItem>
              <MenuItem value="8">Grade 8</MenuItem>
              <MenuItem value="Mixed">Mixed</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              Loading classes...
            </Typography>
          </Stack>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Class Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Teacher</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Room</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Students</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="text.secondary">
                        No classes found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClasses.map((classItem) => {
                    const percentage = (classItem.studentCount / classItem.maxCapacity) * 100;
                    const capacityColor = percentage >= 100 ? 'error' : percentage >= 80 ? 'warning' : 'success';
                    
                    return (
                      <TableRow 
                        key={classItem.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>{classItem.className}</TableCell>
                        <TableCell>
                          {classItem.grade === 'K' ? 'K' : classItem.grade === 'Mixed' ? 'Mixed' : `Grade ${classItem.grade}`}
                        </TableCell>
                        <TableCell>{classItem.teacher}</TableCell>
                        <TableCell align="center">{classItem.room}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${classItem.studentCount}/${classItem.maxCapacity}`}
                            color={capacityColor}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={classItem.status}
                            color={classItem.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleView(classItem)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Class">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(classItem)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredClasses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>

      {/* View Dialog */}
      {viewDialogOpen && selectedClass && (
        <ViewClassDialog
          open={viewDialogOpen}
          classData={selectedClass}
          onClose={() => setViewDialogOpen(false)}
          onEdit={() => {
            setViewDialogOpen(false);
            setEditDialogOpen(true);
          }}
        />
      )}

      {/* Edit Dialog */}
      {editDialogOpen && selectedClass && (
        <ClassDialog
          open={editDialogOpen}
          classData={selectedClass}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Add Dialog */}
      {addDialogOpen && (
        <ClassDialog
          open={addDialogOpen}
          classData={null}
          onClose={() => setAddDialogOpen(false)}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}