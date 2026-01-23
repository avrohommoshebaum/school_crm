/**
 * Class View - Shows all students in a class and class overviews
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../utils/api";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
};

type ClassOverview = {
  id: string;
  overviewDate: string;
  hebrewNotes?: string;
  englishNotes?: string;
  overallSummary?: string;
  behaviorTrends?: string;
  academicTrends?: string;
  concerns?: string;
  positives?: string;
};

export default function ClassView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [className, setClassName] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [overviews, setOverviews] = useState<ClassOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [overviewDialogOpen, setOverviewDialogOpen] = useState(false);
  const [editingOverview, setEditingOverview] = useState<ClassOverview | null>(null);

  const [overviewForm, setOverviewForm] = useState({
    overviewDate: new Date().toISOString().split("T")[0],
    hebrewNotes: "",
    englishNotes: "",
    overallSummary: "",
    behaviorTrends: "",
    academicTrends: "",
    concerns: "",
    positives: "",
  });

  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (!classId || hasLoadedRef.current || isFetchingRef.current) return;
      hasLoadedRef.current = true;
      isFetchingRef.current = true;

      try {
        setLoading(true);
        
        // Load class and students
        const classRes = await api.get(`/principal/classes/${classId}/students`);
        setStudents(classRes.data.students || []);
        setClassName(classRes.data.class?.name || "");

        // Load overviews
        const overviewsRes = await api.get(`/principal/classes/${classId}/overviews`);
        setOverviews(overviewsRes.data.overviews || []);

        setError(null);
      } catch (err: any) {
        console.error("Error loading class data:", err);
        setError(err?.response?.data?.message || "Failed to load class data");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadData();
  }, [classId]);

  const handleStudentClick = (studentId: string) => {
    navigate(`/principal/students/${studentId}`);
  };

  const handleAddOverview = () => {
    setEditingOverview(null);
    setOverviewForm({
      overviewDate: new Date().toISOString().split("T")[0],
      hebrewNotes: "",
      englishNotes: "",
      overallSummary: "",
      behaviorTrends: "",
      academicTrends: "",
      concerns: "",
      positives: "",
    });
    setOverviewDialogOpen(true);
  };

  const handleEditOverview = (overview: ClassOverview) => {
    setEditingOverview(overview);
    setOverviewForm({
      overviewDate: overview.overviewDate.split("T")[0],
      hebrewNotes: overview.hebrewNotes || "",
      englishNotes: overview.englishNotes || "",
      overallSummary: overview.overallSummary || "",
      behaviorTrends: overview.behaviorTrends || "",
      academicTrends: overview.academicTrends || "",
      concerns: overview.concerns || "",
      positives: overview.positives || "",
    });
    setOverviewDialogOpen(true);
  };

  const handleSaveOverview = async () => {
    if (!classId) return;

    try {
      if (editingOverview) {
        await api.put(`/principal/overviews/class/${editingOverview.id}`, overviewForm);
      } else {
        await api.post(`/principal/classes/${classId}/overviews`, overviewForm);
      }

      // Reload overviews
      const res = await api.get(`/principal/classes/${classId}/overviews`);
      setOverviews(res.data.overviews || []);
      setOverviewDialogOpen(false);
    } catch (err: any) {
      console.error("Error saving overview:", err);
      alert(err?.response?.data?.message || "Failed to save overview");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/principal")} sx={{ mt: 2 }}>
          Back to Principal Center
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => navigate("/principal")}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {className} - Students
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View students and add class overviews
            </Typography>
          </Box>
        </Stack>

        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label={`Students (${students.length})`} />
          <Tab label="Class Overviews" />
        </Tabs>

        {tab === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Student ID</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow
                    key={student.id}
                    sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => handleStudentClick(student.id)}
                  >
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.studentId || "—"}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStudentClick(student.id);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">Class Overviews</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddOverview}
              >
                Add Overview
              </Button>
            </Box>

            {overviews.length === 0 ? (
              <Alert severity="info">No overviews yet. Click "Add Overview" to create one.</Alert>
            ) : (
              <Stack spacing={2}>
                {overviews.map((overview) => (
                  <Card key={overview.id} variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {new Date(overview.overviewDate).toLocaleDateString()}
                          </Typography>
                          <IconButton size="small" onClick={() => handleEditOverview(overview)}>
                            <EditIcon />
                          </IconButton>
                        </Stack>
                        {overview.overallSummary && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Overall:</Typography>
                            <Typography variant="body2">{overview.overallSummary}</Typography>
                          </Box>
                        )}
                        {overview.hebrewNotes && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Hebrew Notes:</Typography>
                            <Typography variant="body2">{overview.hebrewNotes}</Typography>
                          </Box>
                        )}
                        {overview.englishNotes && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">English Notes:</Typography>
                            <Typography variant="body2">{overview.englishNotes}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>

      {/* Overview Dialog */}
      <Dialog
        open={overviewDialogOpen}
        onClose={() => setOverviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingOverview ? "Edit Class Overview" : "Add Class Overview"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Date"
              type="date"
              value={overviewForm.overviewDate}
              onChange={(e) => setOverviewForm({ ...overviewForm, overviewDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Overall Summary"
              multiline
              rows={3}
              value={overviewForm.overallSummary}
              onChange={(e) => setOverviewForm({ ...overviewForm, overallSummary: e.target.value })}
              fullWidth
            />
            <TextField
              label="Hebrew Notes"
              multiline
              rows={4}
              value={overviewForm.hebrewNotes}
              onChange={(e) => setOverviewForm({ ...overviewForm, hebrewNotes: e.target.value })}
              fullWidth
            />
            <TextField
              label="English Notes"
              multiline
              rows={4}
              value={overviewForm.englishNotes}
              onChange={(e) => setOverviewForm({ ...overviewForm, englishNotes: e.target.value })}
              fullWidth
            />
            <TextField
              label="Behavior Trends"
              multiline
              rows={3}
              value={overviewForm.behaviorTrends}
              onChange={(e) => setOverviewForm({ ...overviewForm, behaviorTrends: e.target.value })}
              fullWidth
            />
            <TextField
              label="Academic Trends"
              multiline
              rows={3}
              value={overviewForm.academicTrends}
              onChange={(e) => setOverviewForm({ ...overviewForm, academicTrends: e.target.value })}
              fullWidth
            />
            <TextField
              label="Concerns"
              multiline
              rows={3}
              value={overviewForm.concerns}
              onChange={(e) => setOverviewForm({ ...overviewForm, concerns: e.target.value })}
              fullWidth
            />
            <TextField
              label="Positives"
              multiline
              rows={3}
              value={overviewForm.positives}
              onChange={(e) => setOverviewForm({ ...overviewForm, positives: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverviewDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveOverview}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


