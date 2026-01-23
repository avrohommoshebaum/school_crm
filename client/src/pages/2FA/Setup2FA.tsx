/**
 * 2FA Setup Page
 * Allows users to configure SMS or Phone Call 2FA
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import SmsIcon from "@mui/icons-material/Sms";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../../utils/api";
import nachlasLogo from "../../assets/nachlasLogo.png";

export default function Setup2FA() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [method, setMethod] = useState<"SMS" | "phone_call">("SMS");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const convertToE164 = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits[0] === "1") {
      return `+${digits}`;
    }
    return phone; // Return as-is if not standard US format
  };

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const e164Phone = convertToE164(phoneNumber);
      await api.post("/auth/2fa/setup", {
        phoneNumber: e164Phone,
        method,
      });

      setStep("verify");
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/2fa/setup/verify", {
        code: verificationCode,
      });

      setSuccess(true);
      // Refresh user context to update mfaEnabled status
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
          background: `linear-gradient(135deg, ${theme.palette.success.light}15 0%, ${theme.palette.primary.light}15 100%)`,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: { xs: 4, sm: 6 },
            width: "100%",
            maxWidth: 500,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: theme.palette.success.light,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: 50,
                  color: theme.palette.success.main,
                }}
              />
            </Box>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: theme.palette.success.main }}>
            2FA Enabled Successfully!
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Two-factor authentication has been enabled for your account.
            <br />
            Redirecting to settings...
          </Typography>
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
          p: { xs: 4, sm: 5 },
          width: "100%",
          maxWidth: 520,
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
          {step === "setup" ? "Enable Two-Factor Authentication" : "Verify Your Phone"}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {step === "setup"
            ? "Add an extra layer of security to your account"
            : "Enter the verification code sent to your phone"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {step === "setup" ? (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="(732) 555-1234"
              value={phoneNumber}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setPhoneNumber(formatted);
                setError("");
              }}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              helperText="Enter your 10-digit phone number"
            />

            <FormControl component="fieldset">
              <FormLabel component="legend">Verification Method</FormLabel>
              <RadioGroup
                value={method}
                onChange={(e) => setMethod(e.target.value as "SMS" | "phone_call")}
              >
                <FormControlLabel
                  value="SMS"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SmsIcon fontSize="small" />
                      <Typography>Text Message (SMS)</Typography>
                    </Stack>
                  }
                />
                <FormControlLabel
                  value="phone_call"
                  control={<Radio />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneIcon fontSize="small" />
                      <Typography>Phone Call</Typography>
                    </Stack>
                  }
                />
              </RadioGroup>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSendCode}
              disabled={loading || !phoneNumber.trim()}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Send Verification Code"}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Alert severity="info">
              A verification code has been sent via {method === "phone_call" ? "phone call" : "SMS"} to{" "}
              {formatPhoneNumber(phoneNumber)}. Please enter it below.
            </Alert>

            <TextField
              fullWidth
              label="Verification Code"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setVerificationCode(digits);
                setError("");
              }}
              inputProps={{
                maxLength: 6,
                style: { textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5rem" },
              }}
              helperText="Enter the 6-digit code"
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setStep("setup");
                  setVerificationCode("");
                  setError("");
                }}
                sx={{ textTransform: "none" }}
              >
                Change Phone Number
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Verify & Enable"}
              </Button>
            </Stack>

            <Button
              variant="text"
              onClick={handleSendCode}
              disabled={loading}
              sx={{ textTransform: "none" }}
            >
              Resend Code
            </Button>
          </Stack>
        )}

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="text"
            onClick={() => navigate("/settings")}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}


