/**
 * Student View - Shows student details, history, and overviews
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Grid,
  Divider,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import InsightsIcon from "@mui/icons-material/Insights";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../../utils/api";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  gradeId?: string;
  dateOfBirth?: string;
  enrollmentDate?: string;
  enrollmentStatus?: string;
};

type StudentOverview = {
  id: string;
  overviewDate: string;
  hebrewNotes?: string;
  englishNotes?: string;
  behaviorNotes?: string;
  academicNotes?: string;
  socialNotes?: string;
  concerns?: string;
  positives?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
};

export default function StudentView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [overviews, setOverviews] = useState<StudentOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [overviewDialogOpen, setOverviewDialogOpen] = useState(false);
  const [editingOverview, setEditingOverview] = useState<StudentOverview | null>(null);
  const [geminiInsights, setGeminiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [overviewForm, setOverviewForm] = useState({
    overviewDate: new Date().toISOString().split("T")[0],
    hebrewNotes: "",
    englishNotes: "",
    behaviorNotes: "",
    academicNotes: "",
    socialNotes: "",
    concerns: "",
    positives: "",
    followUpRequired: false,
    followUpNotes: "",
  });

  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (!studentId || hasLoadedRef.current || isFetchingRef.current) return;
      hasLoadedRef.current = true;
      isFetchingRef.current = true;

      try {
        setLoading(true);
        
        // Load student
        const studentRes = await api.get(`/principal/students/${studentId}`);
        setStudent(studentRes.data.student);

        // Load overviews
        const overviewsRes = await api.get(`/principal/students/${studentId}/overviews`);
        setOverviews(overviewsRes.data.overviews || []);

        setError(null);
      } catch (err: any) {
        console.error("Error loading student data:", err);
        setError(err?.response?.data?.message || "Failed to load student data");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadData();
  }, [studentId]);

  // Generate chart data from overviews
  const chartData = overviews
    .map((overview) => {
      // Simple scoring: count positives vs concerns
      const positives = (overview.positives || "").split(/[.!?]/).filter(s => s.trim()).length;
      const concerns = (overview.concerns || "").split(/[.!?]/).filter(s => s.trim()).length;
      const score = positives - concerns; // Simple metric
      return {
        date: new Date(overview.overviewDate).toLocaleDateString(),
        score,
        positives,
        concerns,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddOverview = () => {
    setEditingOverview(null);
    setOverviewForm({
      overviewDate: new Date().toISOString().split("T")[0],
      hebrewNotes: "",
      englishNotes: "",
      behaviorNotes: "",
      academicNotes: "",
      socialNotes: "",
      concerns: "",
      positives: "",
      followUpRequired: false,
      followUpNotes: "",
    });
    setOverviewDialogOpen(true);
  };

  const handleEditOverview = (overview: StudentOverview) => {
    setEditingOverview(overview);
    setOverviewForm({
      overviewDate: overview.overviewDate.split("T")[0],
      hebrewNotes: overview.hebrewNotes || "",
      englishNotes: overview.englishNotes || "",
      behaviorNotes: overview.behaviorNotes || "",
      academicNotes: overview.academicNotes || "",
      socialNotes: overview.socialNotes || "",
      concerns: overview.concerns || "",
      positives: overview.positives || "",
      followUpRequired: overview.followUpRequired || false,
      followUpNotes: overview.followUpNotes || "",
    });
    setOverviewDialogOpen(true);
  };

  const handleSaveOverview = async () => {
    if (!studentId) return;

    try {
      if (editingOverview) {
        await api.put(`/principal/overviews/student/${editingOverview.id}`, overviewForm);
      } else {
        await api.post(`/principal/students/${studentId}/overviews`, overviewForm);
      }

      // Reload overviews
      const res = await api.get(`/principal/students/${studentId}/overviews`);
      setOverviews(res.data.overviews || []);
      setOverviewDialogOpen(false);
    } catch (err: any) {
      console.error("Error saving overview:", err);
      alert(err?.response?.data?.message || "Failed to save overview");
    }
  };

  const handleGenerateInsights = async () => {
    if (!studentId || overviews.length === 0) {
      alert("Need at least one overview to generate insights");
      return;
    }

    try {
      setLoadingInsights(true);
      // TODO: Integrate with Gemini API
      // For now, show a placeholder
      setGeminiInsights("Gemini integration coming soon. This will analyze student trends and provide insights.");
    } catch (err: any) {
      console.error("Error generating insights:", err);
      alert("Failed to generate insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !student) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Student not found"}</Alert>
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
              {student.firstName} {student.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Student ID: {student.studentId || "—"}
            </Typography>
          </Box>
        </Stack>

        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="History & Trends" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Insights" icon={<InsightsIcon />} iconPosition="start" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">Student Overviews</Typography>
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
                          <Stack direction="row" spacing={1}>
                            {overview.followUpRequired && (
                              <Chip label="Follow-up Required" color="warning" size="small" />
                            )}
                            <IconButton size="small" onClick={() => handleEditOverview(overview)}>
                              <EditIcon />
                            </IconButton>
                          </Stack>
                        </Stack>
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
                        {overview.behaviorNotes && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Behavior:</Typography>
                            <Typography variant="body2">{overview.behaviorNotes}</Typography>
                          </Box>
                        )}
                        {overview.academicNotes && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Academic:</Typography>
                            <Typography variant="body2">{overview.academicNotes}</Typography>
                          </Box>
                        )}
                        {overview.socialNotes && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Social:</Typography>
                            <Typography variant="body2">{overview.socialNotes}</Typography>
                          </Box>
                        )}
                        {overview.concerns && (
                          <Box>
                            <Typography variant="caption" color="error">Concerns:</Typography>
                            <Typography variant="body2" color="error.main">{overview.concerns}</Typography>
                          </Box>
                        )}
                        {overview.positives && (
                          <Box>
                            <Typography variant="caption" color="success.main">Positives:</Typography>
                            <Typography variant="body2" color="success.main">{overview.positives}</Typography>
                          </Box>
                        )}
                        {overview.followUpNotes && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Follow-up Notes:</Typography>
                            <Typography variant="body2">{overview.followUpNotes}</Typography>
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

        {tab === 1 && (
          <Stack spacing={3}>
            <Typography variant="h6">Progress Over Time</Typography>
            {chartData.length > 0 ? (
              <Card>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke={theme.palette.primary.main} name="Overall Score" />
                      <Line type="monotone" dataKey="positives" stroke={theme.palette.success.main} name="Positives" />
                      <Line type="monotone" dataKey="concerns" stroke={theme.palette.error.main} name="Concerns" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">No data available yet. Add overviews to see trends.</Alert>
            )}

            <Divider />

            <Typography variant="h6">Overview History</Typography>
            <Stack spacing={1}>
              {overviews.map((overview) => (
                <Card key={overview.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        {new Date(overview.overviewDate).toLocaleDateString()}
                      </Typography>
                      {overview.followUpRequired && (
                        <Chip label="Follow-up" color="warning" size="small" />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<InsightsIcon />}
              onClick={handleGenerateInsights}
              disabled={loadingInsights || overviews.length === 0}
            >
              {loadingInsights ? "Generating..." : "Generate AI Insights"}
            </Button>

            {geminiInsights ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>AI Insights</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {geminiInsights}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">
                Click "Generate AI Insights" to analyze student trends and get recommendations.
              </Alert>
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
          {editingOverview ? "Edit Student Overview" : "Add Student Overview"}
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
              label="Behavior Notes"
              multiline
              rows={3}
              value={overviewForm.behaviorNotes}
              onChange={(e) => setOverviewForm({ ...overviewForm, behaviorNotes: e.target.value })}
              fullWidth
            />
            <TextField
              label="Academic Notes"
              multiline
              rows={3}
              value={overviewForm.academicNotes}
              onChange={(e) => setOverviewForm({ ...overviewForm, academicNotes: e.target.value })}
              fullWidth
            />
            <TextField
              label="Social Notes"
              multiline
              rows={3}
              value={overviewForm.socialNotes}
              onChange={(e) => setOverviewForm({ ...overviewForm, socialNotes: e.target.value })}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={overviewForm.followUpRequired}
                  onChange={(e) => setOverviewForm({ ...overviewForm, followUpRequired: e.target.checked })}
                />
              }
              label="Follow-up Required"
            />
            {overviewForm.followUpRequired && (
              <TextField
                label="Follow-up Notes"
                multiline
                rows={3}
                value={overviewForm.followUpNotes}
                onChange={(e) => setOverviewForm({ ...overviewForm, followUpNotes: e.target.value })}
                fullWidth
              />
            )}
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

