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
  Alert,
  Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ClassDialog from '../components/dialogs/ClassDialog';
import ViewClassDialog from '../components/dialogs/ViewClassDialog';

interface Class {
  id: string;
  name: string;
  gradeId?: string;
  gradeName?: string;
  roomNumber?: string;
  studentCount: number;
  teachers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  }>;
  status?: string;
  academicYear?: string;
}

export default function Classes() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [classesRes, gradesRes, studentsRes, staffRes] = await Promise.all([
        api.get('/classes'),
        api.get('/grades'),
        api.get('/students'),
        api.get('/staff'),
      ]);

      const allClasses = classesRes.data.classes || [];
      const allGrades = gradesRes.data.grades || [];
      const allStudents = studentsRes.data.students || [];
      const allStaff = staffRes.data.staff || [];

      // Enrich classes with grade info (teachers and studentCount should already be in response)
      const enrichedClasses = allClasses.map((classItem: any) => {
        const grade = allGrades.find(
          (g: any) => g.id === classItem.gradeId || g.id === classItem.grade_id
        );

        return {
          id: classItem.id || classItem._id,
          name: classItem.name,
          gradeId: classItem.gradeId || classItem.grade_id,
          gradeName: grade?.name || '—',
          roomNumber: classItem.roomNumber || classItem.room_number,
          studentCount: classItem.studentCount || 0,
          teachers: classItem.teachers || [],
          status: classItem.status || 'active',
          academicYear: classItem.academicYear || classItem.academic_year,
        };
      });

      // Sort by grade level, then by class name
      enrichedClasses.sort((a, b) => {
        const gradeA = allGrades.find((g: any) => g.id === a.gradeId);
        const gradeB = allGrades.find((g: any) => g.id === b.gradeId);
        const levelA = gradeA?.level || 0;
        const levelB = gradeB?.level || 0;
        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });

      setClasses(enrichedClasses);
      setGrades(allGrades);
    } catch (err: any) {
      console.error('Error loading classes:', err);
      setError(err?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (classData: Class) => {
    setSelectedClass(classData);
    setViewDialogOpen(true);
  };

  const handleEdit = (classData: Class) => {
    setSelectedClass(classData);
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedClass(null);
    setAddDialogOpen(true);
  };

  const handleSave = async (classData: any) => {
    try {
      if (selectedClass) {
        // Update existing class
        await api.put(`/classes/${selectedClass.id}`, classData);
      } else {
        // Add new class
        await api.post('/classes', classData);
      }
      setEditDialogOpen(false);
      setAddDialogOpen(false);
      await loadData(); // Reload data
    } catch (err: any) {
      console.error('Error saving class:', err);
      setError(err?.response?.data?.message || 'Failed to save class');
    }
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
        classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (classItem.roomNumber && classItem.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        classItem.teachers.some(t => 
          `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'all' || classItem.status === statusFilter;
      const matchesGrade = gradeFilter === 'all' || classItem.gradeName === gradeFilter;
      
      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [classes, searchQuery, statusFilter, gradeFilter]);

  // Paginated classes
  const paginatedClasses = useMemo(() => {
    return filteredClasses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredClasses, page, rowsPerPage]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Classes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage classes and assignments ({filteredClasses.length} classes)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Class
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
              <MenuItem value="completed">Completed</MenuItem>
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
              {grades.map((grade) => (
                <MenuItem key={grade.id} value={grade.name}>
                  {grade.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Classes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Class Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Students</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Teachers</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchQuery || statusFilter !== 'all' || gradeFilter !== 'all'
                      ? 'No classes match your filters'
                      : 'No classes found'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedClasses.map((classItem) => (
                <TableRow key={classItem.id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{classItem.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={classItem.gradeName || '—'} size="small" />
                  </TableCell>
                  <TableCell>{classItem.roomNumber || '—'}</TableCell>
                  <TableCell>{classItem.studentCount}</TableCell>
                  <TableCell>
                    {classItem.teachers && classItem.teachers.length > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {classItem.teachers.slice(0, 2).map((teacher) => (
                          <Avatar
                            key={teacher.id}
                            sx={{ width: 24, height: 24, bgcolor: '#667eea', fontSize: '0.75rem' }}
                          >
                            {teacher.firstName?.[0] || ''}{teacher.lastName?.[0] || ''}
                          </Avatar>
                        ))}
                        {classItem.teachers.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{classItem.teachers.length - 2}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={classItem.status || 'active'}
                      color={classItem.status === 'active' ? 'success' : 'default'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleView(classItem)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(classItem)}
                        >
                          <EditIcon />
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
          count={filteredClasses.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Dialogs */}
      <ViewClassDialog
        open={viewDialogOpen}
        classData={selectedClass}
        onClose={() => setViewDialogOpen(false)}
      />
      <ClassDialog
        open={editDialogOpen || addDialogOpen}
        classData={selectedClass}
        onClose={() => {
          setEditDialogOpen(false);
          setAddDialogOpen(false);
        }}
        onSave={handleSave}
      />
    </Box>
  );
}

