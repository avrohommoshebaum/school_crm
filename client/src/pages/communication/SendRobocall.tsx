import { useMemo, useRef, useState } from "react";
import {
  Phone,
  Search,
  Mic,
  Upload,
  PhoneCall,
  Volume2,
  Play,
  Square,
  Clock,
  X,
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

type RecordingMethod =
  | "text-to-speech"
  | "call-to-record"
  | "device-record"
  | "saved-file";

export default function SendRobocall() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [message, setMessage] = useState("");

  const [recordingMethod, setRecordingMethod] =
    useState<RecordingMethod>("text-to-speech");

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const [selectedAudioFile, setSelectedAudioFile] = useState("");
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const groups = [
    { id: "1", name: "All Parents", count: 450 },
    { id: "2", name: "Grade 1 Parents", count: 45 },
    { id: "3", name: "Grade 2 Parents", count: 48 },
    { id: "4", name: "Teachers", count: 25 },
    { id: "5", name: "Administration", count: 8 },
  ];

  const savedAudioFiles = [
    { id: "1", name: "School Closure Announcement", duration: "0:45" },
    { id: "2", name: "Early Dismissal Notice", duration: "0:32" },
    { id: "3", name: "Event Reminder", duration: "1:15" },
  ];

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(groupSearch.toLowerCase())
      ),
    [groupSearch]
  );

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setHasRecording(true);
    }, 3000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedAudio(file);
  };

  const handleSend = () => {
    if (!selectedGroups.length) {
      alert("Please select at least one group.");
      return;
    }

    if (recordingMethod === "text-to-speech" && !message.trim()) {
      alert("Please enter a message.");
      return;
    }

    if (
      recordingMethod === "saved-file" &&
      !selectedAudioFile &&
      !uploadedAudio
    ) {
      alert("Please select or upload an audio file.");
      return;
    }

    if (recordingMethod === "device-record" && !hasRecording) {
      alert("Please record your message first.");
      return;
    }

    console.log("Sending robocall:", {
      selectedGroups,
      recordingMethod,
      message,
      selectedAudioFile,
      uploadedAudio,
      scheduled: showSchedule ? { scheduleDate, scheduleTime } : null,
    });

    alert("Robocall initiated successfully via Twilio!");

    setSelectedGroups([]);
    setMessage("");
    setRecordingMethod("text-to-speech");
    setHasRecording(false);
    setUploadedAudio(null);
    setSelectedAudioFile("");
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
        {/* Groups */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Select Recipients</Typography>

              <TextField
                size="small"
                placeholder="Search groups..."
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

              <Stack spacing={1} sx={{ maxHeight: 400, overflowY: "auto" }}>
                {filteredGroups.map((g) => {
                  const checked = selectedGroups.includes(g.id);
                  return (
                    <Box
                      key={g.id}
                      onClick={() => toggleGroup(g.id)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        bgcolor: checked ? "#eff6ff" : "transparent",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" noWrap>
                        {g.name}
                      </Typography>
                      <Chip size="small" label={g.count} />
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Robocall */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              {selectedGroups.length > 0 && (
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
              )}

              {/* Recording Method */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Recording Method
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  {[
                    {
                      key: "text-to-speech",
                      label: "Text-to-Speech",
                      Icon: Volume2,
                    },
                    {
                      key: "call-to-record",
                      label: "Call to Record",
                      Icon: PhoneCall,
                    },
                    {
                      key: "device-record",
                      label: "Record on Device",
                      Icon: Mic,
                    },
                    {
                      key: "saved-file",
                      label: "Upload Audio",
                      Icon: Upload,
                    },
                  ].map(({ key, label, Icon }) => (
                    <Box
                      key={key}
                      onClick={() =>
                        setRecordingMethod(key as RecordingMethod)
                      }
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor:
                          recordingMethod === key
                            ? "primary.main"
                            : "grey.300",
                        bgcolor:
                          recordingMethod === key ? "#eff6ff" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={18} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Text to Speech */}
              {recordingMethod === "text-to-speech" && (
                <TextField
                  multiline
                  minRows={5}
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              )}

              {/* Device Record */}
              {recordingMethod === "device-record" && (
                <Box sx={{ textAlign: "center", p: 3, border: "2px dashed #ccc" }}>
                  {!isRecording && !hasRecording && (
                    <Button onClick={handleStartRecording}>
                      <Mic size={16} style={{ marginRight: 6 }} />
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <Button color="error" onClick={handleStopRecording}>
                      <Square size={16} style={{ marginRight: 6 }} />
                      Stop Recording
                    </Button>
                  )}

                  {hasRecording && !isRecording && (
                    <Stack spacing={1}>
                      <Typography color="success.main">
                        Recording Saved
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => setHasRecording(false)}
                      >
                        Re-record
                      </Button>
                    </Stack>
                  )}
                </Box>
              )}

              {/* Saved File */}
              {recordingMethod === "saved-file" && (
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <Upload size={16} style={{ marginRight: 6 }} />
                    Upload Audio
                  </Button>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={handleAudioUpload}
                  />

                  {uploadedAudio && (
                    <Alert
                      icon={<Volume2 size={16} />}
                      severity="success"
                    >
                      {uploadedAudio.name}
                      <Button
                        size="small"
                        onClick={() => setUploadedAudio(null)}
                        sx={{ ml: 2 }}
                      >
                        <X size={12} />
                      </Button>
                    </Alert>
                  )}

                  <Divider />

                  {savedAudioFiles.map((file) => (
                    <Box
                      key={file.id}
                      onClick={() => setSelectedAudioFile(file.id)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                        cursor: "pointer",
                        bgcolor:
                          selectedAudioFile === file.id
                            ? "#eff6ff"
                            : "transparent",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">{file.name}</Typography>
                      <Typography variant="caption">
                        {file.duration}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Schedule */}
              <Button
                variant="text"
                onClick={() => setShowSchedule((v) => !v)}
              >
                <Clock size={16} style={{ marginRight: 6 }} />
                {showSchedule ? "Cancel" : "Schedule"} Send
              </Button>

              {showSchedule && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    type="date"
                    label="Date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <TextField
                    type="time"
                    label="Time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </Stack>
              )}

              <Divider />

              <Button
                variant="contained"
                size="large"
                onClick={handleSend}
                sx={{ alignSelf: "flex-end" }}
              >
                <Phone size={16} style={{ marginRight: 8 }} />
                {showSchedule && scheduleDate && scheduleTime
                  ? "Schedule Robocall"
                  : "Send Robocall"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
