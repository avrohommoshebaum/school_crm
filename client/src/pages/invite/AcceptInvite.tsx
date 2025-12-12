// src/pages/invite/AcceptInvite.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { useSearchParams, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import api from "../../utils/api";

interface InviteDetails {
  email: string;
  roles: { id: string; name: string; displayName: string }[];
}

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  // Load invite info
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invite link.");
      setLoading(false);
      return;
    }

    api
      .get(`/invite/${token}`)
      .then((res) => {
        setInvite(res.data);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "This invite link is invalid or expired."
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Name is required.");
    if (!password.trim()) return setError("Password is required.");
    if (password !== password2) return setError("Passwords do not match.");

    try {
      setLoading(true);
      await api.post(`/invite/${token}/complete`, { name, password });

      // After success → auto-redirect to dashboard
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to complete invite.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invite) {
    return (
      <Box sx={{ mt: 10, display: "flex", justifyContent: "center" }}>
        <Paper sx={{ p: 4, maxWidth: 450, width: "100%" }} elevation={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Invite is invalid."}
          </Alert>
          <Button variant="contained" fullWidth onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: { xs: 6, sm: 10 },
        display: "flex",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 500,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 1, textAlign: "center", color: "#1976d2" }}
        >
          Complete Your Account Setup
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3 }}
        >
          You were invited to join Nachlas Bais Yaakov Portal.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          You are signing up as: <strong>{invite.email}</strong>
        </Alert>

        {/* Name */}
        <TextField
          fullWidth
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Create Password"
          type={showPwd ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirm Password */}
        <TextField
          fullWidth
          label="Confirm Password"
          type={showPwd2 ? "text" : "password"}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPwd2(!showPwd2)}>
                  {showPwd2 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          sx={{ py: 1.2, fontWeight: 600 }}
        >
          {loading ? <CircularProgress size={22} /> : "Create My Account"}
        </Button>

        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Button onClick={() => navigate("/login")} size="small">
            Back to Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AcceptInvite;
