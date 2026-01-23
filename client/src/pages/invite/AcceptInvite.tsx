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
  useTheme,
} from "@mui/material";

import { useSearchParams, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import api from "../../utils/api";
import nachlasLogo from "../../assets/nachlasLogo.png";

interface InviteDetails {
  email: string;
  roles: { id: string; name: string; displayName: string }[];
}

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const theme = useTheme();
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

      // After success → redirect to success page (no auto-login)
      navigate("/invite/success", { replace: true });
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary?.light || theme.palette.primary.light}15 100%)`,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 520,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <img
            src={nachlasLogo}
            alt="Nachlas Bais Yaakov"
            style={{
              height: "80px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            textAlign: "center",
            color: theme.palette.primary.main,
          }}
        >
          Complete Your Account Setup
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          You've been invited to join the Nachlas Bais Yaakov Portal.
          <br />
          Please complete your account setup below.
        </Typography>

        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2,
            "& .MuiAlert-icon": {
              alignItems: "center",
            },
          }}
          icon={<CheckCircleIcon />}
        >
          <Typography variant="body2">
            <strong>Email:</strong> {invite.email}
          </Typography>
          {invite.roles && invite.roles.length > 0 && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <strong>Role{invite.roles.length > 1 ? "s" : ""}:</strong>{" "}
              {invite.roles.map((r) => r.displayName).join(", ")}
            </Typography>
          )}
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
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Create My Account"
            )}
          </Button>
        </Box>

        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Button
            onClick={() => navigate("/login")}
            size="small"
            sx={{ textTransform: "none" }}
          >
            Already have an account? Sign in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AcceptInvite;

