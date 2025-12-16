import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Typography,
  Stack,
  Avatar,
} from "@mui/material";
import SamplePageOverlay from "../components/samplePageOverlay";

type Student = {
  id: number;
  name: string;
  grade: string;
  class: string;
  status: "enrolled" | "inactive";
  attendance: string;
};

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");

  const students: Student[] = [
    { id: 1, name: "Sarah Cohen", grade: "3rd Grade", class: "A", status: "enrolled", attendance: "98%" },
    { id: 2, name: "Rivka Goldstein", grade: "3rd Grade", class: "A", status: "enrolled", attendance: "95%" },
    { id: 3, name: "Leah Schwartz", grade: "4th Grade", class: "B", status: "enrolled", attendance: "97%" },
    { id: 4, name: "Chaya Friedman", grade: "5th Grade", class: "A", status: "enrolled", attendance: "99%" },
    { id: 5, name: "Miriam Levy", grade: "2nd Grade", class: "C", status: "enrolled", attendance: "96%" },
  ];

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SamplePageOverlay />

      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Students
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage student information and records
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            Add Student
          </Button>
        </Stack>

        {/* Search + Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Box sx={{ position: "relative", flex: 1 }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <TextField
                  fullWidth
                  placeholder="Search students by name, ID, or grade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiInputBase-input": { pl: 4 },
                  }}
                />
              </Box>

              <Button
                variant="outlined"
                startIcon={<Filter size={16} />}
              >
                Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Students List */}
        <Stack spacing={2}>
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              component={RouterLink}
              to={`/students/${student.id}`}
              sx={{
                textDecoration: "none",
                color: "inherit",
                "&:hover": { boxShadow: 4 },
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={2}
                >
                  {/* Left */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "primary.main",
                        fontWeight: 600,
                      }}
                    >
                      {student.name.charAt(0)}
                    </Avatar>

                    <Box>
                      <Typography fontWeight={500}>
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.grade} • Class {student.class} • Attendance:{" "}
                        {student.attendance}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Right */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={student.status}
                      color="primary"
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </>
  );
}
