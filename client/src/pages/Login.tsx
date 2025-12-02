import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { Input } from "../components/ui/input"; // TextField wrapper
import { Label } from "../components/ui/label";
import { AppCheckbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";

import nachlasLogo from "../assets/nachlasLogo.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email address.");
      return;
    }

    // TODO: Replace with actual authentication (e.g., Passport.js)
    localStorage.setItem("user", JSON.stringify({ email, rememberMe }));
    navigate("/");
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
      {/* Back to site link */}
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

      {/* Login Card */}
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
        {/* Logo & header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ mb: 2 }}>
            <img
              src={nachlasLogo}
              alt="Nachlas Bais Yaakov Logo"
              style={{ height: 120, margin: "0 auto" }}
            />
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
          </Box>

          {/* Remember me / Forgot password */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <FormControlLabel
              control={
                <AppCheckbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">Remember me</Typography>
              }
            />

            <Link href="#" variant="body2" sx={{ color: "primary.main" }}>
              Forgot password?
            </Link>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            sx={{ mt: 1 }}
          >
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
