import { useState } from "react";
import { Search, Plus, Mail, Phone, Users, BookOpen } from "lucide-react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  MenuItem,
  Divider,
} from "@mui/material";

import SamplePageOverlay from "../components/samplePageOverlay";

/* ---------------- Types ---------------- */

type Teacher = {
  id: number;
  name: string;
  hebrewName: string;
  email: string;
  phone: string;
  grade: string;
  class: string;
  subject: string;
  students: number;
  experience: string;
  status: string;
};

/* ---------------- Component ---------------- */

export default function Teachers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const teachers: Teacher[] = [
    {
      id: 1,
      name: "Mrs. Schwartz",
      hebrewName: "מרת שוורץ",
      email: "rschwartz@nachlasby.com",
      phone: "(732) 555-2468",
      grade: "3rd Grade",
      class: "A",
      subject: "General Studies",
      students: 24,
      experience: "12 years",
      status: "active",
    },
    {
      id: 2,
      name: "Mrs. Goldberg",
      hebrewName: "מרת גולדברג",
      email: "sgoldberg@nachlasby.com",
      phone: "(732) 555-3579",
      grade: "4th Grade",
      class: "B",
      subject: "Limudei Kodesh",
      students: 22,
      experience: "8 years",
      status: "active",
    },
  ];

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SamplePageOverlay />

      <Box sx={{ maxWidth: 1300, mx: "auto", p: 2, pb: 8 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Teachers & Staff
            </Typography>
            <Typography color="text.secondary">
              Manage teaching staff and assignments
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setOpen(true)}
          >
            Add Teacher
          </Button>
        </Stack>

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Search size={16} />
              <TextField
                fullWidth
                placeholder="Search teachers by name, grade, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Stats */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
          {[
            { label: "Total Teachers", value: 45, icon: <Users /> },
            { label: "Classes", value: 28, icon: <BookOpen /> },
            { label: "Avg Students/Class", value: "23.5", icon: <Users /> },
            { label: "Substitute Needs", value: 2, icon: <Users /> },
          ].map((stat, idx) => (
            <Card key={idx} sx={{ flex: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h6">{stat.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    {stat.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Teachers List */}
        <Stack spacing={3}>
          {filteredTeachers.map((t) => (
            <Card key={t.id}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    {t.name.split(" ")[1][0]}
                  </Avatar>
                }
                title={t.name}
                subheader={t.hebrewName}
                action={<Chip label={t.status} color="primary" />}
              />

              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="caption">Grade & Class</Typography>
                      <Typography>
                        {t.grade} – {t.class}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Subject</Typography>
                      <Typography>{t.subject}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Students</Typography>
                      <Typography>{t.students}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption">Experience</Typography>
                      <Typography>{t.experience}</Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Mail size={14} />}
                    >
                      Email
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<Phone size={14} />}
                    >
                      Call
                    </Button>
                    <Button fullWidth variant="outlined" size="small">
                      View Details
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Add Teacher Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Teacher</DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <TextField label="English Name" fullWidth />
                <TextField label="Hebrew Name" fullWidth />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField label="Email" fullWidth />
                <TextField label="Phone" fullWidth />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField label="Grade" select fullWidth>
                  {["1st", "2nd", "3rd", "4th", "5th", "6th"].map((g) => (
                    <MenuItem key={g} value={g}>
                      {g} Grade
                    </MenuItem>
                  ))}
                </TextField>

                <TextField label="Subject" select fullWidth>
                  <MenuItem value="general">General Studies</MenuItem>
                  <MenuItem value="kodesh">Limudei Kodesh</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained">Add Teacher</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}
