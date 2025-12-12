import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import api from "../utils/api"

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AppCheckbox } from "../components/ui/checkbox";

import { Alert, AlertDescription } from "../components/ui/alert";

import nachlasLogo from "../assets/nachlasLogo.png";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  // ------------------------------
  // Handle ?message=session_expired / forbidden
  // ------------------------------
  useEffect(() => {
    const message = params.get("message");

    if (message === "session_expired") {
      setAuthMessage("You were logged out due to inactivity. Please sign in again.");
    }
    if (message === "forbidden") {
      setAuthMessage("You no longer have permission to access that page. Please sign in.");
    }
  }, [params]);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ------------------------------
  // Handle Submit
  // ------------------------------
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    if (res.data.requiresPasswordChange) {
  navigate("/force-password-change");
  return;
}


    if (res.data.mfaRequired) {
      // redirect to MFA page if needed
      navigate("/mfa");
      return;
    }

    // Login success
    await api.get("/auth/me"); // optional sanity check
    navigate("/");
  } catch (err: any) {
    setError(err.response?.data?.message || "Login failed");
  }
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #bbdefb, #90caf9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Back to site */}
      <Box
        sx={{
          position: "absolute",
          top: 24,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Link
          href="https://nachlasby.com"
          underline="none"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            color: "primary.main",
            "&:hover": { color: "primary.dark" },
          }}
        >
          <ArrowBackIcon fontSize="small" />
          <Typography variant="body2">Back to site</Typography>
        </Link>
      </Box>

      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          p: 4,
          transition: "all 700ms ease",
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {/* Logo & Titles */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <img src={nachlasLogo} alt="Nachlas Bais Yaakov Logo" style={{ height: 120 }} />
          </Box>
          <Typography variant="h5" color="primary" sx={{ mb: 0.5 }}>
            Nachlas Bais Yaakov
          </Typography>
          <Typography variant="body2" color="text.secondary">
            School Management Portal
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            213 Newport Ave, Lakewood, NJ 08701
          </Typography>
        </Box>

        {/* AUTH MESSAGES (session expired / forbidden) */}
        {authMessage && (
          <Alert variant="default" sx={{ mb: 2 }}>
            <AlertDescription>{authMessage}</AlertDescription>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2.5 }}>
          {/* Email */}
          <Box>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mt: 0.5 }}
            />
          </Box>

          {/* Password */}
          <Box>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mt: 0.5 }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* Remember / Forgot Password */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <FormControlLabel
              control={
                <AppCheckbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Remember me</Typography>}
            />

           <Link component={RouterLink} to="/forgot-password" variant="body2">
  Forgot password?
</Link>

          </Box>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <Button type="submit" fullWidth sx={{ mt: 1 }}>
            Sign In
          </Button>
        </Box>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Need access? Contact the administration office.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
