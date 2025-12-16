import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Save,
  Users,
  Calendar,
  Bus,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  Tabs,
  Tab,
  TextField,
  Divider,
  Alert,
  Checkbox,
} from "@mui/material";

import SamplePageOverlay from "../components/samplePageOverlay";

/* ---------------- Types ---------------- */

type Student = {
  name: { first: string; last: string };
  hebrewName: { first: string; last: string };
  nickname?: string;
  DOB: string;
  grade: string;
  class: string;
  status: string;
  attendance: string;
  bus: string;
  neighborhood: string;
  homePhone: string;
  parentsMaritalStatus: string;
  mother: { name: string; phone: string; email: string; occupation: string };
  father: { name: string; phone: string; email: string; occupation: string };
  siblings: { firstName: string; lastName: string; age: number }[];
  medical: {
    allergies: string[];
    medications: string[];
    healthConditions: string[];
    doctorName: string;
    doctorPhone: string;
    insuranceCarrier: string;
    policyNumber: string;
    emergencyNotes: string;
  };
  currentMorah: string;
  currentMorahPhone: string;
  tutors: string[];
  applicationFee: { feeAmount: number; paid: boolean };
  notes: { text: string; author: string; createdAt: string }[];
};

/* ---------------- Component ---------------- */

export default function StudentProfile() {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [tab, setTab] = useState(0);

  const student: Student = {
    name: { first: "Sarah", last: "Cohen" },
    hebrewName: { first: "שרה", last: "כהן" },
    nickname: "Sari",
    DOB: "2015-03-15",
    grade: "3rd Grade",
    class: "A",
    status: "enrolled",
    attendance: "98%",
    bus: "Route 5",
    neighborhood: "Westgate",
    homePhone: "(732) 555-1234",
    parentsMaritalStatus: "married",
    mother: {
      name: "Rivka Cohen",
      phone: "(732) 555-5678",
      email: "rivka@email.com",
      occupation: "Teacher",
    },
    father: {
      name: "Moshe Cohen",
      phone: "(732) 555-9012",
      email: "moshe@email.com",
      occupation: "Accountant",
    },
    siblings: [
      { firstName: "Leah", lastName: "Cohen", age: 7 },
      { firstName: "Yakov", lastName: "Cohen", age: 5 },
    ],
    medical: {
      allergies: ["Peanuts", "Dairy"],
      medications: ["EpiPen"],
      healthConditions: ["Asthma"],
      doctorName: "Dr. Levy",
      doctorPhone: "(732) 555-3456",
      insuranceCarrier: "BCBS",
      policyNumber: "BC123456",
      emergencyNotes: "Keep inhaler accessible",
    },
    currentMorah: "Mrs. Schwartz",
    currentMorahPhone: "(732) 555-2468",
    tutors: ["Mrs. Goldberg – Reading"],
    applicationFee: { feeAmount: 175, paid: true },
    notes: [
      { text: "Excellent student", author: "Mrs. Schwartz", createdAt: "2024-11-01" },
    ],
  };

  return (
    <>
      <SamplePageOverlay />

      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2, pb: 8 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button onClick={() => navigate("/students")} variant="outlined">
              <ArrowLeft size={18} />
            </Button>

            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              {student.name.first[0]}
            </Avatar>

            <Box>
              <Typography variant="h6">
                {student.name.first} {student.name.last}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {student.hebrewName.first} {student.hebrewName.last} ({student.nickname})
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Chip label={student.status} color="primary" />
            <Button
              variant={editMode ? "contained" : "outlined"}
              startIcon={editMode ? <Save size={16} /> : <Edit size={16} />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Save" : "Edit"}
            </Button>
          </Stack>
        </Stack>

        {/* Quick Stats */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
          {[
            { icon: <Users />, label: "Grade", value: `${student.grade} - ${student.class}` },
            { icon: <Calendar />, label: "Attendance", value: student.attendance },
            { icon: <Bus />, label: "Bus", value: student.bus },
            { icon: <FileText />, label: "Morah", value: student.currentMorah },
          ].map((item, i) => (
            <Card key={i} sx={{ flex: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  {item.icon}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography>{item.value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Personal" />
          <Tab label="Family" />
          <Tab label="Medical" />
          <Tab label="Academic" />
          <Tab label="Financial" />
          <Tab label="Notes" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {/* PERSONAL */}
        {tab === 0 && (
          <Card>
            <CardHeader title="Personal Information" />
            <CardContent>
              <Stack spacing={2}>
                <TextField label="First Name" value={student.name.first} disabled={!editMode} />
                <TextField label="Last Name" value={student.name.last} disabled={!editMode} />
                <TextField label="Date of Birth" value={student.DOB} disabled={!editMode} />
                <TextField label="Home Phone" value={student.homePhone} disabled={!editMode} />
                <TextField label="Neighborhood" value={student.neighborhood} disabled={!editMode} />
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* MEDICAL */}
        {tab === 2 && (
          <Card>
            <CardHeader title="Medical Information" />
            <CardContent>
              {student.medical.allergies.length > 0 && (
                <Alert severity="error" icon={<AlertCircle size={18} />}>
                  Allergies: {student.medical.allergies.join(", ")}
                </Alert>
              )}
              <Stack spacing={2} mt={2}>
                <TextField
                  label="Allergies"
                  value={student.medical.allergies.join(", ")}
                  disabled={!editMode}
                />
                <TextField
                  label="Medications"
                  value={student.medical.medications.join(", ")}
                  disabled={!editMode}
                />
                <TextField
                  label="Emergency Notes"
                  value={student.medical.emergencyNotes}
                  multiline
                  rows={3}
                  disabled={!editMode}
                />
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* NOTES */}
        {tab === 5 && (
          <Card>
            <CardHeader title="Student Notes" />
            <CardContent>
              <Stack spacing={2}>
                {student.notes.map((n, i) => (
                  <Box key={i} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                    <Typography>{n.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.author} • {n.createdAt}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
}
