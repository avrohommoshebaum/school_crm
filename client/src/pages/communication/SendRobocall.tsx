import { useMemo, useRef, useState, useEffect } from "react";
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
  Loader2,
  AlertCircle,
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
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";

import api from "../../utils/api";

// ---------- Types ----------

type RecordingMethod =
  | "text-to-speech"
  | "call-to-record"
  | "device-record"
  | "saved-file";

type Group = {
  _id?: string;
  id: string;
  name: string;
  memberCount: number;
  description?: string;
  pin?: string;
};

type SavedRecording = {
  id: string;
  name: string;
  description?: string;
  audio_gcs_path: string;
  signedUrl?: string;
  duration_seconds?: number;
  created_at: string;
};

// ---------- Component ----------

export default function SendRobocall() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [message, setMessage] = useState("");
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState("");

  const [recordingMethod, setRecordingMethod] =
    useState<RecordingMethod>("text-to-speech");

  // Device recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Call-to-record state
  const [callToRecordPhone, setCallToRecordPhone] = useState("");
  const [callToRecordLoading, setCallToRecordLoading] = useState(false);
  const [callToRecordSessionId, setCallToRecordSessionId] = useState<string | null>(null);
  const [callToRecordStatus, setCallToRecordStatus] = useState<
    "idle" | "calling" | "recording" | "completed" | "failed"
  >("idle");
  const callToRecordPollIntervalRef = useRef<number | null>(null);

  // File upload state
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const [loadingSavedRecordings, setLoadingSavedRecordings] = useState(false);
  const [selectedSavedRecording, setSelectedSavedRecording] = useState<string | null>(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const audioInputRef = useRef<HTMLInputElement>(null);

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
      showSnackbar(
        error?.response?.data?.message || "Error loading groups",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // ---------- Load Saved Recordings ----------

  const loadSavedRecordings = async () => {
    if (recordingMethod !== "saved-file") return;

    try {
      setLoadingSavedRecordings(true);
      const { data } = await api.get("/robocall/saved-recordings");
      setSavedRecordings(data.recordings || []);
    } catch (error: any) {
      console.error("Error loading saved recordings:", error);
      showSnackbar(
        error?.response?.data?.message || "Error loading saved recordings",
        "error"
      );
    } finally {
      setLoadingSavedRecordings(false);
    }
  };

  useEffect(() => {
    if (recordingMethod === "saved-file") {
      loadSavedRecordings();
    }
  }, [recordingMethod]);

  // Cleanup polling interval on unmount or when status is terminal
  useEffect(() => {
    return () => {
      if (callToRecordPollIntervalRef.current) {
        clearInterval(callToRecordPollIntervalRef.current);
        callToRecordPollIntervalRef.current = null;
      }
    };
  }, []);

  // Stop polling when status reaches terminal state
  useEffect(() => {
    if (callToRecordStatus === "completed" || callToRecordStatus === "failed") {
      if (callToRecordPollIntervalRef.current) {
        clearInterval(callToRecordPollIntervalRef.current);
        callToRecordPollIntervalRef.current = null;
      }
    }
  }, [callToRecordStatus]);

  // ---------- Filtered Groups ----------

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(groupSearch.toLowerCase())
      ),
    [groups, groupSearch]
  );

  // ---------- Handlers ----------

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  // ---------- Device Recording ----------

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecording(true);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      showSnackbar("Failed to start recording. Please check microphone permissions.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const clearRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setHasRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (callToRecordPollIntervalRef.current) {
        clearInterval(callToRecordPollIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }
    };
  }, [audioUrl, uploadedAudioUrl]);

  // ---------- Call-to-Record ----------

  const initiateCallToRecord = async () => {
    if (!callToRecordPhone.trim()) {
      showSnackbar("Please enter a phone number", "warning");
      return;
    }

    try {
      setCallToRecordLoading(true);
      const { data } = await api.post("/robocall/call-to-record", {
        phoneNumber: callToRecordPhone.trim(),
      });

      setCallToRecordSessionId(data.sessionId);
      setCallToRecordStatus("calling");
      showSnackbar("Call initiated. Please answer your phone.", "info");

      // Check initial status first (in case session already exists)
      try {
        const { data: initialSessionData } = await api.get(
          `/robocall/call-to-record/${data.sessionId}`
        );
        
        // If already in terminal state, don't start polling
        if (initialSessionData.status === "completed" || initialSessionData.status === "failed") {
          setCallToRecordStatus(initialSessionData.status);
          if (initialSessionData.status === "completed") {
            showSnackbar("Recording completed and saved!", "success");
            if (recordingMethod === "saved-file") {
              loadSavedRecordings();
            }
          } else {
            showSnackbar("Recording failed", "error");
          }
          return; // Don't start polling
        } else if (initialSessionData.status === "recording") {
          setCallToRecordStatus("recording");
        }
      } catch (error) {
        console.error("Error checking initial session status:", error);
        // Continue with polling anyway
      }

      // Poll for status
      callToRecordPollIntervalRef.current = setInterval(async () => {
        try {
          const { data: sessionData } = await api.get(
            `/robocall/call-to-record/${data.sessionId}`
          );

          if (sessionData.status === "completed") {
            setCallToRecordStatus("completed");
            if (callToRecordPollIntervalRef.current) {
              clearInterval(callToRecordPollIntervalRef.current);
              callToRecordPollIntervalRef.current = null;
            }
            showSnackbar("Recording completed and saved!", "success");
            // Reload saved recordings if on saved-file mode
            if (recordingMethod === "saved-file") {
              loadSavedRecordings();
            }
          } else if (sessionData.status === "failed") {
            setCallToRecordStatus("failed");
            if (callToRecordPollIntervalRef.current) {
              clearInterval(callToRecordPollIntervalRef.current);
              callToRecordPollIntervalRef.current = null;
            }
            showSnackbar("Recording failed", "error");
          } else if (sessionData.status === "recording") {
            setCallToRecordStatus("recording");
          }
        } catch (error: any) {
          console.error("Error polling call-to-record status:", error);
          // If we get a 404 or the session doesn't exist, stop polling
          if (error?.response?.status === 404) {
            setCallToRecordStatus("failed");
            if (callToRecordPollIntervalRef.current) {
              clearInterval(callToRecordPollIntervalRef.current);
              callToRecordPollIntervalRef.current = null;
            }
            showSnackbar("Session not found. Recording may have expired.", "error");
          }
        }
      }, 3000); // Poll every 3 seconds
    } catch (error: any) {
      console.error("Error initiating call-to-record:", error);
      showSnackbar(
        error?.response?.data?.message || "Failed to initiate call",
        "error"
      );
      setCallToRecordStatus("failed");
    } finally {
      setCallToRecordLoading(false);
    }
  };

  // ---------- File Upload ----------

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("audio/")) {
        showSnackbar("Please select an audio file", "error");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showSnackbar("File size must be less than 10MB", "error");
        return;
      }
      setUploadedAudio(file);
      setSelectedSavedRecording(null);
      // Create URL for audio playback
      const url = URL.createObjectURL(file);
      setUploadedAudioUrl(url);
    }
  };

  // ---------- Convert Audio to Base64 ----------

  const audioToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // ---------- Send Robocall ----------

  const handleSend = async () => {
    // Validation
    if (selectedGroups.length === 0 && !manualPhoneNumbers.trim()) {
      showSnackbar("Please select at least one group or enter phone numbers", "warning");
      return;
    }

    if (recordingMethod === "text-to-speech" && !message.trim()) {
      showSnackbar("Please enter a message", "warning");
      return;
    }

    if (
      recordingMethod === "device-record" &&
      (!hasRecording || !audioBlob)
    ) {
      showSnackbar("Please record your message first", "warning");
      return;
    }

    if (
      recordingMethod === "saved-file" &&
      !selectedSavedRecording &&
      !uploadedAudio
    ) {
      showSnackbar("Please select or upload an audio file", "warning");
      return;
    }

    if (recordingMethod === "call-to-record" && callToRecordStatus !== "completed") {
      showSnackbar("Please complete the call-to-record first", "warning");
      return;
    }

    // Validate schedule if enabled
    if (showSchedule) {
      if (!scheduleDate || !scheduleTime) {
        showSnackbar("Please select both date and time for scheduling", "warning");
        return;
      }

      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime < new Date()) {
        showSnackbar("Scheduled time must be in the future", "warning");
        return;
      }
    }

    try {
      setSending(true);

      // Prepare payload
      // Map "saved-file" to "upload" for database compatibility
      const dbRecordingMethod = recordingMethod === "saved-file" ? "upload" : recordingMethod;
      const payload: any = {
        recordingMethod: dbRecordingMethod,
        groupIds: selectedGroups,
      };

      // Add manual phone numbers
      if (manualPhoneNumbers.trim()) {
        const phones = manualPhoneNumbers
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p);
        payload.manualPhoneNumbers = phones;
      }

      // Add recording method specific data
      if (recordingMethod === "text-to-speech") {
        payload.textContent = message.trim();
      } else if (recordingMethod === "device-record" && audioBlob) {
        const base64 = await audioToBase64(audioBlob);
        payload.audioFile = base64;
      } else if (recordingMethod === "saved-file") {
        // Handle both uploaded file and selected saved recording
        if (uploadedAudio) {
          // User uploaded a new file
          const base64 = await audioToBase64(uploadedAudio);
          payload.audioFile = base64;
        } else if (selectedSavedRecording) {
          // User selected a saved recording
          const recording = savedRecordings.find((r) => r.id === selectedSavedRecording);
          if (recording) {
            payload.audioGcsPath = recording.audio_gcs_path;
          }
        }
      } else if (recordingMethod === "call-to-record" && callToRecordSessionId) {
        // Get the session to get the GCS path
        try {
          const { data: sessionData } = await api.get(
            `/robocall/call-to-record/${callToRecordSessionId}`
          );
          if (sessionData.recording_gcs_path) {
            payload.audioGcsPath = sessionData.recording_gcs_path;
          } else {
            throw new Error("Recording not available");
          }
        } catch (error) {
          showSnackbar("Recording not available. Please try again.", "error");
          return;
        }
      }

      // Add scheduling
      if (showSchedule && scheduleDate && scheduleTime) {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        payload.scheduledFor = scheduledDateTime.toISOString();
      }

      // Send robocall
      await api.post("/robocall/send", payload);

      if (showSchedule && scheduleDate && scheduleTime) {
        showSnackbar("Robocall scheduled successfully!", "success");
      } else {
        showSnackbar("Robocall sent successfully!", "success");
      }

      // Reset form
      setSelectedGroups([]);
      setMessage("");
      setManualPhoneNumbers("");
      setRecordingMethod("text-to-speech");
      setHasRecording(false);
      clearRecording();
      setUploadedAudio(null);
      setSelectedSavedRecording(null);
      setCallToRecordPhone("");
      setCallToRecordSessionId(null);
      setCallToRecordStatus("idle");
      setShowSchedule(false);
      setScheduleDate("");
      setScheduleTime("");
    } catch (error: any) {
      console.error("Error sending robocall:", error);
      showSnackbar(
        error?.response?.data?.message || "Failed to send robocall",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  // ---------- Format Time ----------

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 2fr" },
          gap: { xs: 2, sm: 3 },
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
                          onClick={() => {
                            if (!(callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading)) {
                              toggleGroup(group.id);
                            }
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: checked ? "primary.main" : "divider",
                            cursor: (callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading) ? "not-allowed" : "pointer",
                            bgcolor: checked ? "primary.50" : "transparent",
                            opacity: (callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading) ? 0.6 : 1,
                            "&:hover": {
                              bgcolor: (callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading) 
                                ? (checked ? "primary.50" : "transparent")
                                : (checked ? "primary.100" : "action.hover"),
                            },
                            transition: "all 0.2s",
                            pointerEvents: (callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading) ? "none" : "auto",
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
                              onChange={() => {
                                if (!(callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading)) {
                                  toggleGroup(group.id);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ cursor: (callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading) ? "not-allowed" : "pointer" }}
                              disabled={callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight={checked ? 600 : 400}
                                noWrap
                              >
                                {group.name}
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip size="small" label={group.memberCount} sx={{ ml: 1 }} />
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

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }} fontWeight={600}>
                  Manual Phone Numbers
                </Typography>
                <TextField
                  placeholder="+1234567890, +0987654321"
                  size="small"
                  value={manualPhoneNumbers}
                  onChange={(e) => setManualPhoneNumbers(e.target.value)}
                  fullWidth
                  helperText="Enter phone numbers separated by commas"
                  disabled={
                    callToRecordStatus === "calling" || 
                    callToRecordStatus === "recording" || 
                    callToRecordLoading
                  }
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Robocall Composition */}
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
                          onDelete={
                            (callToRecordStatus === "calling" || callToRecordStatus === "recording" || callToRecordLoading)
                              ? undefined
                              : () => toggleGroup(g.id)
                          }
                        />
                      ))}
                  </Stack>
                </Box>
              )}

              {/* Recording Method */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }} fontWeight={600}>
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
                  ].map(({ key, label, Icon }) => {
                    const isCalling = callToRecordStatus === "calling" || callToRecordStatus === "recording";
                    const isDisabled = isCalling || callToRecordLoading;
                    
                    return (
                      <Box
                        key={key}
                        onClick={() => {
                          if (!isDisabled) {
                            setRecordingMethod(key as RecordingMethod);
                          }
                        }}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "2px solid",
                          borderColor:
                            recordingMethod === key
                              ? "primary.main"
                              : "divider",
                          bgcolor:
                            recordingMethod === key
                              ? "primary.50"
                              : "transparent",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.6 : 1,
                          transition: "all 0.2s",
                          pointerEvents: isDisabled ? "none" : "auto",
                        }}
                      >
                        <Icon size={18} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Text to Speech */}
              {recordingMethod === "text-to-speech" && (
                <TextField
                  multiline
                  minRows={5}
                  label="Message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  fullWidth
                  disabled={
                    callToRecordStatus === "calling" || 
                    callToRecordStatus === "recording" || 
                    callToRecordLoading
                  }
                />
              )}

              {/* Call to Record */}
              {recordingMethod === "call-to-record" && (
                <Stack spacing={2}>
                  <TextField
                    label="Your Phone Number"
                    placeholder="+1234567890"
                    value={callToRecordPhone}
                    onChange={(e) => setCallToRecordPhone(e.target.value)}
                    fullWidth
                    helperText="We'll call this number so you can record your message"
                    disabled={
                      callToRecordStatus === "calling" || 
                      callToRecordStatus === "recording" || 
                      callToRecordLoading
                    }
                  />
                  <Button
                    variant="contained"
                    onClick={initiateCallToRecord}
                    disabled={
                      callToRecordLoading || 
                      !callToRecordPhone.trim() || 
                      callToRecordStatus === "calling" || 
                      callToRecordStatus === "recording"
                    }
                    startIcon={
                      (callToRecordLoading || callToRecordStatus === "calling" || callToRecordStatus === "recording") ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <PhoneCall size={16} />
                      )
                    }
                  >
                    {callToRecordLoading
                      ? "Initiating Call..."
                      : callToRecordStatus === "calling"
                      ? "Calling..."
                      : callToRecordStatus === "recording"
                      ? "Recording..."
                      : callToRecordStatus === "completed"
                      ? "Recording Complete"
                      : "Call Me to Record"}
                  </Button>
                  {callToRecordStatus === "completed" && (
                    <Alert severity="success">
                      Recording completed! You can now send the robocall.
                    </Alert>
                  )}
                  {callToRecordStatus === "failed" && (
                    <Alert severity="error">
                      Recording failed. Please try again.
                    </Alert>
                  )}
                </Stack>
              )}

              {/* Device Record */}
              {recordingMethod === "device-record" && (
                <Box
                  sx={{
                    textAlign: "center",
                    p: 3,
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  {!isRecording && !hasRecording && (
                    <Button
                      variant="contained"
                      onClick={startRecording}
                      startIcon={<Mic size={16} />}
                    >
                      Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <Stack spacing={2} alignItems="center">
                      <Button
                        variant="contained"
                        color="error"
                        onClick={stopRecording}
                        startIcon={<Square size={16} />}
                      >
                        Stop Recording
                      </Button>
                      <Typography variant="h6" color="error">
                        {formatTime(recordingTime)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Recording in progress...
                      </Typography>
                    </Stack>
                  )}

                  {hasRecording && !isRecording && (
                    <Stack spacing={2} alignItems="center">
                      <Alert severity="success" sx={{ width: "100%" }}>
                        Recording Saved ({formatTime(recordingTime)})
                      </Alert>
                      {audioUrl && (
                        <audio
                          ref={audioPlayerRef}
                          src={audioUrl}
                          controls
                          style={{ width: "100%", maxWidth: 400 }}
                        />
                      )}
                      <Button
                        variant="outlined"
                        onClick={clearRecording}
                        startIcon={<X size={16} />}
                      >
                        Re-record
                      </Button>
                    </Stack>
                  )}
                </Box>
              )}

              {/* Upload Audio / Saved Files */}
              {recordingMethod === "saved-file" && (
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => audioInputRef.current?.click()}
                    startIcon={<Upload size={16} />}
                    fullWidth
                  >
                    Upload Audio File
                  </Button>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={handleAudioUpload}
                  />

                  {uploadedAudio && (
                    <Stack spacing={2}>
                      <Alert
                        severity="success"
                        action={
                          <Button
                            size="small"
                            onClick={() => {
                              if (uploadedAudioUrl) {
                                URL.revokeObjectURL(uploadedAudioUrl);
                              }
                              setUploadedAudio(null);
                              setUploadedAudioUrl(null);
                              setSelectedSavedRecording(null);
                            }}
                          >
                            <X size={14} />
                          </Button>
                        }
                      >
                        {uploadedAudio.name} ({(uploadedAudio.size / 1024).toFixed(1)} KB)
                      </Alert>
                      {uploadedAudioUrl && (
                        <audio
                          src={uploadedAudioUrl}
                          controls
                          style={{ width: "100%", maxWidth: 400 }}
                        />
                      )}
                    </Stack>
                  )}

                  <Divider />

                  <Typography variant="subtitle2" fontWeight={600}>
                    Saved Recordings
                  </Typography>

                  {loadingSavedRecordings ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : savedRecordings.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No saved recordings
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {savedRecordings.map((recording) => {
                        const selected = selectedSavedRecording === recording.id;
                        return (
                          <Box
                            key={recording.id}
                            onClick={() => {
                              setSelectedSavedRecording(recording.id);
                              setUploadedAudio(null);
                            }}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: selected ? "primary.main" : "divider",
                              cursor: "pointer",
                              bgcolor: selected ? "primary.50" : "transparent",
                              "&:hover": {
                                bgcolor: selected ? "primary.100" : "action.hover",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="body2" fontWeight={selected ? 600 : 400}>
                                {recording.name}
                              </Typography>
                              {recording.signedUrl && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const audio = new Audio(recording.signedUrl);
                                    audio.play();
                                  }}
                                >
                                  <Play size={14} />
                                </IconButton>
                              )}
                            </Stack>
                            {recording.description && (
                              <Typography variant="caption" color="text.secondary">
                                {recording.description}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              )}

              {/* Schedule */}
              <Box>
                <Button
                  variant="text"
                  onClick={() => setShowSchedule((v) => !v)}
                  disabled={
                    sending ||
                    callToRecordStatus === "calling" ||
                    callToRecordStatus === "recording" ||
                    callToRecordLoading
                  }
                  startIcon={<Clock size={16} />}
                >
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
                      disabled={
                        sending ||
                        callToRecordStatus === "calling" ||
                        callToRecordStatus === "recording" ||
                        callToRecordLoading
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      type="time"
                      label="Time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      fullWidth
                      disabled={
                        sending ||
                        callToRecordStatus === "calling" ||
                        callToRecordStatus === "recording" ||
                        callToRecordLoading
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Send Button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleSend}
                disabled={
                  sending ||
                  (selectedGroups.length === 0 && !manualPhoneNumbers.trim()) ||
                  (recordingMethod === "text-to-speech" && !message.trim()) ||
                  (recordingMethod === "device-record" && !hasRecording) ||
                  (recordingMethod === "saved-file" &&
                    !selectedSavedRecording &&
                    !uploadedAudio) ||
                  (recordingMethod === "call-to-record" &&
                    callToRecordStatus !== "completed")
                }
                sx={{ alignSelf: "flex-end", width: { xs: "100%", sm: "auto" } }}
                startIcon={
                  sending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Phone size={16} />
                  )
                }
              >
                {sending
                  ? showSchedule && scheduleDate && scheduleTime
                    ? "Scheduling..."
                    : "Sending..."
                  : showSchedule && scheduleDate && scheduleTime
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
