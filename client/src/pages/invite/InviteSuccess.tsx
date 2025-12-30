import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  useTheme,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import nachlasLogo from "../../assets/nachlasLogo.png";

const InviteSuccess: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

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
          maxWidth: 520,
          textAlign: "center",
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

        {/* Success Icon */}
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
              boxShadow: `0 4px 20px ${theme.palette.success.main}40`,
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

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: theme.palette.success.main,
          }}
        >
          Account Created Successfully!
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 1, fontSize: "1.1rem" }}
        >
          Your account has been set up and is ready to use.
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          You can now sign in to access the Nachlas Bais Yaakov Portal.
        </Typography>

        <Stack spacing={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
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
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default InviteSuccess;
