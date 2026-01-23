import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Search,
  Mic,
  Upload,
  PhoneCall,
  Volume2,
  Smartphone,
  Hash,
  Square,
  Play,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  File as FileLucide,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  Underline,
} from "lucide-react";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import SamplePageOverlay from "../../components/samplePageOverlay";

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

export default function ComposeMessage() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<"email" | "sms" | "call">(
    "email"
  );
  const [message, setMessage] = useState("");
  const [recordingMethod, setRecordingMethod] = useState<
    "text-to-speech" | "call-to-record" | "device-record" | "saved-file"
  >("text-to-speech");
  const [selectedAudioFile, setSelectedAudioFile] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  // Email-specific states
  const [emailSubject, setEmailSubject] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccRecipients, setCcRecipients] = useState("");
  const [bccRecipients, setBccRecipients] = useState("");
  const [emailPriority, setEmailPriority] = useState<"normal" | "high">(
    "normal"
  );
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailEditorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
  });

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const groups = useMemo(
    () => [
      {
        id: "1",
        name: "All Parents",
        count: 487,
        description: "All parent contacts",
        pin: "1001",
      },
      {
        id: "2",
        name: "1st Grade Parents",
        count: 65,
        description: "Parents of 1st grade students",
        pin: "1234",
      },
      {
        id: "3",
        name: "2nd Grade Parents",
        count: 72,
        description: "Parents of 2nd grade students",
        pin: "1235",
      },
      {
        id: "4",
        name: "3rd Grade Parents",
        count: 68,
        description: "Parents of 3rd grade students",
        pin: "1236",
      },
      {
        id: "5",
        name: "4th Grade Parents",
        count: 71,
        description: "Parents of 4th grade students",
        pin: "1237",
      },
      {
        id: "6",
        name: "5th Grade Parents",
        count: 69,
        description: "Parents of 5th grade students",
        pin: "1238",
      },
      {
        id: "7",
        name: "6th Grade Parents",
        count: 70,
        description: "Parents of 6th grade students",
        pin: "1239",
      },
      {
        id: "8",
        name: "7th Grade Parents",
        count: 72,
        description: "Parents of 7th grade students",
        pin: "1240",
      },
      {
        id: "9",
        name: "Staff Members",
        count: 45,
        description: "All staff contacts",
        pin: "2001",
      },
      {
        id: "10",
        name: "Bus Route 1",
        count: 35,
        description: "Students on bus route 1",
        pin: "3001",
      },
    ],
    []
  );

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const getTotalRecipients = () => {
    return groups
      .filter((g) => selectedGroups.includes(g.id))
      .reduce((sum, g) => sum + g.count, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer for recording
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      attachedFiles.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [audioUrl, attachedFiles]);

  // Start recording
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error: any) {
      console.error("Error accessing microphone:", error);

      let errorMessage = "Unable to access microphone. ";

      if (error?.name === "NotFoundError") {
        errorMessage +=
          'No microphone was found on this device. Please connect a microphone and try again, or use "Call to Record" or "Use Saved Audio File" instead.';
      } else if (
        error?.name === "NotAllowedError" ||
        error?.name === "PermissionDeniedError"
      ) {
        errorMessage +=
          "Microphone access was denied. Please allow microphone access in your browser settings and try again.";
      } else if (error?.name === "NotReadableError") {
        errorMessage +=
          "Your microphone is already in use by another application. Please close other apps using the microphone and try again.";
      } else {
        errorMessage +=
          'Please check your device settings and try again, or use "Call to Record" or "Use Saved Audio File" instead.';
      }

      alert(errorMessage);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (!audioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      void audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Clear recording
  const clearRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  // File attachment handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) addFiles(Array.from(files));
  };

  const addFiles = (files: File[]) => {
    const newFiles: AttachedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => {
      const toRemove = prev.find((f) => f.id === id);
      if (toRemove?.preview) URL.revokeObjectURL(toRemove.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type.includes("pdf")) return FileText;
    return FileLucide;
  };

  // Update active formatting state
  const updateActiveFormats = () => {
    if (messageType !== "email") return;

    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
      });
    } catch {
      // ignore
    }
  };

  // Save selection when editor loses focus
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
    updateActiveFormats();
  };

  // Restore selection before applying formatting
  const restoreSelection = () => {
    if (savedSelectionRef.current && emailEditorRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedSelectionRef.current);
      emailEditorRef.current.focus();
    }
  };

  const insertList = (ordered: boolean) => {
    if (!emailEditorRef.current) return;
    emailEditorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      const listElement = document.createElement(ordered ? "ol" : "ul");
      const listItem = document.createElement("li");
      listItem.innerHTML = "<br>";
      listElement.appendChild(listItem);
      emailEditorRef.current.appendChild(listElement);

      const range = document.createRange();
      range.setStart(listItem, 0);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      const cmd = ordered ? "insertOrderedList" : "insertUnorderedList";
      document.execCommand(cmd, false, undefined);
    }

    setMessage(emailEditorRef.current.innerHTML);
    saveSelection();
  };

  const applyFormatting = (command: string, value?: string) => {
    if (messageType !== "email") return;
    if (!emailEditorRef.current) return;

    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    setMessage(emailEditorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) applyFormatting("createLink", url);
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (messageType === "email") setMessage(e.currentTarget.innerHTML);
  };

  const handleSendMessage = () => {
    const messageContent =
      messageType === "email"
        ? emailEditorRef.current?.textContent?.trim() || ""
        : message.trim();

    if (!messageContent || selectedGroups.length === 0) {
      alert("Please select at least one group and enter a message.");
      return;
    }

    if (messageType === "email" && !emailSubject.trim()) {
      alert("Please enter an email subject.");
      return;
    }

    const emailData =
      messageType === "email"
        ? {
            subject: emailSubject,
            message: message,
            cc: ccRecipients,
            bcc: bccRecipients,
            priority: emailPriority,
            attachments: attachedFiles.map((f) => f.file.name),
            scheduledFor:
              showSchedule && scheduleDate && scheduleTime
                ? `${scheduleDate} ${scheduleTime}`
                : null,
          }
        : { message };

    console.log("Sending message:", {
      messageType,
      selectedGroups,
      ...emailData,
    });

    alert(
      showSchedule && scheduleDate && scheduleTime
        ? `Message scheduled for ${scheduleDate} at ${scheduleTime} to ${selectedGroups.length} group(s)!`
        : `Message sent to ${selectedGroups.length} group(s)!`
    );

    // Reset form
    setMessage("");
    if (emailEditorRef.current) emailEditorRef.current.innerHTML = "";
    setEmailSubject("");
    setCcRecipients("");
    setBccRecipients("");
    setEmailPriority("normal");
    setAttachedFiles([]);
    setShowSchedule(false);
    setScheduleDate("");
    setScheduleTime("");
    setSelectedGroups([]);
  };

  const filteredGroups = useMemo(() => {
    const q = groupSearch.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
    );
  }, [groups, groupSearch]);

  const canSend =
    (messageType === "email"
      ? (emailEditorRef.current?.textContent?.trim() || "").length > 0
      : message.trim().length > 0) &&
    selectedGroups.length > 0 &&
    (messageType !== "email" || emailSubject.trim().length > 0);

  const SelectedGroupChips = (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {groups
        .filter((g) => selectedGroups.includes(g.id))
        .map((group) => (
          <Chip
            key={group.id}
            label={`${group.name} (${group.count})`}
            onDelete={() => toggleGroup(group.id)}
            color="primary"
            sx={{
              "& .MuiChip-deleteIcon": { opacity: 1 },
            }}
          />
        ))}
    </Stack>
  );

  return (
    <Box>
      <SamplePageOverlay />

      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5, color: "text.primary" }}>
            Compose Message
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Send emails, SMS messages, and robocalls to selected groups
          </Typography>
        </Box>

        {/* Quick Send via Text Alert - Show only for SMS and Calls */}
        {(messageType === "sms" || messageType === "call") &&
          selectedGroups.length > 0 && (
            <Alert
              icon={<Smartphone size={18} />}
              severity="info"
              sx={{
                bgcolor: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#0f172a",
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Quick Send:</strong> Text{" "}
                <strong style={{ fontFamily: "monospace" }}>
                  +1 (833) 000-0000
                </strong>{" "}
                with PIN + your message
              </Typography>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                {groups
                  .filter((g) => selectedGroups.includes(g.id))
                  .map((group) => (
                    <Box
                      key={group.id}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.75,
                        fontSize: 12,
                        bgcolor: "white",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <Hash size={14} />
                      <Box component="span" sx={{ fontFamily: "monospace" }}>
                        {group.pin}
                      </Box>
                      <Box component="span" sx={{ color: "text.disabled" }}>
                        →
                      </Box>
                      <Box component="span" sx={{ color: "text.secondary" }}>
                        {group.name}
                      </Box>
                    </Box>
                  ))}
              </Stack>

              <Box
                sx={{
                  display: "inline-block",
                  fontFamily: "monospace",
                  fontSize: 12,
                  bgcolor: "white",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  border: "1px solid #bfdbfe",
                  color: "text.secondary",
                }}
              >
                Example:{" "}
                {groups.find((g) => selectedGroups.includes(g.id))?.pin} School
                closes early today at 2pm
              </Box>
            </Alert>
          )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 2.5,
          }}
        >
          {/* Message Composition */}
          <Card>
            <CardContent sx={{ pt: 3 }}>
              <Stack spacing={2.5}>
                {/* Message Type Selection */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Message Type
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1.5,
                    }}
                  >
                    <Button
                      variant={messageType === "email" ? "contained" : "outlined"}
                      onClick={() => setMessageType("email")}
                      sx={{ py: 2, display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Mail size={22} />
                      Email
                    </Button>

                    <Button
                      variant={messageType === "sms" ? "contained" : "outlined"}
                      onClick={() => setMessageType("sms")}
                      sx={{ py: 2, display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <MessageSquare size={22} />
                      SMS
                    </Button>

                    <Button
                      variant={messageType === "call" ? "contained" : "outlined"}
                      onClick={() => setMessageType("call")}
                      sx={{ py: 2, display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Phone size={22} />
                      Robocall
                    </Button>
                  </Box>
                </Box>

                {/* Selected Groups Display */}
                {selectedGroups.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Selected Groups
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 2,
                      }}
                    >
                      {SelectedGroupChips}
                    </Box>
                  </Box>
                )}

                {/* Robocall Recording Method */}
                {messageType === "call" && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                      Recording Method
                    </Typography>

                    <Stack spacing={1.25}>
                      {[
                        {
                          key: "text-to-speech" as const,
                          title: "Text-to-Speech",
                          desc:
                            "Type your message and it will be converted to speech automatically",
                          Icon: Volume2,
                          iconColor: "#2563eb",
                        },
                        {
                          key: "call-to-record" as const,
                          title: "Call Me to Record",
                          desc: "Receive a call and record your message over the phone",
                          Icon: PhoneCall,
                          iconColor: "#16a34a",
                        },
                        {
                          key: "device-record" as const,
                          title: "Record on Device",
                          desc: "Use your device's microphone to record the message now",
                          Icon: Mic,
                          iconColor: "#7c3aed",
                        },
                        {
                          key: "saved-file" as const,
                          title: "Use Saved Audio File",
                          desc:
                            "Select from previously recorded or uploaded audio files",
                          Icon: Upload,
                          iconColor: "#ea580c",
                        },
                      ].map(({ key, title, desc, Icon, iconColor }) => {
                        const selected = recordingMethod === key;
                        return (
                          <Box
                            key={key}
                            onClick={() => setRecordingMethod(key)}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: "2px solid",
                              borderColor: selected ? "#2563eb" : "#d1d5db",
                              bgcolor: selected ? "#eff6ff" : "transparent",
                              cursor: "pointer",
                              transition: "all 120ms ease",
                              "&:hover": {
                                borderColor: selected ? "#2563eb" : "#9ca3af",
                              },
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                              <input
                                type="radio"
                                checked={selected}
                                onChange={() => setRecordingMethod(key)}
                                style={{ marginTop: 4 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                  <Icon size={20} color={iconColor} />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                    {title}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  {desc}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* Call to Record - Phone Number Input */}
                {messageType === "call" && recordingMethod === "call-to-record" && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#ecfdf5",
                      border: "1px solid #bbf7d0",
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Typography variant="subtitle2">Your Phone Number</Typography>
                      <TextField
                        fullWidth
                        placeholder="(555) 123-4567"
                        type="tel"
                        size="small"
                        sx={{ bgcolor: "white" }}
                      />
                      <Button
                        variant="contained"
                        sx={{ bgcolor: "#16a34a", "&:hover": { bgcolor: "#15803d" } }}
                        fullWidth
                      >
                        <PhoneCall size={16} style={{ marginRight: 8 }} />
                        Call Me Now to Record
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        You'll receive a call within 30 seconds. Follow the prompts to
                        record your message.
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Device Recording Interface */}
                {messageType === "call" && recordingMethod === "device-record" && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#f5f3ff",
                      border: "1px solid #ddd6fe",
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">Voice Recording</Typography>
                        <Badge
                          badgeContent={formatTime(recordingTime)}
                          color={isRecording ? "error" : "default"}
                          sx={{
                            "& .MuiBadge-badge": {
                              fontFamily: "monospace",
                              fontSize: 12,
                              px: 1,
                              py: 0.5,
                            },
                          }}
                        />
                      </Stack>

                      <Alert severity="info" sx={{ bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                        <Typography variant="caption" sx={{ display: "block" }}>
                          <strong>Note:</strong> A microphone is required for this option.
                          If you don't have a microphone, please use "Call to Record" or
                          "Use Saved Audio File" instead.
                        </Typography>
                      </Alert>

                      {!audioUrl ? (
                        <Button
                          variant="contained"
                          onClick={isRecording ? stopRecording : startRecording}
                          sx={{
                            bgcolor: isRecording ? "#dc2626" : "#7c3aed",
                            "&:hover": { bgcolor: isRecording ? "#b91c1c" : "#6d28d9" },
                          }}
                        >
                          {isRecording ? (
                            <>
                              <Square size={16} style={{ marginRight: 8 }} />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic size={16} style={{ marginRight: 8 }} />
                              Start Recording
                            </>
                          )}
                        </Button>
                      ) : (
                        <Stack spacing={1}>
                          <Alert severity="success" sx={{ bgcolor: "#ecfdf5", border: "1px solid #bbf7d0" }}>
                            <Typography variant="body2">
                              ✓ Recording saved ({formatTime(recordingTime)})
                            </Typography>
                          </Alert>

                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Button variant="outlined" onClick={playRecording}>
                              {isPlaying ? (
                                <>
                                  <Square size={16} style={{ marginRight: 8 }} />
                                  Stop Playback
                                </>
                              ) : (
                                <>
                                  <Play size={16} style={{ marginRight: 8 }} />
                                  Play Recording
                                </>
                              )}
                            </Button>
                            <Button variant="outlined" onClick={clearRecording}>
                              Re-record
                            </Button>
                          </Stack>
                        </Stack>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        {!audioUrl
                          ? 'Click "Start Recording" and speak your message. Maximum duration: 2 minutes.'
                          : "Preview your recording or re-record if needed."}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Saved Audio File Selection */}
                {messageType === "call" && recordingMethod === "saved-file" && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={1.25}>
                      <Typography variant="subtitle2">Select Audio File</Typography>

                      <Select
                        size="small"
                        fullWidth
                        value={selectedAudioFile}
                        onChange={(e) => setSelectedAudioFile(String(e.target.value))}
                        sx={{ bgcolor: "white" }}
                      >
                        <MenuItem value="">Choose a saved audio file...</MenuItem>
                        <MenuItem value="1">Snow Day Announcement - Nov 20, 2024</MenuItem>
                        <MenuItem value="2">Early Dismissal Message - Nov 15, 2024</MenuItem>
                        <MenuItem value="3">Holiday Greeting - Nov 10, 2024</MenuItem>
                        <MenuItem value="4">Emergency Closure - Nov 5, 2024</MenuItem>
                      </Select>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        {selectedAudioFile && (
                          <Button variant="outlined" fullWidth>
                            <Volume2 size={16} style={{ marginRight: 8 }} />
                            Preview Audio
                          </Button>
                        )}
                        <Button variant="outlined" fullWidth>
                          <Upload size={16} style={{ marginRight: 8 }} />
                          Upload New File
                        </Button>
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        Supported formats: MP3, WAV, M4A. Maximum file size: 10MB.
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Email-Specific Fields */}
                {messageType === "email" && (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Subject
                      </Typography>
                      <TextField
                        fullWidth
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        size="small"
                      />
                    </Box>

                    <Box>
                      <Button
                        variant="text"
                        onClick={() => setShowCcBcc((v) => !v)}
                        sx={{ px: 0, textTransform: "none" }}
                      >
                        {showCcBcc ? (
                          <ChevronUp size={16} style={{ marginRight: 6 }} />
                        ) : (
                          <ChevronDown size={16} style={{ marginRight: 6 }} />
                        )}
                        {showCcBcc ? "Hide" : "Add"} CC/BCC
                      </Button>

                      {showCcBcc && (
                        <Box sx={{ borderLeft: "2px solid #e5e7eb", pl: 2, mt: 1 }}>
                          <Stack spacing={1.25}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                CC (Optional)
                              </Typography>
                              <TextField
                                fullWidth
                                size="small"
                                value={ccRecipients}
                                onChange={(e) => setCcRecipients(e.target.value)}
                                placeholder="email@example.com, another@example.com"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>

                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                BCC (Optional)
                              </Typography>
                              <TextField
                                fullWidth
                                size="small"
                                value={bccRecipients}
                                onChange={(e) => setBccRecipients(e.target.value)}
                                placeholder="email@example.com, another@example.com"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        bgcolor: "#f9fafb",
                        borderRadius: 2,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AlertCircle size={16} color="#ea580c" />
                        <Typography variant="body2">Mark as High Priority</Typography>
                      </Stack>
                      <Switch
                        checked={emailPriority === "high"}
                        onChange={(e) => setEmailPriority(e.target.checked ? "high" : "normal")}
                      />
                    </Box>

                    <Box>
                      <Button
                        variant="text"
                        onClick={() => setShowSchedule((v) => !v)}
                        sx={{ px: 0, textTransform: "none" }}
                      >
                        <Clock size={16} style={{ marginRight: 6 }} />
                        {showSchedule ? "Cancel" : "Schedule"} Send
                      </Button>

                      {showSchedule && (
                        <Box sx={{ borderLeft: "2px solid #e5e7eb", pl: 2, mt: 1 }}>
                          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Date
                              </Typography>
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Time
                              </Typography>
                              <TextField
                                fullWidth
                                size="small"
                                type="time"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                )}

                {/* Message Content - Text to Speech Only */}
                {messageType !== "call" || recordingMethod === "text-to-speech" ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Message
                    </Typography>

                    {/* Rich Text Formatting Toolbar - Email Only */}
                    {messageType === "email" && (
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          p: 1,
                          bgcolor: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderBottom: "none",
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                        }}
                      >
                        <Tooltip title="Bold">
                          <IconButton
                            size="small"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting("bold");
                            }}
                            sx={{
                              bgcolor: activeFormats.bold ? "#dbeafe" : "transparent",
                              boxShadow: activeFormats.bold ? 2 : 0,
                            }}
                          >
                            <Bold size={16} color={activeFormats.bold ? "#2563eb" : undefined} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Italic">
                          <IconButton
                            size="small"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting("italic");
                            }}
                            sx={{
                              bgcolor: activeFormats.italic ? "#dbeafe" : "transparent",
                              boxShadow: activeFormats.italic ? 2 : 0,
                            }}
                          >
                            <Italic size={16} color={activeFormats.italic ? "#2563eb" : undefined} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Underline">
                          <IconButton
                            size="small"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applyFormatting("underline");
                            }}
                            sx={{
                              bgcolor: activeFormats.underline ? "#dbeafe" : "transparent",
                              boxShadow: activeFormats.underline ? 2 : 0,
                            }}
                          >
                            <Underline size={16} color={activeFormats.underline ? "#2563eb" : undefined} />
                          </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        <Tooltip title="Bullet List">
                          <IconButton
                            size="small"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertList(false);
                            }}
                            sx={{
                              bgcolor: activeFormats.unorderedList ? "#dbeafe" : "transparent",
                              boxShadow: activeFormats.unorderedList ? 2 : 0,
                            }}
                          >
                            <List size={16} color={activeFormats.unorderedList ? "#2563eb" : undefined} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Numbered List">
                          <IconButton
                            size="small"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertList(true);
                            }}
                            sx={{
                              bgcolor: activeFormats.orderedList ? "#dbeafe" : "transparent",
                              boxShadow: activeFormats.orderedList ? 2 : 0,
                            }}
                          >
                            <ListOrdered size={16} color={activeFormats.orderedList ? "#2563eb" : undefined} />
                          </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        <Tooltip title="Insert Link">
                          <IconButton
                            size="small"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              insertLink();
                            }}
                          >
                            <LinkIcon size={16} />
                          </IconButton>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        <Button
                          size="small"
                          variant="text"
                          onClick={() => fileInputRef.current?.click()}
                          sx={{ textTransform: "none" }}
                        >
                          <Paperclip size={16} style={{ marginRight: 6 }} />
                          Attach
                        </Button>
                      </Box>
                    )}

                    {messageType === "email" ? (
                      <Box sx={{ position: "relative" }}>
                        <Box
                          ref={emailEditorRef}
                          contentEditable
                          onInput={handleEditorInput}
                          onBlur={saveSelection}
                          onMouseUp={saveSelection}
                          onKeyUp={saveSelection}
                          suppressContentEditableWarning
                          data-placeholder="Type your email message here... Use the toolbar above to format text."
                          sx={{
                            minHeight: 200,
                            p: 1.5,
                            border: "1px solid #e5e7eb",
                            borderBottomLeftRadius: 8,
                            borderBottomRightRadius: 8,
                            outline: "none",
                            overflowY: "auto",
                            whiteSpace: "pre-wrap",
                            "&:focus": { boxShadow: "0 0 0 2px rgba(59,130,246,.35)" },
                          }}
                        />
                        <style>{`
                          [contenteditable][data-placeholder]:empty:before {
                            content: attr(data-placeholder);
                            color: #9ca3af;
                            pointer-events: none;
                            position: absolute;
                          }
                          [contenteditable] a {
                            color: #2563eb;
                            text-decoration: underline;
                          }
                          [contenteditable] ul,
                          [contenteditable] ol {
                            margin: 0.5em 0;
                            padding-left: 2em;
                          }
                          [contenteditable] ul { list-style-type: disc; }
                          [contenteditable] ol { list-style-type: decimal; }
                          [contenteditable] li { margin: 0.25em 0; }
                        `}</style>
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        multiline
                        minRows={messageType === "sms" ? 6 : 8}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          messageType === "call"
                            ? "Enter the message to be read in the robocall..."
                            : "Enter your SMS message (160 characters recommended)..."
                        }
                      />
                    )}

                    {messageType === "sms" && (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mt: 1 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Character count: {message.length}
                        </Typography>
                        {message.length > 160 && (
                          <Typography variant="caption" sx={{ color: "#ea580c" }}>
                            Multiple messages ({Math.ceil(message.length / 160)})
                          </Typography>
                        )}
                      </Stack>
                    )}

                    {/* Hidden File Input + Attachments */}
                    {messageType === "email" && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          style={{ display: "none" }}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                        />

                        {attachedFiles.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Attached Files ({attachedFiles.length})
                              </Typography>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => fileInputRef.current?.click()}
                                sx={{ textTransform: "none" }}
                              >
                                <Paperclip size={14} style={{ marginRight: 6 }} />
                                Add More
                              </Button>
                            </Stack>

                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                gap: 1,
                              }}
                            >
                              {attachedFiles.map((attachedFile) => {
                                const Icon = getFileIcon(attachedFile.file);
                                return (
                                  <Box
                                    key={attachedFile.id}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      p: 1,
                                      bgcolor: "#f9fafb",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: 2,
                                    }}
                                  >
                                    {attachedFile.preview ? (
                                      <Box
                                        component="img"
                                        src={attachedFile.preview}
                                        alt={attachedFile.file.name}
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          objectFit: "cover",
                                          borderRadius: 1,
                                          flexShrink: 0,
                                        }}
                                      />
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 1,
                                          bgcolor: "#e5e7eb",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexShrink: 0,
                                        }}
                                      >
                                        <Icon size={18} />
                                      </Box>
                                    )}

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography variant="body2" noWrap>
                                        {attachedFile.file.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatFileSize(attachedFile.file.size)}
                                      </Typography>
                                    </Box>

                                    <IconButton
                                      size="small"
                                      onClick={() => removeFile(attachedFile.id)}
                                    >
                                      <X size={16} />
                                    </IconButton>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                ) : null}

                {/* Send Button */}
                <Divider />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Recipients:{" "}
                      <Box component="span" sx={{ color: "text.primary" }}>
                        {getTotalRecipients()}
                      </Box>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""} selected
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {messageType === "email" && attachedFiles.length > 0 && (
                      <Chip
                        variant="outlined"
                        label={`${attachedFiles.length} file${attachedFiles.length !== 1 ? "s" : ""}`}
                        icon={<Paperclip size={16} />}
                      />
                    )}

                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!canSend}
                      sx={{
                        bgcolor: "#1d4ed8",
                        "&:hover": { bgcolor: "#1e40af" },
                      }}
                    >
                      {showSchedule && scheduleDate && scheduleTime ? (
                        <>
                          <Clock size={16} style={{ marginRight: 8 }} />
                          Schedule{" "}
                          {messageType === "email"
                            ? "Email"
                            : messageType === "sms"
                            ? "SMS"
                            : "Robocall"}
                        </>
                      ) : (
                        <>
                          <Send size={16} style={{ marginRight: 8 }} />
                          Send{" "}
                          {messageType === "email"
                            ? "Email"
                            : messageType === "sms"
                            ? "SMS"
                            : "Robocall"}
                        </>
                      )}
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Group Selection */}
          <Card>
            <CardHeader
              title="Select Recipients"
              subheader="Choose groups to send message to"
              titleTypographyProps={{ variant: "h6" }}
              subheaderTypographyProps={{ variant: "body2" }}
            />
            <CardContent>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  placeholder="Search groups..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={18} />
                      </InputAdornment>
                    ),
                  }}
                />

                {filteredGroups.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    <Typography variant="body2">
                      No groups found matching "{groupSearch}"
                    </Typography>
                  </Box>
                ) : (
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
                              alignItems: "flex-start",
                              gap: 1.25,
                              p: 1.25,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: checked ? "#93c5fd" : "#e5e7eb",
                              bgcolor: checked ? "#eff6ff" : "transparent",
                              cursor: "pointer",
                              "&:hover": { bgcolor: checked ? "#eff6ff" : "#f9fafb" },
                            }}
                          >
                            <Checkbox
                              checked={checked}
                              onChange={() => toggleGroup(group.id)}
                              sx={{ mt: 0.25 }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" noWrap>
                                    {group.name}
                                  </Typography>

                                  {(messageType === "sms" || messageType === "call") && (
                                    <Box
                                      sx={{
                                        fontFamily: "monospace",
                                        fontSize: 12,
                                        color: "#1d4ed8",
                                        bgcolor: "#eff6ff",
                                        px: 0.75,
                                        py: 0.25,
                                        borderRadius: 1,
                                        flexShrink: 0,
                                      }}
                                    >
                                      #{group.pin}
                                    </Box>
                                  )}
                                </Stack>

                                <Chip
                                  size="small"
                                  label={group.count}
                                  sx={{ flexShrink: 0 }}
                                />
                              </Stack>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: { xs: 2, sm: 1 },
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {group.description}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}

