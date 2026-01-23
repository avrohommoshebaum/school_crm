import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import useCurrentUser from "../../hooks/useCurrentUser";
import api from "../../utils/api";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading, reload } = useCurrentUser();
  const [edit, setEdit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    employeeId: "",
    department: "",
    hireDate: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    bio: "",
  });

  // Load user data into form
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        employeeId: user.employeeId || "",
        department: user.department || "",
        hireDate: user.hireDate || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        emergencyContact: user.emergencyContact || "",
        emergencyPhone: user.emergencyPhone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const save = async () => {
    try {
      await api.put("/profile/me/profile", form);
      toast.success("Profile updated!");
      setEdit(false);
      reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating profile");
    }
  };

  if (loading || !user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const renderField = (label: string, value: string, field: string, multiline = false) => {
    if (edit) {
      return (
        <TextField
          fullWidth
          label={label}
          multiline={multiline}
          rows={multiline ? 3 : 1}
          value={value}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      );
    }

    return (
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography sx={{ mb: 1, color: "text.secondary" }}>
          {value || "—"}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 950, mx: "auto", p: 3 }}>
      {/* HEADER */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5">My Profile</Typography>

        {!edit ? (
          <Button variant="contained" onClick={() => setEdit(true)}>
            Edit Profile
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setEdit(false)}>Cancel</Button>
            <Button variant="contained" onClick={save}>
              Save
            </Button>
          </Stack>
        )}
      </Stack>

      {/* PROFILE HEADER */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems="center"
        >
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              fontSize: "2rem",
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h5">{user.name}</Typography>

            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: "center", sm: "flex-start" }}
              sx={{ mt: 1 }}
            >
              {user.roles.map((r) => (
                <Chip
                  key={r._id || r.id || r.displayName}
                  label={r.displayName}
                  sx={{ background: r.color, color: "white" }}
                />
              ))}
            </Stack>

            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              {user.email}
            </Typography>

            {user.phone && (
              <Typography sx={{ color: "text.secondary" }}>
                {user.phone}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* INFO SECTIONS */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        sx={{ width: "100%" }}
      >
        {/* LEFT COLUMN */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Personal Info
          </Typography>

          <Stack spacing={2}>
            {renderField("Name", form.name, "name")}
            {renderField("Phone", form.phone, "phone")}
            {renderField("Bio", form.bio, "bio", true)}
          </Stack>
        </Paper>

        {/* RIGHT COLUMN */}
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Address
          </Typography>

          <Stack spacing={2}>
            {renderField("Street Address", form.address, "address")}
            {renderField("City", form.city, "city")}

            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1 }}>
                {renderField("State", form.state, "state")}
              </Box>
              <Box sx={{ flex: 1 }}>
                {renderField("ZIP", form.zipCode, "zipCode")}
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

