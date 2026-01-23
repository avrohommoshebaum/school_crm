import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../utils/api";
import { Box, Paper, Typography } from "@mui/material";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={10}>
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h6" mb={2}>Set new password</Typography>

        <form onSubmit={submit}>
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <Alert variant="destructive" sx={{ mt: 2 }}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" fullWidth sx={{ mt: 2 }}>
            Reset Password
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

