import { useMemo, useState } from "react";
import {
  Search,
  Smartphone,
  AlertCircle,
  Clock,
} from "lucide-react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SamplePageOverlay from "../../components/samplePageOverlay";

export default function SendSMS() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Mock groups data
  const groups = [
    { id: "1", name: "All Parents", count: 450, category: "general" },
    { id: "2", name: "Grade 1 Parents", count: 45, category: "grade" },
    { id: "3", name: "Grade 2 Parents", count: 48, category: "grade" },
    { id: "4", name: "Teachers", count: 25, category: "staff" },
    { id: "5", name: "Administration", count: 8, category: "staff" },
  ];

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(groupSearch.toLowerCase())
      ),
    [groupSearch]
  );

  const charCount = message.length;
  const maxChars = 160;
  const smsSegments = Math.ceil(charCount / maxChars) || 1;

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedGroups.length === 0) {
      alert("Please select at least one group.");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    console.log("Sending SMS:", {
      groups: selectedGroups,
      message,
      segments: smsSegments,
      scheduled: showSchedule ? { date: scheduleDate, time: scheduleTime } : null,
    });

    alert("SMS sent successfully via Twilio!");

    // Reset
    setSelectedGroups([]);
    setMessage("");
    setShowSchedule(false);
    setScheduleDate("");
    setScheduleTime("");
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <SamplePageOverlay />

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
              <Typography variant="subtitle1">Select Recipients</Typography>

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
                          border: "1px solid #e5e7eb",
                          cursor: "pointer",
                          bgcolor: checked ? "#eff6ff" : "transparent",
                          "&:hover": { bgcolor: checked ? "#dbeafe" : "#f9fafb" },
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleGroup(group.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Typography variant="body2" noWrap>
                            {group.name}
                          </Typography>
                        </Stack>

                        <Chip size="small" label={group.count} />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
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
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Selected Groups
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {groups
                      .filter((g) => selectedGroups.includes(g.id))
                      .map((g) => (
                        <Chip
                          key={g.id}
                          color="primary"
                          label={`${g.name} (${g.count})`}
                        />
                      ))}
                  </Stack>
                </Box>
              )}

              {/* Message */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1">Message</Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="caption"
                      sx={{ color: charCount > maxChars ? "#ea580c" : "text.secondary" }}
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
                />

                {charCount > maxChars && (
                  <Alert
                    icon={<AlertCircle size={16} />}
                    severity="warning"
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="caption">
                      Messages over 160 characters will be sent as multiple segments and may incur additional charges.
                    </Typography>
                  </Alert>
                )}
              </Box>

              {/* Schedule */}
              <Box>
                <Button
                  variant="text"
                  onClick={() => setShowSchedule((v) => !v)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  <Clock size={16} style={{ marginRight: 6 }} />
                  {showSchedule ? "Cancel" : "Schedule"} Send
                </Button>

                {showSchedule && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      type="date"
                      label="Date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      fullWidth
                    />
                    <TextField
                      type="time"
                      label="Time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      fullWidth
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
                sx={{ alignSelf: "flex-end" }}
              >
                <Smartphone size={16} style={{ marginRight: 8 }} />
                {showSchedule && scheduleDate && scheduleTime ? "Schedule SMS" : "Send SMS"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
