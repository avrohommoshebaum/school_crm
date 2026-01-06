/**
 * 2FA Verification Page
 * Shown during login when user has 2FA enabled
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import SmsIcon from "@mui/icons-material/Sms";
import api from "../../utils/api";
import nachlasLogo from "../../assets/nachlasLogo.png";

export default function Verify2FA() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState("");
  const [mfaMethod, setMfaMethod] = useState<"SMS" | "phone_call" | null>(null);
  const [mfaPhone, setMfaPhone] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Load 2FA info and send code on mount
  useEffect(() => {
    const load2FAInfo = async () => {
      try {
        // Try to get 2FA method from session or send code
        await handleResendCode();
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load 2FA information");
      }
    };

    load2FAInfo();
  }, []);

  const handleResendCode = async () => {
    setSendingCode(true);
    setError("");

    try {
      const response = await api.post("/auth/2fa/send-code");
      setMfaMethod(response.data.method || "SMS");
      setMfaPhone(response.data.phone || null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (useBackupCode) {
      if (!verificationCode.trim() || verificationCode.length !== 8) {
        setError("Please enter the 8-digit backup code");
        return;
      }
    } else {
      if (!verificationCode.trim() || verificationCode.length !== 6) {
        setError("Please enter the 6-digit verification code");
        return;
      }
    }

    setError("");
    setLoading(true);

    try {
      let res;
      if (useBackupCode) {
        res = await api.post("/auth/backup-codes/verify", {
          code: verificationCode,
        });
      } else {
        res = await api.post("/auth/2fa/verify", {
          code: verificationCode,
        });
      }

      // ✅ Login successful - store sessionTimeout and require2FA from response
      if (res.data.sessionTimeout || res.data.require2FA !== undefined) {
        localStorage.setItem("loginData", JSON.stringify({
          sessionTimeout: res.data.sessionTimeout,
          require2FA: res.data.require2FA,
        }));
      }
      
      // Check if 2FA enrollment is required after backup code login
      if (res.data.requires2FAEnrollment) {
        navigate("/2fa/enforce", { replace: true });
        return;
      }
      
      // AuthContext will refresh user automatically on mount
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || (useBackupCode ? "Invalid backup code" : "Invalid verification code"));
      setVerificationCode("");
    } finally {
      setLoading(false);
    }
  };

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
          p: { xs: 4, sm: 5 },
          width: "100%",
          maxWidth: 480,
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

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            textAlign: "center",
            color: theme.palette.primary.main,
          }}
        >
          Two-Factor Authentication
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          Enter the verification code sent to your phone
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {mfaMethod && (
          <Alert
            severity="info"
            icon={mfaMethod === "phone_call" ? <PhoneIcon /> : <SmsIcon />}
            sx={{ mb: 3 }}
          >
            Verification code sent via {mfaMethod === "phone_call" ? "phone call" : "SMS"}
            {mfaPhone && ` to ${mfaPhone}`}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify}>
            <TextField
              fullWidth
              label={useBackupCode ? "Backup Code" : "Verification Code"}
              placeholder={useBackupCode ? "12345678" : "123456"}
              value={verificationCode}
              onChange={(e) => {
                const maxLength = useBackupCode ? 8 : 6;
                const digits = e.target.value.replace(/\D/g, "").slice(0, maxLength);
                setVerificationCode(digits);
                setError("");
              }}
              inputProps={{
                maxLength: useBackupCode ? 8 : 6,
                style: { textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" },
              }}
              helperText={useBackupCode ? "Enter the 8-digit backup code" : "Enter the 6-digit code"}
              sx={{ mb: 3 }}
              autoFocus
            />

            <Button
              variant="text"
              fullWidth
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setVerificationCode("");
                setError("");
              }}
              sx={{ mb: 2, textTransform: "none" }}
            >
              {useBackupCode ? "Use verification code instead" : "Use backup code instead"}
            </Button>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || (useBackupCode ? verificationCode.length !== 8 : verificationCode.length !== 6)}
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              mb: 2,
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Verify & Continue"
            )}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={handleResendCode}
            disabled={sendingCode}
            sx={{ textTransform: "none" }}
          >
            {sendingCode ? (
              <CircularProgress size={20} />
            ) : (
              "Resend Code"
            )}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ textTransform: "none" }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

