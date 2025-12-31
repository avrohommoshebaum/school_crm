import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import api from "../utils/api"

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AppCheckbox } from "../components/ui/checkbox";

import { Alert, AlertDescription } from "../components/ui/alert";

import { useAuth } from "../context/AuthContext";
import nachlasLogo from "../assets/nachlasLogo.png";



export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [loading, setLoading] = useState(false);

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
  setLoading(true);

  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    if (res.data.requiresPasswordChange) {
      setLoading(false);
      navigate("/force-password-change");
      return;
    }

    if (res.data.mfaRequired) {
      // Check if it's SMS/phone 2FA or TOTP MFA
      if (res.data.mfaMethod) {
        // SMS/Phone 2FA - code will be sent automatically
        setLoading(false);
        navigate("/2fa/verify");
        return;
      } else {
        // Legacy TOTP MFA
        setLoading(false);
        navigate("/mfa");
        return;
      }
    }

    // Check if 2FA enrollment is required
    if (res.data.requires2FAEnrollment) {
      setLoading(false);
      navigate("/2fa/enforce");
      return;
    }

    // ✅ Login successful - refresh user and navigate
    await refreshUser();
    setLoading(false);
    navigate("/", { replace: true });
  } catch (err: any) {
    setLoading(false);
    // Check if 2FA enrollment is required (403 error)
    if (err.response?.status === 403 && err.response?.data?.requires2FAEnrollment) {
      navigate("/2fa/enforce");
      return;
    }
    setError(err.response?.data?.message || "Login failed");
  }
};



  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 420 },
          borderRadius: 2,
          p: { xs: 3, sm: 4 },
          transition: "all 300ms ease",
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "translateY(0)" : "translateY(16px)",
        }}
      >
        {/* Logo & Titles */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <img
              src={nachlasLogo}
              alt="Nachlas Bais Yaakov"
              style={{
                width: "auto",
                height: "85px",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              mb: 0.5,
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Nachlas Bais Yaakov
          </Typography>
          <Typography variant="body2" color="text.secondary">
            School Management Portal
          </Typography>
        </Box>

        {/* AUTH MESSAGES (session expired / forbidden) */}
        {authMessage && (
          <Alert variant="default" sx={{ mb: 3 }}>
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
              required
              sx={{ mt: 1 }}
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
              required
              sx={{ mt: 1 }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((prev) => !prev)}
                    size="small"
                    sx={{ mr: 0.5 }}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* Remember / Forgot Password */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: { xs: 1, sm: 0 },
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

            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" sx={{ mt: 1 }}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{ mt: 2, py: 1.5 }}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? "Signing in..." : "Sign In"}
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
