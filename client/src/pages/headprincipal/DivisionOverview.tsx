import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, TrendingUp, Visibility } from '@mui/icons-material';
import { LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router';

interface Division {
  id: string;
  name: string;
  grades: string[];
  hebrewPrincipalId?: string;
  hebrewPrincipalName?: string;
  englishPrincipalId?: string;
  englishPrincipalName?: string;
  studentCount: number;
  avgHebrewPerformance: number;
  avgEnglishPerformance: number;
  avgBehavior: number;
  attendanceRate: number;
}

const allGrades = ['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade'];

const mockDivisions: Division[] = [
  {
    id: '1',
    name: 'Primary Division',
    grades: ['Kindergarten', '1st Grade', '2nd Grade'],
    hebrewPrincipalId: '1',
    hebrewPrincipalName: 'Mrs. Schwartz',
    englishPrincipalId: '1',
    englishPrincipalName: 'Mrs. Schwartz',
    studentCount: 145,
    avgHebrewPerformance: 84,
    avgEnglishPerformance: 84,
    avgBehavior: 87,
    attendanceRate: 95,
  },
  {
    id: '2',
    name: 'Elementary Division',
    grades: ['3rd Grade', '4th Grade', '5th Grade'],
    hebrewPrincipalId: '2',
    hebrewPrincipalName: 'Mrs. Goldstein',
    englishPrincipalId: '2',
    englishPrincipalName: 'Mrs. Goldstein',
    studentCount: 158,
    avgHebrewPerformance: 85,
    avgEnglishPerformance: 85,
    avgBehavior: 86,
    attendanceRate: 96,
  },
  {
    id: '3',
    name: 'Middle School Division',
    grades: ['6th Grade', '7th Grade', '8th Grade'],
    hebrewPrincipalId: '3',
    hebrewPrincipalName: 'Mrs. Levine',
    englishPrincipalId: '3',
    englishPrincipalName: 'Mrs. Levine',
    studentCount: 142,
    avgHebrewPerformance: 86,
    avgEnglishPerformance: 86,
    avgBehavior: 87,
    attendanceRate: 95,
  },
];

const divisionProgressData = [
  { month: 'Sep', academicScore: 75, behaviorScore: 82, attendanceRate: 95 },
  { month: 'Oct', academicScore: 78, behaviorScore: 85, attendanceRate: 96 },
  { month: 'Nov', academicScore: 80, behaviorScore: 84, attendanceRate: 94 },
  { month: 'Dec', academicScore: 82, behaviorScore: 86, attendanceRate: 93 },
  { month: 'Jan', academicScore: 84, behaviorScore: 88, attendanceRate: 95 },
];

const gradeComparisonData = [
  { grade: 'K', performance: 85, behavior: 88, attendance: 96 },
  { grade: '1st', performance: 82, behavior: 86, attendance: 95 },
  { grade: '2nd', performance: 84, behavior: 87, attendance: 94 },
  { grade: '3rd', performance: 86, behavior: 85, attendance: 96 },
  { grade: '4th', performance: 83, behavior: 84, attendance: 95 },
  { grade: '5th', performance: 87, behavior: 89, attendance: 97 },
  { grade: '6th', performance: 85, behavior: 86, attendance: 94 },
  { grade: '7th', performance: 88, behavior: 87, attendance: 96 },
  { grade: '8th', performance: 86, behavior: 88, attendance: 95 },
];

export default function DivisionOverview() {
  const [divisions, setDivisions] = useState<Division[]>(mockDivisions);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grades: [] as string[],
  });

  const handleOpenDialog = (division?: Division) => {
    if (division) {
      setEditingDivision(division);
      setFormData({
        name: division.name,
        grades: division.grades,
      });
    } else {
      setEditingDivision(null);
      setFormData({
        name: '',
        grades: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDivision(null);
    setFormData({ name: '', grades: [] });
  };

  const handleGradeChange = (event: any) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      grades: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleSaveDivision = () => {
    if (editingDivision) {
      // Update existing division
      setDivisions(divisions.map(div => 
        div.id === editingDivision.id 
          ? { ...div, name: formData.name, grades: formData.grades }
          : div
      ));
    } else {
      // Create new division
      const newDivision: Division = {
        id: String(divisions.length + 1),
        name: formData.name,
        grades: formData.grades,
        studentCount: 0,
        avgHebrewPerformance: 0,
        avgEnglishPerformance: 0,
        avgBehavior: 0,
        attendanceRate: 0,
      };
      setDivisions([...divisions, newDivision]);
    }
    handleCloseDialog();
  };

  const handleDeleteDivision = (divisionId: string) => {
    if (confirm('Are you sure you want to delete this division?')) {
      setDivisions(divisions.filter(div => div.id !== divisionId));
    }
  };

  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Division Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage divisions and view school-wide performance metrics
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          Add Division
        </Button>
      </Box>

      {/* Divisions Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {divisions.map((division) => (
          <Grid xs={12} md={6} lg={4} key={division.id}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {division.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(division)}>
                      <Edit sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteDivision(division.id)}>
                      <Delete sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Grades */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Grades:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {division.grades.map((grade) => (
                      <Chip key={grade} label={grade} size="small" sx={{ bgcolor: '#e3f2fd' }} />
                    ))}
                  </Box>
                </Box>

                {/* Principal Assignment */}
                {division.hebrewPrincipalName && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Principal:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {division.hebrewPrincipalName}
                    </Typography>
                  </Box>
                )}

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Students
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 600 }}>
                      {division.studentCount}
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Performance
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#f093fb', fontWeight: 600 }}>
                      {division.avgHebrewPerformance}
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Behavior
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#43e97b', fontWeight: 600 }}>
                      {division.avgBehavior}
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Attendance
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#ffd93d', fontWeight: 600 }}>
                      {division.attendanceRate}%
                    </Typography>
                  </Grid>
                </Grid>

                {/* View Details Button */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/principal/head-principal/division/${division.id}`)}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Division Progress Chart */}
        <Grid xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Division Progress Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={divisionProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="academicScore" stroke="#667eea" strokeWidth={2} name="Academic Score" />
                <Line type="monotone" dataKey="behaviorScore" stroke="#f093fb" strokeWidth={2} name="Behavior Score" />
                <Line type="monotone" dataKey="attendanceRate" stroke="#43e97b" strokeWidth={2} name="Attendance Rate" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Division Stats */}
        <Grid xs={12} lg={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Division Statistics
          </Typography>
          <Card sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Average Attendance Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#43e97b' }}>
                  95.2%
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label="+1.2%"
                  size="small"
                  color="success"
                  sx={{ ml: 2 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Academic Performance
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#667eea' }}>
                  84.8
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label="+2.1"
                  size="small"
                  color="success"
                  sx={{ ml: 2 }}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Behavior Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#f093fb' }}>
                  86.7
                </Typography>
                <Chip
                  icon={<TrendingUp />}
                  label="+1.5"
                  size="small"
                  color="success"
                  sx={{ ml: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Grade Comparison Chart */}
        <Grid xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Grade-Level Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={gradeComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="performance" fill="#667eea" name="Performance" />
                <Bar dataKey="behavior" fill="#f093fb" name="Behavior" />
                <Bar dataKey="attendance" fill="#43e97b" name="Attendance" />
              </ReBarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Division Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDivision ? 'Edit Division' : 'Add New Division'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Division Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 3 }}
            />
            <FormControl fullWidth>
              <InputLabel>Grades</InputLabel>
              <Select
                multiple
                value={formData.grades}
                onChange={handleGradeChange}
                input={<OutlinedInput label="Grades" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {allGrades.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveDivision}
            variant="contained"
            disabled={!formData.name || formData.grades.length === 0}
          >
            {editingDivision ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

