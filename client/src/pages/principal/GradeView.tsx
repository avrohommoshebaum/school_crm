/**
 * Grade View - Shows all classes in a grade
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ClassIcon from "@mui/icons-material/Class";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../utils/api";

type Class = {
  id: string;
  name: string;
  roomNumber?: string;
  studentCount: number;
  teachers: Array<{ id: string; firstName: string; lastName: string; role: string }>;
};

type GradeOverview = {
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

export default function GradeView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { gradeId } = useParams<{ gradeId: string }>();
  const navigate = useNavigate();

  const [gradeName, setGradeName] = useState<string>("");
  const [classes, setClasses] = useState<Class[]>([]);
  const [overviews, setOverviews] = useState<GradeOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [overviewDialogOpen, setOverviewDialogOpen] = useState(false);
  const [editingOverview, setEditingOverview] = useState<GradeOverview | null>(null);

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
      if (!gradeId || hasLoadedRef.current || isFetchingRef.current) return;
      hasLoadedRef.current = true;
      isFetchingRef.current = true;

      try {
        setLoading(true);
        
        // Load classes
        const classesRes = await api.get(`/principal/grades/${gradeId}/classes`);
        setClasses(classesRes.data.classes || []);
        
        // Get grade name - try to get from API or use first class's grade
        try {
          const gradeRes = await api.get(`/grades/${gradeId}`);
          if (gradeRes.data.grade) {
            setGradeName(gradeRes.data.grade.name);
          }
        } catch {
          // If that fails, try to get from first class
          if (classesRes.data.classes && classesRes.data.classes.length > 0) {
            // Grade name might be in class data
          }
        }

        // Load overviews
        const overviewsRes = await api.get(`/principal/grades/${gradeId}/overviews`);
        setOverviews(overviewsRes.data.overviews || []);

        setError(null);
      } catch (err: any) {
        console.error("Error loading grade data:", err);
        setError(err?.response?.data?.message || "Failed to load grade data");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadData();
  }, [gradeId]);

  const handleClassClick = (classId: string) => {
    navigate(`/principal/classes/${classId}`);
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

  const handleEditOverview = (overview: GradeOverview) => {
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
    if (!gradeId) return;

    try {
      if (editingOverview) {
        await api.put(`/principal/overviews/grade/${editingOverview.id}`, overviewForm);
      } else {
        await api.post(`/principal/grades/${gradeId}/overviews`, overviewForm);
      }

      // Reload overviews
      const res = await api.get(`/principal/grades/${gradeId}/overviews`);
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
              {gradeName || "Grade"} - Classes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View classes and add grade-level overviews
            </Typography>
          </Box>
        </Stack>

        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Classes" />
          <Tab label="Grade Overviews" />
        </Tabs>

        {tab === 0 && (
          <Grid container spacing={2}>
            {classes.map((cls) => (
              <Grid xs={12} sm={6} md={4} key={cls.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleClassClick(cls.id)}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ClassIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {cls.name}
                        </Typography>
                      </Stack>
                      {cls.roomNumber && (
                        <Typography variant="body2" color="text.secondary">
                          Room: {cls.roomNumber}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={2}>
                        <Chip
                          icon={<PeopleIcon />}
                          label={`${cls.studentCount} students`}
                          size="small"
                        />
                      </Stack>
                      {cls.teachers.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Teacher: {cls.teachers.map(t => `${t.firstName} ${t.lastName}`).join(", ")}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClassClick(cls.id);
                        }}
                      >
                        View Students
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6">Grade Overviews</Typography>
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
          {editingOverview ? "Edit Grade Overview" : "Add Grade Overview"}
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


