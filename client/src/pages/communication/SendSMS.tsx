import { useMemo, useState, useEffect } from "react";
import {
  Search,
  Smartphone,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";

import api from "../../utils/api";

// ---------- Types ----------

type Group = {
  _id?: string;
  id: string;
  name: string;
  memberCount: number;
  description: string;
  pin: string;
  createdAt?: string;
  updatedAt?: string;
};

// ---------- Component ----------

export default function SendSMS() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  // ---------- Load Groups ----------

  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/groups");
      setGroups(data.groups || []);
    } catch (error: any) {
      console.error("Error loading groups:", error);
      showSnackbar(error?.response?.data?.message || "Error loading groups", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // ---------- Filtered Groups ----------

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(groupSearch.toLowerCase())
      ),
    [groups, groupSearch]
  );

  // ---------- SMS Calculations ----------

  const charCount = message.length;
  const maxChars = 160;
  const smsSegments = Math.ceil(charCount / maxChars) || 1;

  // ---------- Handlers ----------

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSend = async () => {
    if (selectedGroups.length === 0) {
      showSnackbar("Please select at least one group.", "warning");
      return;
    }

    if (!message.trim()) {
      showSnackbar("Please enter a message.", "warning");
      return;
    }

    // If scheduling, validate date and time
    if (showSchedule) {
      if (!scheduleDate || !scheduleTime) {
        showSnackbar("Please select both date and time for scheduling.", "warning");
        return;
      }

      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime < new Date()) {
        showSnackbar("Scheduled time must be in the future.", "warning");
        return;
      }
    }

    try {
      setSending(true);
      const allErrors: Array<{ groupId: string; error: string; details?: any }> = [];

      if (showSchedule && scheduleDate && scheduleTime) {
        // Schedule SMS for each selected group
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        
        for (const groupId of selectedGroups) {
          try {
            await api.post("/sms/schedule", {
              groupId,
              message: message.trim(),
              scheduledFor: scheduledDateTime.toISOString(),
            });
          } catch (error: any) {
            console.error(`Error scheduling SMS for group ${groupId}:`, error);
            const errorMsg = error?.response?.data?.error || 
                           error?.response?.data?.message || 
                           error?.message || 
                           "Unknown error";
            allErrors.push({
              groupId,
              error: errorMsg,
              details: error?.response?.data?.twilioError,
            });
          }
        }

        if (allErrors.length > 0) {
          showSnackbar(
            `SMS scheduled with ${allErrors.length} error(s). Check console for details.`,
            "warning"
          );
        } else {
          showSnackbar(
            `SMS scheduled successfully for ${selectedGroups.length} group(s)!`,
            "success"
          );
        }
      } else {
        // Send SMS immediately to each selected group
        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const groupId of selectedGroups) {
          try {
            const response = await api.post("/sms/send/group", {
              groupId,
              message: message.trim(),
            });
            results.push(response.data);
            successCount += response.data.successCount || 0;
            failCount += response.data.failCount || 0;
            
            // Collect errors from this group
            if (response.data.errors && response.data.errors.length > 0) {
              allErrors.push({
                groupId,
                error: `${response.data.failCount} recipient(s) failed`,
                details: response.data.errors,
              });
            }
          } catch (error: any) {
            console.error(`Error sending SMS to group ${groupId}:`, error);
            failCount++;
            const errorMsg = error?.response?.data?.error || 
                           error?.response?.data?.message || 
                           error?.message || 
                           "Unknown error";
            allErrors.push({
              groupId,
              error: errorMsg,
              details: error?.response?.data?.twilioError,
            });
          }
        }

        if (successCount > 0) {
          const message = failCount > 0
            ? `SMS sent to ${successCount} recipient(s), ${failCount} failed.`
            : `SMS sent successfully! ${successCount} message(s) sent.`;
          showSnackbar(message, failCount > 0 ? "warning" : "success");
          
          // Log detailed errors for debugging
          if (allErrors.length > 0) {
            console.error("SMS Errors by group:", allErrors);
            // Show first error as additional info
            const firstError = allErrors[0];
            if (firstError.error.includes("Toll-Free") || firstError.error.includes("verification")) {
              showSnackbar(
                "⚠️ Some messages failed: Phone number verification required in Twilio Console",
                "warning"
              );
            }
          }
        } else {
          // Extract error message from response
          const firstError = allErrors[0];
          const errorMessage = firstError?.error || 
                              error?.response?.data?.error || 
                              error?.response?.data?.message ||
                              "Failed to send SMS";
          
          // Provide helpful message for common Twilio errors
          let userMessage = errorMessage;
          if (errorMessage.includes("Toll-Free") || errorMessage.includes("verification")) {
            userMessage = "Phone number verification required. Please verify your Twilio phone number in the Twilio Console.";
          } else if (errorMessage.includes("Invalid phone number")) {
            userMessage = "Invalid phone number format. Please check the recipient phone numbers.";
          }
          
          showSnackbar(
            `Failed to send SMS: ${userMessage}`,
            "error"
          );
        }
      }

      // Reset form
      setSelectedGroups([]);
      setMessage("");
      setShowSchedule(false);
      setScheduleDate("");
      setScheduleTime("");
    } catch (error: any) {
      console.error("Error sending/scheduling SMS:", error);
      showSnackbar(
        error?.response?.data?.message || "Error sending SMS. Please try again.",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" },
          gap: 3,
        }}
      >
        {/* Group Selection */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Select Recipients
              </Typography>

              <TextField
                placeholder="Search groups..."
                size="small"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={16} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                {filteredGroups.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      {groupSearch ? "No groups found" : "No groups available"}
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {filteredGroups.map((group) => {
                      const checked = selectedGroups.includes(group.id);
                      return (
                        <Box
                          key={group.id}
                          onClick={() => toggleGroup(group.id)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: checked ? "primary.main" : "divider",
                            cursor: "pointer",
                            bgcolor: checked ? "primary.50" : "transparent",
                            "&:hover": {
                              bgcolor: checked ? "primary.100" : "action.hover",
                            },
                            transition: "all 0.2s",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: 0, flex: 1 }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleGroup(group.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ cursor: "pointer" }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={checked ? 600 : 400}
                                noWrap
                              >
                                {group.name}
                              </Typography>
                              {group.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {group.description}
                                </Typography>
                              )}
                            </Box>
                          </Stack>

                          <Chip
                            size="small"
                            label={group.memberCount}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {selectedGroups.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {selectedGroups.length} group(s) selected
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* SMS Composition */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              {/* Selected Groups */}
              {selectedGroups.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }} fontWeight={600}>
                    Selected Groups
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {groups
                      .filter((g) => selectedGroups.includes(g.id))
                      .map((g) => (
                        <Chip
                          key={g.id}
                          color="primary"
                          label={`${g.name} (${g.memberCount})`}
                          onDelete={() => toggleGroup(g.id)}
                        />
                      ))}
                  </Stack>
                </Box>
              )}

              {/* Message */}
              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Message
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          charCount > maxChars ? "error.main" : "text.secondary",
                      }}
                    >
                      {charCount}/{maxChars}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${smsSegments} ${smsSegments === 1 ? "segment" : "segments"}`}
                    />
                  </Stack>
                </Stack>

                <TextField
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your SMS message here..."
                  multiline
                  minRows={8}
                  fullWidth
                  disabled={sending}
                />

                {charCount > maxChars && (
                  <Alert
                    icon={<AlertCircle size={16} />}
                    severity="warning"
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="caption">
                      Messages over 160 characters will be sent as multiple
                      segments and may incur additional charges.
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Schedule */}
              <Box>
                <Button
                  variant="text"
                  onClick={() => setShowSchedule((v) => !v)}
                  disabled={sending}
                  sx={{ alignSelf: "flex-start" }}
                >
                  <Clock size={16} style={{ marginRight: 6 }} />
                  {showSchedule ? "Cancel" : "Schedule"} Send
                </Button>

                {showSchedule && (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      type="date"
                      label="Date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      fullWidth
                      disabled={sending}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      type="time"
                      label="Time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      fullWidth
                      disabled={sending}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Send */}
              <Button
                variant="contained"
                size="large"
                onClick={handleSend}
                disabled={sending || selectedGroups.length === 0 || !message.trim()}
                sx={{ alignSelf: "flex-end" }}
                startIcon={
                  sending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Smartphone size={16} />
                  )
                }
              >
                {sending
                  ? showSchedule && scheduleDate && scheduleTime
                    ? "Scheduling..."
                    : "Sending..."
                  : showSchedule && scheduleDate && scheduleTime
                  ? "Schedule SMS"
                  : "Send SMS"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
