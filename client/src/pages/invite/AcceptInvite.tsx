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
  const [passwordError, setPasswordError] = useState("");
  const [password2Error, setPassword2Error] = useState("");

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

  // Validate password
  const validatePassword = (pwd: string) => {
    if (!pwd.trim()) {
      return "Password is required.";
    }
    if (pwd.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    return "";
  };

  // Validate password confirmation
  const validatePassword2 = (pwd: string, pwd2: string) => {
    if (!pwd2.trim()) {
      return "Please confirm your password.";
    }
    if (pwd !== pwd2) {
      return "Passwords do not match.";
    }
    return "";
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
    // Re-validate confirmation if it's already filled
    if (password2) {
      setPassword2Error(validatePassword2(value, password2));
    } else {
      setPassword2Error("");
    }
    // Clear general error when user types
    if (error && error.includes("password")) {
      setError("");
    }
  };

  // Handle password confirmation change with validation
  const handlePassword2Change = (value: string) => {
    setPassword2(value);
    setPassword2Error(validatePassword2(password, value));
    // Clear general error when user types
    if (error && error.includes("password")) {
      setError("");
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      name.trim() &&
      password.trim() &&
      password2.trim() &&
      !passwordError &&
      !password2Error &&
      password === password2 &&
      password.length >= 8
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Clear previous errors
    setError("");

    // Validate fields
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    const pwdError = validatePassword(password);
    const pwd2Error = validatePassword2(password, password2);

    setPasswordError(pwdError);
    setPassword2Error(pwd2Error);

    if (pwdError || pwd2Error) {
      if (pwdError) setError(pwdError);
      else if (pwd2Error) setError(pwd2Error);
      return;
    }

    if (!isFormValid()) {
      setError("Please fix the errors above before submitting.");
      return;
    }

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

  if (!invite) {
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

        <Box component="form" onSubmit={handleSubmit}>
          {/* Name */}
          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error && error.includes("Name")) setError("");
            }}
            error={!!error && error.includes("Name")}
            helperText={error && error.includes("Name") ? error : ""}
            required
            sx={{ mb: 2 }}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Create Password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onBlur={() => {
              if (password) {
                setPasswordError(validatePassword(password));
              }
            }}
            error={!!passwordError}
            helperText={passwordError || "Must be at least 8 characters"}
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd(!showPwd)} edge="end">
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
            onChange={(e) => handlePassword2Change(e.target.value)}
            onBlur={() => {
              if (password2) {
                setPassword2Error(validatePassword2(password, password2));
              }
            }}
            error={!!password2Error}
            helperText={password2Error || ""}
            required
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd2(!showPwd2)} edge="end">
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
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !isFormValid()}
            sx={{ py: 1.2, fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={22} /> : "Create My Account"}
          </Button>
        </Box>

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
