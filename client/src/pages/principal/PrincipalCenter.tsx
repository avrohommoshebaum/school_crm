/**
 * Principal Center - Main Page
 * Shows assigned grades and allows navigation to classes and students
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/Class";
import api from "../../utils/api";

type Grade = {
  id: string;
  name: string;
  level: number;
  description?: string;
};

export default function PrincipalCenter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const loadGrades = async () => {
      if (hasLoadedRef.current || isFetchingRef.current) return;
      hasLoadedRef.current = true;
      isFetchingRef.current = true;

      try {
        setLoading(true);
        const { data } = await api.get("/principal/grades");
        setGrades(data.grades || []);
        setError(null);
      } catch (err: any) {
        console.error("Error loading grades:", err);
        setError(err?.response?.data?.message || "Failed to load grades");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadGrades();
  }, []);

  const handleGradeClick = (gradeId: string) => {
    navigate(`/principal/grades/${gradeId}`);
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
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Principal Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a grade to view classes, students, and add overviews
          </Typography>
        </Box>

        {grades.length === 0 ? (
          <Alert severity="info">
            No grades assigned. Please contact an administrator to assign grades to your principal account.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {grades.map((grade) => (
              <Grid item xs={12} sm={6} md={4} key={grade.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleGradeClick(grade.id)}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SchoolIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {grade.name}
                        </Typography>
                      </Stack>
                      {grade.description && (
                        <Typography variant="body2" color="text.secondary">
                          {grade.description}
                        </Typography>
                      )}
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ClassIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGradeClick(grade.id);
                        }}
                      >
                        View Classes
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
}

