/**
 * Forced 2FA Enrollment Page
 * Shown when 2FA is enforced and user hasn't enrolled yet
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Stack,
  useTheme,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import LockIcon from "@mui/icons-material/Lock";
import nachlasLogo from "../../assets/nachlasLogo.png";
import api from "../../utils/api";

export default function Enforce2FA() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background: `linear-gradient(135deg, ${theme.palette.warning.light}15 0%, ${theme.palette.error.light}15 100%)`,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 4, sm: 6 },
          width: "100%",
          maxWidth: 580,
          textAlign: "center",
          borderRadius: 3,
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

        {/* Icon */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: theme.palette.warning.light,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 20px ${theme.palette.warning.main}40`,
            }}
          >
            <LockIcon
              sx={{
                fontSize: 50,
                color: theme.palette.warning.main,
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.warning.main,
          }}
        >
          Two-Factor Authentication Required
        </Typography>

        <Alert severity="warning" sx={{ mb: 3, textAlign: "left" }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Your organization requires all users to enable two-factor authentication.
          </Typography>
          <Typography variant="body2">
            You must set up 2FA to continue accessing your account. This adds an extra layer of security to protect your account and the school's data.
          </Typography>
        </Alert>

        <Stack spacing={2} sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<SecurityIcon />}
            onClick={() => navigate("/2fa/setup")}
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
            Set Up Two-Factor Authentication
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            If you need help or cannot access your phone, please contact your administrator.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}


