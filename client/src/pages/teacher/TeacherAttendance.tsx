import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  TextField,
  Alert,
  CircularProgress,
  Typography,
  ButtonGroup,
  Checkbox,
  Snackbar,
  Divider,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";

import SamplePageOverlay from "../../components/samplePageOverlay";

/* ---------------- Mock Teacher ---------------- */

const currentTeacher = {
  id: "t2",
  name: "Mrs. Rachel Cohen",
};

/* ---------------- Mock Classes ---------------- */

const mockClasses = [
  {
    id: "2",
    className: "1st Grade A",
    students: [
      { id: "s1", name: "Sarah Goldstein", hebrewName: "שרה גולדשטיין" },
      { id: "s2", name: "Rivka Schwartz", hebrewName: "רבקה שווארץ" },
      { id: "s3", name: "Chaya Klein", hebrewName: "חיה קליין" },
      { id: "s4", name: "Leah Cohen", hebrewName: "לאה כהן" },
      { id: "s5", name: "Devorah Levy", hebrewName: "דבורה לוי" },
      { id: "s6", name: "Miriam Stein", hebrewName: "מרים שטיין" },
      { id: "s7", name: "Rachel Friedman", hebrewName: "רחל פרידמן" },
      { id: "s8", name: "Esther Weiss", hebrewName: "אסתר וייס" },
      { id: "s9", name: "Malka Rosenberg", hebrewName: "מלכה רוזנברג" },
      { id: "s10", name: "Bracha Katz", hebrewName: "ברכה כץ" },
    ],
  },
];

type AttendanceStatus = "present" | "absent" | "late" | "excused";

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  notes: string;
}

/* ---------------- Component ---------------- */

export default function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [classes] = useState(mockClasses);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (classes.length && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (!selectedClass || !selectedDate) return;

    setLoading(true);
    setTimeout(() => {
      const cls = classes.find((c) => c.id === selectedClass);
      if (cls) {
        const init: Record<string, AttendanceRecord> = {};
        cls.students.forEach((s) => {
          init[s.id] = {
            studentId: s.id,
            status: "present",
            notes: "",
          };
        });
        setAttendance(init);
      }
      setLoading(false);
    }, 300);
  }, [selectedClass, selectedDate, classes]);

  /* ---------------- Handlers ---------------- */

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: { ...prev[id], status },
    }));
    setSaved(false);
  };

  const handleNotesChange = (id: string, notes: string) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: { ...prev[id], notes },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      console.log("Saving attendance", attendance);
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudents((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const handleSelectAll = () => {
    const cls = classes.find((c) => c.id === selectedClass);
    if (cls) setSelectedStudents(new Set(cls.students.map((s) => s.id)));
  };

  const handleDeselectAll = () => setSelectedStudents(new Set());

  const handleBulkStatusChange = (status: AttendanceStatus) => {
    const updated = { ...attendance };
    selectedStudents.forEach((id) => {
      updated[id] = { ...updated[id], status };
    });
    setAttendance(updated);
    setSelectedStudents(new Set());
    setSaved(false);
  };

  const handleMarkAllPresent = () => {
    const updated = { ...attendance };
    Object.keys(updated).forEach((id) => (updated[id].status = "present"));
    setAttendance(updated);
    setSaved(false);
  };

  const currentClass = classes.find((c) => c.id === selectedClass);

  const presentCount = Object.values(attendance).filter(
    (a) => a.status === "present"
  ).length;
  const lateCount = Object.values(attendance).filter(
    (a) => a.status === "late"
  ).length;
  const absentCount = Object.values(attendance).filter(
    (a) => a.status === "absent"
  ).length;

  /* ---------------- UI ---------------- */

  return (
   <>
    <SamplePageOverlay/>
    <Box>
      
      {/* Snackbar */}
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Attendance saved successfully!
        </Alert>
      </Snackbar>

      {/* Header */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box p={3}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6">Take Attendance</Typography>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              Save Attendance
            </Button>
          </Stack>

          {/* Controls */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass}
                label="Select Class"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {currentClass && (
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${presentCount} Present`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${lateCount} Late`}
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<CancelIcon />}
                  label={`${absentCount} Absent`}
                  color="error"
                  variant="outlined"
                />
              </Stack>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Quick Actions */}
        <Box px={3} py={2} bgcolor="#fafafa">
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={handleMarkAllPresent}
            >
              Mark All Present
            </Button>

            {selectedStudents.size > 0 && (
              <>
                <Chip
                  label={`${selectedStudents.size} selected`}
                  onDelete={handleDeselectAll}
                />
                <ButtonGroup size="small">
                  <Button onClick={() => handleBulkStatusChange("present")}>
                    Present
                  </Button>
                  <Button onClick={() => handleBulkStatusChange("late")}>
                    Late
                  </Button>
                  <Button onClick={() => handleBulkStatusChange("absent")}>
                    Absent
                  </Button>
                </ButtonGroup>
              </>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <Box py={8} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : currentClass ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedStudents.size === currentClass.students.length
                    }
                    indeterminate={
                      selectedStudents.size > 0 &&
                      selectedStudents.size <
                        currentClass.students.length
                    }
                    onChange={(e) =>
                      e.target.checked
                        ? handleSelectAll()
                        : handleDeselectAll()
                    }
                    sx={{ color: "white" }}
                  />
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Student
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Hebrew Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Notes
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentClass.students.map((s, i) => {
                const status = attendance[s.id]?.status;
                const selected = selectedStudents.has(s.id);

                return (
                  <TableRow
                    key={s.id}
                    hover
                    selected={selected}
                    sx={{
                      bgcolor: i % 2 === 0 ? "white" : "#fafafa",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected}
                        onChange={() => handleToggleStudent(s.id)}
                      />
                    </TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell color="text.secondary">
                      {s.hebrewName}
                    </TableCell>
                    <TableCell align="center">
                      <ButtonGroup size="small">
                        <Button
                          variant={status === "present" ? "contained" : "outlined"}
                          color="success"
                          onClick={() =>
                            handleStatusChange(s.id, "present")
                          }
                        >
                          Present
                        </Button>
                        <Button
                          variant={status === "late" ? "contained" : "outlined"}
                          color="warning"
                          onClick={() =>
                            handleStatusChange(s.id, "late")
                          }
                        >
                          Late
                        </Button>
                        <Button
                          variant={status === "absent" ? "contained" : "outlined"}
                          color="error"
                          onClick={() =>
                            handleStatusChange(s.id, "absent")
                          }
                        >
                          Absent
                        </Button>
                      </ButtonGroup>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add notes..."
                        value={attendance[s.id]?.notes || ""}
                        onChange={(e) =>
                          handleNotesChange(s.id, e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography color="text.secondary">
            Select a class to view attendance
          </Typography>
        </Paper>
      )}
    </Box>
    </>
  );
}
