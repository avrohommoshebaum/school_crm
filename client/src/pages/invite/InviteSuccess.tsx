import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const InviteSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        mt: { xs: 6, sm: 12 },
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
          maxWidth: 460,
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2e7d32" }}>
          ✔ Account Created Successfully
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          Your account has been created!  
          You can now log in to your portal.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ py: 1.2, fontWeight: 600 }}
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default InviteSuccess;
