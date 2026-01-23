import { useState } from "react";
import api from "../utils/api";
import { Box, Paper, Typography } from "@mui/material";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Unable to send reset email.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={10}>
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h6" mb={2}>Reset your password</Typography>

        {sent ? (
          <Alert>
            <AlertDescription>
              If an account exists, a reset link has been sent.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={submit}>
            <Input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {error && (
              <Alert variant="destructive" sx={{ mt: 2 }}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" fullWidth sx={{ mt: 2 }}>
              Send Reset Link
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
}

