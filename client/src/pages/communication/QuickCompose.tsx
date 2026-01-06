import { useEffect, useRef, useState, useMemo, useCallback } from "react";
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
  Square,
  Play,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
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
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
  Snackbar,
  Checkbox,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";

import api from "../../utils/api";

// ---------- Types ----------

type MessageType = "email" | "sms" | "call";

type RecordingMethod =
  | "text-to-speech"
  | "call-to-record"
  | "device-record"
  | "saved-file";

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

interface Group {
  _id?: string;
  id: string;
  name: string;
  memberCount?: number;
  member_count?: number;
  description?: string;
  pin?: string;
}

interface SavedRecording {
  id: string;
  name: string;
  description?: string;
  audio_gcs_path: string;
  signedUrl?: string;
  duration_seconds?: number;
  created_at: string;
}

// ---------- Component ----------

export default function QuickCompose() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Message type
  const [messageType, setMessageType] = useState<MessageType>("email");

  // Groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const groupsLoadedRef = useRef(false);
  const isFetchingGroupsRef = useRef(false);

  // Message content
  const [message, setMessage] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState("");

  // Email-specific
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccRecipients, setCcRecipients] = useState("");
  const [bccRecipients, setBccRecipients] = useState("");
  const [emailPriority, setEmailPriority] = useState<"normal" | "high">("normal");
  const [fromName, setFromName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [disableReplyTo, setDisableReplyTo] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
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

  // Robocall-specific
  const [recordingMethod, setRecordingMethod] = useState<RecordingMethod>("text-to-speech");
  const [callToRecordPhone, setCallToRecordPhone] = useState("");
  const [callToRecordLoading, setCallToRecordLoading] = useState(false);
  const [callToRecordSessionId, setCallToRecordSessionId] = useState<string | null>(null);
  const [callToRecordStatus, setCallToRecordStatus] = useState<
    "idle" | "calling" | "recording" | "completed" | "failed"
  >("idle");
  const callToRecordPollIntervalRef = useRef<number | null>(null);

  // Device recording
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // File upload
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const [loadingSavedRecordings, setLoadingSavedRecordings] = useState(false);
  const [selectedSavedRecording, setSelectedSavedRecording] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const savedRecordingsLoadedRef = useRef<string>(""); // Track last loaded state
  const isFetchingSavedRecordingsRef = useRef(false);

  // Scheduling
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Loading & errors
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  // ---------- Load Groups ----------

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode (development)
    if (groupsLoadedRef.current || isFetchingGroupsRef.current) return;
    groupsLoadedRef.current = true;
    isFetchingGroupsRef.current = true;

    const loadGroups = async () => {
      try {
        setLoadingGroups(true);
        const { data } = await api.get("/groups");
        setGroups(data.groups || []);
      } catch (error: any) {
        console.error("Error loading groups:", error);
        showSnackbar("Failed to load groups", "error");
      } finally {
        setLoadingGroups(false);
        isFetchingGroupsRef.current = false;
      }
    };

    loadGroups();
  }, []);

  // ---------- Load Saved Recordings ----------

  useEffect(() => {
    if (recordingMethod !== "saved-file" || messageType !== "call") return;

    // Prevent duplicate calls for the same state combination
    const stateKey = `${recordingMethod}-${messageType}`;
    if (savedRecordingsLoadedRef.current === stateKey || isFetchingSavedRecordingsRef.current) {
      return;
    }
    savedRecordingsLoadedRef.current = stateKey;
    isFetchingSavedRecordingsRef.current = true;

    const loadSavedRecordings = async () => {
      try {
        setLoadingSavedRecordings(true);
        const { data } = await api.get("/robocall/saved-recordings");
        setSavedRecordings(data.recordings || []);
      } catch (error: any) {
        console.error("Error loading saved recordings:", error);
        showSnackbar("Failed to load saved recordings", "error");
      } finally {
        setLoadingSavedRecordings(false);
        isFetchingSavedRecordingsRef.current = false;
      }
    };

    loadSavedRecordings();
  }, [recordingMethod, messageType]);

  // ---------- Filtered Groups ----------

  const filteredGroups = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
          g.description?.toLowerCase().includes(groupSearch.toLowerCase())
      ),
    [groups, groupSearch]
  );

  // ---------- Helpers ----------

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const getTotalRecipients = () => {
    return groups
      .filter((g) => selectedGroups.includes(g.id || g._id || ""))
      .reduce((sum, g) => sum + (g.memberCount || g.member_count || 0), 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error("Error starting recording:", error);
      let errorMessage = "Unable to access microphone. ";
      if (error.name === "NotFoundError") {
        errorMessage += "No microphone was found.";
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage += "Microphone access was denied.";
      } else if (error.name === "NotReadableError") {
        errorMessage += "Microphone is already in use.";
      } else {
        errorMessage += "Please check your device settings.";
      }
      showSnackbar(errorMessage, "error");
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

  // ---------- Call-to-Record ----------

  const initiateCallToRecord = async () => {
    if (!callToRecordPhone.trim()) {
      showSnackbar("Please enter a phone number", "warning");
      return;
    }

    try {
      setCallToRecordLoading(true);
      setCallToRecordStatus("calling");
      const { data } = await api.post("/robocall/call-to-record", {
        phoneNumber: callToRecordPhone.trim(),
      });
      setCallToRecordSessionId(data.sessionId);
      setCallToRecordStatus("recording");

      // Poll for status
      const pollStatus = async () => {
        try {
          const res = await api.get(`/robocall/call-to-record/${data.sessionId}`);
          const status = res.data.status;

          if (status === "completed") {
            setCallToRecordStatus("completed");
            if (callToRecordPollIntervalRef.current) {
              clearInterval(callToRecordPollIntervalRef.current);
            }
            showSnackbar("Recording completed! You can now send the robocall.", "success");
          } else if (status === "failed") {
            setCallToRecordStatus("failed");
            if (callToRecordPollIntervalRef.current) {
              clearInterval(callToRecordPollIntervalRef.current);
            }
            showSnackbar("Recording failed. Please try again.", "error");
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            // Session not found, stop polling
            if (callToRecordPollIntervalRef.current) {
              clearInterval(callToRecordPollIntervalRef.current);
            }
            setCallToRecordStatus("failed");
          }
        }
      };

      callToRecordPollIntervalRef.current = window.setInterval(pollStatus, 2000);
    } catch (error: any) {
      console.error("Error initiating call-to-record:", error);
      setCallToRecordStatus("failed");
      showSnackbar(
        error?.response?.data?.message || "Failed to initiate call. Please try again.",
        "error"
      );
    } finally {
      setCallToRecordLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (callToRecordPollIntervalRef.current) {
        clearInterval(callToRecordPollIntervalRef.current);
      }
    };
  }, []);

  // ---------- File Upload ----------

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)) {
      showSnackbar("Please select an audio file (MP3, WAV, M4A, OGG, or WebM)", "warning");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showSnackbar("File size must be less than 10MB", "warning");
      return;
    }

    setUploadedAudio(file);
    setSelectedSavedRecording(null);

    try {
      const url = URL.createObjectURL(file);
      setUploadedAudioUrl(url);
    } catch (error) {
      console.error("Error creating object URL:", error);
      showSnackbar("Error loading audio file", "error");
    }
  };

  // ---------- Email Editor ----------

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
    updateActiveFormats();
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current && emailEditorRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
      emailEditorRef.current.focus();
    }
  };

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
    } catch (e) {
      // ignore
    }
  };

  const applyFormatting = (command: string, value?: string) => {
    if (messageType !== "email" || !emailEditorRef.current) return;
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    setMessage(emailEditorRef.current.innerHTML);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      applyFormatting("createLink", url);
    }
  };

  const insertList = (ordered: boolean) => {
    if (!emailEditorRef.current) return;
    emailEditorRef.current.focus();
    const command = ordered ? "insertOrderedList" : "insertUnorderedList";
    document.execCommand(command, false, undefined);
    setMessage(emailEditorRef.current.innerHTML);
    saveSelection();
  };

  // ---------- File Attachments ----------

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const addFiles = (files: File[]) => {
    const newFiles: AttachedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
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
    return FileIcon;
  };

  // ---------- Convert Audio to Base64 ----------

  const audioToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // ---------- Send Handlers ----------

  const handleSend = async () => {
    if (selectedGroups.length === 0) {
      showSnackbar("Please select at least one group", "warning");
      return;
    }

    // Validate scheduling
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

      if (messageType === "email") {
        await handleSendEmail();
      } else if (messageType === "sms") {
        await handleSendSMS();
      } else if (messageType === "call") {
        await handleSendRobocall();
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      showSnackbar(error?.response?.data?.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async () => {
    const messageContent = emailEditorRef.current?.innerHTML || message.trim();
    if (!messageContent || !emailSubject.trim()) {
      showSnackbar("Please enter a subject and message", "warning");
      return;
    }

    // Convert attachments to base64 format (same as SendEmail)
    const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    const payload: any = {
      groupIds: selectedGroups,
      subject: emailSubject.trim(),
      html: messageContent, // Use 'html' instead of 'message' to match SendEmail
      priority: emailPriority,
    };

    // Add from name and reply-to settings if provided
    if (fromName.trim()) {
      payload.fromName = fromName.trim();
    }

    if (disableReplyTo) {
      payload.disableReplyTo = true;
    } else if (replyTo.trim()) {
      payload.replyTo = replyTo.trim();
    }

    // Add CC and BCC (use comma-separated string format like SendEmail)
    if (ccRecipients.trim()) {
      payload.cc = ccRecipients.trim();
    }
    if (bccRecipients.trim()) {
      payload.bcc = bccRecipients.trim();
    }

    // Process attachments - convert to base64 (same as SendEmail)
    if (attachedFiles.length > 0) {
      const attachments = await Promise.all(
        attachedFiles.map(async (attachedFile) => {
          const content = await fileToBase64(attachedFile.file);
          return {
            content,
            filename: attachedFile.file.name,
            type: attachedFile.file.type || "application/octet-stream",
          };
        })
      );
      payload.attachments = attachments;
    }

    // Add scheduledFor if scheduling
    if (showSchedule && scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      payload.scheduledFor = scheduledDateTime.toISOString();
    }

    // Use the same endpoint as SendEmail
    await api.post("/email/send/group", payload);

    if (showSchedule && scheduleDate && scheduleTime) {
      showSnackbar(`Email scheduled for ${scheduleDate} at ${scheduleTime}`, "success");
    } else {
      showSnackbar("Email sent successfully!", "success");
    }

    // Reset form
    resetForm();
  };

  const handleSendSMS = async () => {
    if (!message.trim()) {
      showSnackbar("Please enter a message", "warning");
      return;
    }

    const payload: any = {
      groupIds: selectedGroups,
      message: message.trim(),
    };

    if (manualPhoneNumbers.trim()) {
      payload.manualPhoneNumbers = manualPhoneNumbers
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
    }

    if (showSchedule && scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      payload.scheduledFor = scheduledDateTime.toISOString();
      await api.post("/sms/schedule", payload);
      showSnackbar(`SMS scheduled for ${scheduleDate} at ${scheduleTime}`, "success");
    } else {
      for (const groupId of selectedGroups) {
        await api.post("/sms/send/group", { groupId, message: message.trim() });
      }
      if (manualPhoneNumbers.trim()) {
        await api.post("/sms/send/manual", {
          phoneNumbers: manualPhoneNumbers.split(",").map((p) => p.trim()),
          message: message.trim(),
        });
      }
      showSnackbar("SMS sent successfully!", "success");
    }

    resetForm();
  };

  const handleSendRobocall = async () => {
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
      if (!message.trim()) {
        showSnackbar("Please enter a message for text-to-speech", "warning");
        return;
      }
      payload.textContent = message.trim();
    } else if (recordingMethod === "device-record" && audioBlob) {
      try {
        const base64 = await audioToBase64(audioBlob);
        payload.audioFile = base64;
        // Include the blob type so server knows the format
        payload.audioFileType = audioBlob.type || "audio/webm";
      } catch (error: any) {
        console.error("Error converting audio to base64:", error);
        showSnackbar("Error processing recording. Please try recording again.", "error");
        return;
      }
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

    resetForm();
  };

  const resetForm = () => {
    setMessage("");
    setEmailSubject("");
    setCcRecipients("");
    setBccRecipients("");
    setAttachedFiles([]);
    setShowSchedule(false);
    setScheduleDate("");
    setScheduleTime("");
    setSelectedGroups([]);
    if (emailEditorRef.current) {
      emailEditorRef.current.innerHTML = "";
    }
    clearRecording();
    setUploadedAudio(null);
    setSelectedSavedRecording(null);
    setCallToRecordStatus("idle");
    setCallToRecordSessionId(null);
  };

  // Cleanup
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
      attachedFiles.forEach((f) => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview);
        }
      });
    };
  }, [audioUrl, uploadedAudioUrl, attachedFiles]);

  // Character count for SMS
  const smsCharCount = message.length;
  const smsSegments = Math.ceil(smsCharCount / 160) || 1;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: "auto" }}>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
        {/* Main Composition Area */}
        <Card>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              {/* Message Type Selection */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Message Type
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant={messageType === "email" ? "contained" : "outlined"}
                    onClick={() => setMessageType("email")}
                    startIcon={<Mail size={18} />}
                    sx={{ flex: 1 }}
                  >
                    Email
                  </Button>
                  <Button
                    variant={messageType === "sms" ? "contained" : "outlined"}
                    onClick={() => setMessageType("sms")}
                    startIcon={<MessageSquare size={18} />}
                    sx={{ flex: 1 }}
                  >
                    SMS
                  </Button>
                  <Button
                    variant={messageType === "call" ? "contained" : "outlined"}
                    onClick={() => setMessageType("call")}
                    startIcon={<Phone size={18} />}
                    sx={{ flex: 1 }}
                  >
                    Robocall
                  </Button>
                </Stack>
              </Box>

              {/* Selected Groups Display */}
              {selectedGroups.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Selected Groups
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {groups
                      .filter((g) => selectedGroups.includes(g.id || g._id || ""))
                      .map((g) => {
                        const count = g.memberCount || g.member_count || 0;
                        return (
                          <Chip
                            key={g.id || g._id}
                            label={`${g.name} (${count})`}
                            onDelete={() => toggleGroup(g.id || g._id || "")}
                            color="primary"
                            size="small"
                          />
                        );
                      })}
                  </Stack>
                </Box>
              )}

              {/* Robocall Recording Method */}
              {messageType === "call" && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Recording Method
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      { value: "text-to-speech", label: "Text-to-Speech", icon: Volume2 },
                      { value: "call-to-record", label: "Call Me to Record", icon: PhoneCall },
                      { value: "device-record", label: "Record on Device", icon: Mic },
                      { value: "saved-file", label: "Use Saved File", icon: Upload },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = recordingMethod === method.value;
                      return (
                        <Box
                          key={method.value}
                          onClick={() => setRecordingMethod(method.value as RecordingMethod)}
                          sx={{
                            p: 2,
                            border: 2,
                            borderRadius: 2,
                            cursor: "pointer",
                            borderColor: isSelected ? "primary.main" : "divider",
                            bgcolor: isSelected ? "primary.50" : "transparent",
                            "&:hover": {
                              borderColor: isSelected ? "primary.main" : "primary.light",
                            },
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ cursor: "pointer" }}
                            />
                            <Icon size={20} color={isSelected ? theme.palette.primary.main : undefined} />
                            <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                              {method.label}
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {/* Call-to-Record Phone Input */}
              {messageType === "call" && recordingMethod === "call-to-record" && (
                <Alert severity="info" sx={{ bgcolor: "info.50" }}>
                  <Stack spacing={2}>
                    <TextField
                      label="Your Phone Number"
                      type="tel"
                      value={callToRecordPhone}
                      onChange={(e) => setCallToRecordPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      fullWidth
                      size="small"
                      disabled={
                        callToRecordStatus === "calling" ||
                        callToRecordStatus === "recording" ||
                        callToRecordLoading
                      }
                    />
                    <Button
                      variant="contained"
                      color="success"
                      onClick={initiateCallToRecord}
                      disabled={
                        !callToRecordPhone.trim() ||
                        callToRecordStatus === "calling" ||
                        callToRecordStatus === "recording" ||
                        callToRecordLoading
                      }
                      startIcon={
                        callToRecordLoading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <PhoneCall size={18} />
                        )
                      }
                      fullWidth
                    >
                      {callToRecordStatus === "calling"
                        ? "Calling..."
                        : callToRecordStatus === "recording"
                        ? "Recording..."
                        : "Call Me Now to Record"}
                    </Button>
                    {callToRecordStatus === "completed" && (
                      <Alert severity="success">Recording completed! You can now send the robocall.</Alert>
                    )}
                    {callToRecordStatus === "failed" && (
                      <Alert severity="error">Recording failed. Please try again.</Alert>
                    )}
                  </Stack>
                </Alert>
              )}

              {/* Device Recording Interface */}
              {messageType === "call" && recordingMethod === "device-record" && (
                <Alert severity="info" sx={{ bgcolor: "info.50" }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" fontWeight={600}>
                        Voice Recording
                      </Typography>
                      <Chip label={formatTime(recordingTime)} size="small" color={isRecording ? "error" : "default"} />
                    </Box>
                    {!hasRecording ? (
                      <Button
                        variant="contained"
                        color={isRecording ? "error" : "primary"}
                        onClick={isRecording ? stopRecording : startRecording}
                        startIcon={isRecording ? <Square size={18} /> : <Mic size={18} />}
                        fullWidth
                      >
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </Button>
                    ) : (
                      <Stack spacing={1}>
                        <Alert severity="success">Recording saved ({formatTime(recordingTime)})</Alert>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              if (audioUrl) {
                                if (!audioPlayerRef.current) {
                                  audioPlayerRef.current = new Audio(audioUrl);
                                }
                                audioPlayerRef.current.play();
                              }
                            }}
                            startIcon={<Play size={18} />}
                            sx={{ flex: 1 }}
                          >
                            Play
                          </Button>
                          <Button variant="outlined" onClick={clearRecording} sx={{ flex: 1 }}>
                            Re-record
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Alert>
              )}

              {/* Saved File Selection */}
              {messageType === "call" && recordingMethod === "saved-file" && (
                <Alert severity="info" sx={{ bgcolor: "info.50" }}>
                  <Stack spacing={2}>
                    {loadingSavedRecordings ? (
                      <CircularProgress size={24} />
                    ) : (
                      <>
                        <TextField
                          select
                          label="Select Saved Recording"
                          value={selectedSavedRecording || ""}
                          onChange={(e) => {
                            setSelectedSavedRecording(e.target.value);
                            setUploadedAudio(null);
                          }}
                          fullWidth
                          size="small"
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="">Choose a saved recording...</option>
                          {savedRecordings.map((recording) => (
                            <option key={recording.id} value={recording.id}>
                              {recording.name} - {new Date(recording.created_at).toLocaleDateString()}
                            </option>
                          ))}
                        </TextField>
                        <Divider>OR</Divider>
                        <input
                          ref={audioInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioFileSelect}
                          style={{ display: "none" }}
                        />
                        <Button
                          variant="outlined"
                          onClick={() => audioInputRef.current?.click()}
                          startIcon={<Upload size={18} />}
                          fullWidth
                        >
                          Upload Audio File
                        </Button>
                        {uploadedAudio && (
                          <Alert severity="success">
                            File selected: {uploadedAudio.name}
                            {uploadedAudioUrl && (
                              <Box sx={{ mt: 1 }}>
                                <audio
                                  src={uploadedAudioUrl}
                                  controls
                                  style={{ width: "100%" }}
                                  key={uploadedAudioUrl}
                                />
                              </Box>
                            )}
                          </Alert>
                        )}
                      </>
                    )}
                  </Stack>
                </Alert>
              )}

              {/* Email Subject */}
              {messageType === "email" && (
                <TextField
                  label="Subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  fullWidth
                  required
                />
              )}

              {/* CC/BCC Toggle */}
              {messageType === "email" && (
                <Box>
                  <Button
                    size="small"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    startIcon={showCcBcc ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  >
                    {showCcBcc ? "Hide" : "Add"} CC/BCC
                  </Button>
                  {showCcBcc && (
                    <Stack spacing={2} sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: "divider" }}>
                      <TextField
                        label="CC (Optional)"
                        value={ccRecipients}
                        onChange={(e) => setCcRecipients(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="BCC (Optional)"
                        value={bccRecipients}
                        onChange={(e) => setBccRecipients(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        fullWidth
                        size="small"
                      />
                    </Stack>
                  )}
                </Box>
              )}

              {/* Email Priority */}
              {messageType === "email" && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailPriority === "high"}
                      onChange={(e) => setEmailPriority(e.target.checked ? "high" : "normal")}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AlertCircle size={16} />
                      <Typography variant="body2">Mark as High Priority</Typography>
                    </Stack>
                  }
                />
              )}

              {/* Message Content */}
              {(messageType !== "call" || recordingMethod === "text-to-speech") && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Message
                  </Typography>

                  {/* Rich Text Toolbar - Email Only */}
                  {messageType === "email" && (
                    <Box
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderBottom: "none",
                        borderRadius: "4px 4px 0 0",
                        p: 0.5,
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        bgcolor: "grey.50",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => applyFormatting("bold")}
                        sx={{ bgcolor: activeFormats.bold ? "primary.100" : "transparent" }}
                      >
                        <Bold size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => applyFormatting("italic")}
                        sx={{ bgcolor: activeFormats.italic ? "primary.100" : "transparent" }}
                      >
                        <Italic size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => applyFormatting("underline")}
                        sx={{ bgcolor: activeFormats.underline ? "primary.100" : "transparent" }}
                      >
                        <Underline size={16} />
                      </IconButton>
                      <Divider orientation="vertical" flexItem />
                      <IconButton
                        size="small"
                        onClick={() => insertList(false)}
                        sx={{ bgcolor: activeFormats.unorderedList ? "primary.100" : "transparent" }}
                      >
                        <List size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => insertList(true)}
                        sx={{ bgcolor: activeFormats.orderedList ? "primary.100" : "transparent" }}
                      >
                        <ListOrdered size={16} />
                      </IconButton>
                      <Divider orientation="vertical" flexItem />
                      <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={16} />
                      </IconButton>
                    </Box>
                  )}

                  {/* Email Editor */}
                  {messageType === "email" ? (
                    <Box sx={{ position: "relative" }}>
                      <Box
                        ref={emailEditorRef}
                        contentEditable
                        onInput={(e) => {
                          setMessage(e.currentTarget.innerHTML);
                        }}
                        onBlur={saveSelection}
                        onMouseUp={saveSelection}
                        onKeyUp={saveSelection}
                        sx={{
                          minHeight: 200,
                          p: 2,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: "0 0 4px 4px",
                          outline: "none",
                          "&:focus": {
                            borderColor: "primary.main",
                            borderWidth: 2,
                          },
                          "& a": {
                            color: "primary.main",
                            textDecoration: "underline",
                          },
                          "& ul, & ol": {
                            margin: "0.5em 0",
                            paddingLeft: "2em",
                          },
                          "&:empty:before": {
                            content: '"Type your email message here..."',
                            color: "text.disabled",
                            pointerEvents: "none",
                            position: "absolute",
                          },
                        }}
                        suppressContentEditableWarning
                      />
                    </Box>
                  ) : (
                    <TextField
                      multiline
                      rows={messageType === "sms" ? 6 : 8}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        messageType === "call"
                          ? "Enter the message to be read in the robocall..."
                          : "Enter your SMS message (160 characters recommended)..."
                      }
                      fullWidth
                    />
                  )}

                  {/* SMS Character Count */}
                  {messageType === "sms" && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Characters: {smsCharCount}
                      </Typography>
                      {smsCharCount > 160 && (
                        <Typography variant="caption" color="warning.main">
                          Multiple messages ({smsSegments})
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* Manual Phone Numbers - SMS & Robocall */}
              {(messageType === "sms" || messageType === "call") && (
                <TextField
                  label="Manual Phone Numbers (Optional)"
                  value={manualPhoneNumbers}
                  onChange={(e) => setManualPhoneNumbers(e.target.value)}
                  placeholder="+1234567890, +0987654321"
                  fullWidth
                  helperText="Enter phone numbers separated by commas"
                />
              )}

              {/* File Attachments - Email Only */}
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
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Attached Files ({attachedFiles.length})
                      </Typography>
                      <Stack spacing={1}>
                        {attachedFiles.map((file) => {
                          const FileIcon = getFileIcon(file.file);
                          return (
                            <Box
                              key={file.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1.5,
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                                bgcolor: "grey.50",
                              }}
                            >
                              {file.preview ? (
                                <Box
                                  component="img"
                                  src={file.preview}
                                  alt={file.file.name}
                                  sx={{ width: 40, height: 40, objectFit: "cover", borderRadius: 1 }}
                                />
                              ) : (
                                <FileIcon size={24} />
                              )}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap>
                                  {file.file.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFileSize(file.file.size)}
                                </Typography>
                              </Box>
                              <IconButton size="small" onClick={() => removeFile(file.id)}>
                                <X size={18} />
                              </IconButton>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </>
              )}

              {/* Schedule Send */}
              <Box>
                <Button
                  size="small"
                  onClick={() => setShowSchedule(!showSchedule)}
                  startIcon={<Clock size={16} />}
                >
                  {showSchedule ? "Cancel" : "Schedule"} Send
                </Button>
                {showSchedule && (
                  <Stack direction="row" spacing={2} sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: "divider" }}>
                    <TextField
                      label="Date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                  </Stack>
                )}
              </Box>

              {/* Send Button */}
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Recipients: <strong>{getTotalRecipients()}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedGroups.length} group{selectedGroups.length !== 1 ? "s" : ""} selected
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSend}
                  disabled={
                    sending ||
                    selectedGroups.length === 0 ||
                    (messageType === "email" && (!emailSubject.trim() || !message.trim())) ||
                    (messageType === "sms" && !message.trim()) ||
                    (messageType === "call" &&
                      recordingMethod === "text-to-speech" &&
                      !message.trim()) ||
                    (messageType === "call" &&
                      recordingMethod === "device-record" &&
                      !hasRecording) ||
                    (messageType === "call" &&
                      recordingMethod === "saved-file" &&
                      !selectedSavedRecording &&
                      !uploadedAudio) ||
                    (messageType === "call" &&
                      recordingMethod === "call-to-record" &&
                      callToRecordStatus !== "completed")
                  }
                  startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send size={18} />}
                >
                  {sending
                    ? "Sending..."
                    : showSchedule && scheduleDate && scheduleTime
                    ? `Schedule ${messageType === "email" ? "Email" : messageType === "sms" ? "SMS" : "Robocall"}`
                    : `Send ${messageType === "email" ? "Email" : messageType === "sms" ? "SMS" : "Robocall"}`}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Group Selection Sidebar */}
        <Card>
          <CardHeader
            title="Select Recipients"
            subheader="Choose groups to send message to"
            sx={{ pb: 2 }}
          />
          <CardContent>
            <Stack spacing={2}>
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

              {loadingGroups ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
                  {filteredGroups.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {groupSearch ? "No groups found" : "No groups available"}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {filteredGroups.map((group) => {
                        const groupId = group.id || group._id || "";
                        const checked = selectedGroups.includes(groupId);
                        const count = group.memberCount || group.member_count || 0;
                        return (
                          <Box
                            key={groupId}
                            onClick={() => toggleGroup(groupId)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1.5,
                              borderRadius: 2,
                              border: 1,
                              borderColor: checked ? "primary.main" : "divider",
                              cursor: "pointer",
                              bgcolor: checked ? "primary.50" : "transparent",
                              "&:hover": {
                                bgcolor: checked ? "primary.100" : "action.hover",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Checkbox
                                checked={checked}
                                onChange={() => {}}
                                onClick={(e) => e.stopPropagation()}
                                size="small"
                              />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body2" fontWeight={checked ? 600 : 400} noWrap>
                                  {group.name}
                                </Typography>
                                {group.description && (
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {group.description}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                            <Chip label={count} size="small" sx={{ ml: 1 }} />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              )}
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

