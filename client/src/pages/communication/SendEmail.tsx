import { useEffect, useRef, useState } from "react";
import {
  Send,
  Search,
  X,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Bold,
  Italic,
  List,
  AlertCircle,
  ChevronDown,
  ListOrdered,
  Underline,
  Paperclip,
  ChevronUp,
  Clock,
} from "lucide-react";

import {
  Alert,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
  CircularProgress,
  FormControlLabel,
  useTheme,
} from "@mui/material";

import api from "../../utils/api";

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

interface Group {
  id: string;
  _id: string;
  name: string;
  memberCount?: number;
  member_count?: number;
}

export default function SendEmail() {
  const theme = useTheme();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Email states
  const [emailSubject, setEmailSubject] = useState("");
  const [fromName, setFromName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [disableReplyTo, setDisableReplyTo] = useState(false);
  const [showFromReply, setShowFromReply] = useState(false);
  const [showManualRecipients, setShowManualRecipients] = useState(false);
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

  // Fetch groups
  const groupsLoadedRef = useRef(false);
  const isFetchingGroupsRef = useRef(false);

  useEffect(() => {
    if (groupsLoadedRef.current) return;
    groupsLoadedRef.current = true;

    const fetchGroups = async () => {
      if (isFetchingGroupsRef.current) return;
      isFetchingGroupsRef.current = true;

      try {
        setLoadingGroups(true);
        const res = await api.get("/groups");
        setGroups(res.data.groups || []);
      } catch (error: any) {
        console.error("Error fetching groups:", error);
        showSnackbar("Failed to load groups", "error");
      } finally {
        setLoadingGroups(false);
        isFetchingGroupsRef.current = false;
      }
    };

    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  // ---------- Editor selection helpers ----------
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
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
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
      });
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const editor = emailEditorRef.current;
    if (!editor) return;

    editor.addEventListener("keyup", updateActiveFormats);
    editor.addEventListener("mouseup", updateActiveFormats);

    return () => {
      editor.removeEventListener("keyup", updateActiveFormats);
      editor.removeEventListener("mouseup", updateActiveFormats);
    };
  }, []);

  const applyFormatting = (command: string) => {
    restoreSelection();

    if (
      command === "insertUnorderedList" ||
      command === "insertOrderedList"
    ) {
      const sel = window.getSelection();
      const hasSelection = sel && sel.toString().length > 0;

      if (hasSelection) {
        document.execCommand(command, false);
      } else {
        const listTag = command === "insertUnorderedList" ? "ul" : "ol";
        const list = document.createElement(listTag);
        const li = document.createElement("li");
        li.innerHTML = "<br>";
        list.appendChild(li);

        savedSelectionRef.current?.insertNode(list);

        const range = document.createRange();
        range.setStart(li, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
        savedSelectionRef.current = range;
      }
    } else {
      document.execCommand(command, false);
    }

    updateActiveFormats();
    saveSelection();
  };

  // ---------- File handling ----------
  const addFiles = (files: File[]) => {
    const mapped = files.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));
    setAttachedFiles((prev) => [...prev, ...mapped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };


  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // ---------- Send ----------
  const handleSend = async () => {
    // Must have at least groups OR manual recipients (cc or bcc)
    const hasManualRecipients = ccRecipients.trim() || bccRecipients.trim();
    if (!selectedGroups.length && !hasManualRecipients) {
      showSnackbar("Please select at least one group or add recipients", "error");
      return;
    }

    if (!emailSubject.trim()) {
      showSnackbar("Please enter an email subject", "error");
      return;
    }

    const html = emailEditorRef.current?.innerHTML || "";
    if (!html.trim() || html === "<br>") {
      showSnackbar("Please enter your email message", "error");
      return;
    }

    // If scheduling, validate date and time
    if (showSchedule) {
      if (!scheduleDate || !scheduleTime) {
        showSnackbar("Please select both date and time for scheduling.", "error");
        return;
      }

      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime < new Date()) {
        showSnackbar("Scheduled time must be in the future.", "error");
        return;
      }
    }

    try {
      setLoading(true);

      const payload: any = {
        subject: emailSubject.trim(),
        html,
        priority: emailPriority,
      };

      // Add scheduledFor if scheduling
      if (showSchedule && scheduleDate && scheduleTime) {
        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        payload.scheduledFor = scheduledDateTime.toISOString();
      }

      // Add group IDs if any selected
      if (selectedGroups.length > 0) {
        payload.groupIds = selectedGroups;
      }

      // Add from name and reply-to settings
      if (fromName.trim()) {
        payload.fromName = fromName.trim();
      }

      if (disableReplyTo) {
        payload.disableReplyTo = true;
      } else if (replyTo.trim()) {
        payload.replyTo = replyTo.trim();
      }

      // Add CC and BCC
      if (ccRecipients.trim()) {
        payload.cc = ccRecipients.trim();
      }

      if (bccRecipients.trim()) {
        payload.bcc = bccRecipients.trim();
      }

      // Process attachments - convert to base64
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

      await api.post("/email/send/group", payload);

      if (showSchedule && scheduleDate && scheduleTime) {
        showSnackbar("Email scheduled successfully!", "success");
      } else {
        showSnackbar("Email sent successfully!", "success");
      }

      // Reset form
      setSelectedGroups([]);
      setEmailSubject("");
      setFromName("");
      setReplyTo("");
      setDisableReplyTo(false);
      setCcRecipients("");
      setBccRecipients("");
      setShowManualRecipients(false);
      setShowFromReply(false);
      setEmailPriority("normal");
      setAttachedFiles([]);
      setShowSchedule(false);
      setScheduleDate("");
      setScheduleTime("");
      if (emailEditorRef.current) emailEditorRef.current.innerHTML = "";
    } catch (error: any) {
      console.error("Error sending email:", error);
      showSnackbar(
        error?.response?.data?.message || "Failed to send email",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
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
        {/* -------- Group Selection -------- */}
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

              {loadingGroups ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
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
                        const checked = selectedGroups.includes(group.id || group._id);
                        const count = group.memberCount || group.member_count || 0;
                        const toggleGroup = (groupId: string) => {
                          setSelectedGroups((prev) => {
                            return checked
                              ? prev.filter((gId) => gId !== groupId)
                              : [...prev, groupId];
                          });
                        };
                        return (
                          <Box
                            key={group.id || group._id}
                            onClick={() => toggleGroup(group.id || group._id)}
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
                                onChange={() => toggleGroup(group.id || group._id)}
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
                              </Box>
                            </Stack>

                            <Chip
                              size="small"
                              label={count}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              )}

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

        {/* -------- Email Composition -------- */}
        <Box>
          <Paper
            variant="outlined"
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Stack spacing={3}>
              {/* Selected Groups Display */}
              {selectedGroups.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }} fontWeight={600}>
                    Selected Groups
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {groups
                      .filter((g) => selectedGroups.includes(g.id || g._id))
                      .map((g) => {
                        const count = g.memberCount || g.member_count || 0;
                        return (
                          <Chip
                            key={g.id || g._id}
                            color="primary"
                            label={`${g.name} (${count})`}
                            onDelete={() =>
                              setSelectedGroups((prev) =>
                                prev.filter((id) => id !== (g.id || g._id))
                              )
                            }
                          />
                        );
                      })}
                  </Stack>
                </Box>
              )}

              {/* Subject */}
              <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1 }}>
                <TextField
                  label="Subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter email subject..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "transparent",
                    },
                  }}
                />
              </Box>

              {/* Options Section */}
              <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowManualRecipients(!showManualRecipients)}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.875rem",
                      color: theme.palette.text.secondary,
                      minWidth: "auto",
                      px: 1,
                    }}
                    endIcon={showManualRecipients ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  >
                    Add Recipients
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowFromReply(!showFromReply)}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.875rem",
                      color: theme.palette.text.secondary,
                      minWidth: "auto",
                      px: 1,
                    }}
                    endIcon={showFromReply ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  >
                    From & Reply-To
                  </Button>
                </Stack>
              </Box>

              {/* CC/BCC Fields (Manual Recipients) */}
              {showManualRecipients && (
                <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2 }}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="Cc"
                      value={ccRecipients}
                      onChange={(e) => setCcRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      fullWidth
                      variant="outlined"
                      size="small"
                      helperText="Enter email addresses separated by commas"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "transparent",
                        },
                      }}
                    />
                    <TextField
                      label="Bcc"
                      value={bccRecipients}
                      onChange={(e) => setBccRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      fullWidth
                      variant="outlined"
                      size="small"
                      helperText="Enter email addresses separated by commas"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "transparent",
                        },
                      }}
                    />
                  </Stack>
                </Box>
              )}

              {/* From Name & Reply-To Fields */}
              {showFromReply && (
                <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2 }}>
                  <Stack spacing={1.5}>
                    <TextField
                      label="From Name"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="e.g., Nachlas Bais Yaakov"
                      fullWidth
                      variant="outlined"
                      size="small"
                      helperText="Custom name that will appear as the sender"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "transparent",
                        },
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={disableReplyTo}
                          onChange={(e) => {
                            setDisableReplyTo(e.target.checked);
                            if (e.target.checked) {
                              setReplyTo("");
                            }
                          }}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                          Disable replies (use no-reply address)
                        </Typography>
                      }
                    />
                    {!disableReplyTo && (
                      <TextField
                        label="Reply-To"
                        value={replyTo}
                        onChange={(e) => setReplyTo(e.target.value)}
                        placeholder="e.g., office@school.org"
                        fullWidth
                        variant="outlined"
                        size="small"
                        helperText="Email address recipients can reply to. Leave empty to use default."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "transparent",
                          },
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              )}

              {/* Toolbar */}
              <Box 
                sx={{ 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.mode === "light" ? "#f8f9fa" : "rgba(255,255,255,0.02)",
                }}
              >
                <Stack 
                  direction="row" 
                  spacing={0.5}
                  alignItems="center"
                  sx={{ px: 1, py: 0.5 }}
                >
                  {[
                    { cmd: "bold", Icon: Bold, active: activeFormats.bold },
                    { cmd: "italic", Icon: Italic, active: activeFormats.italic },
                    { cmd: "underline", Icon: Underline, active: activeFormats.underline },
                    { cmd: "insertUnorderedList", Icon: List, active: activeFormats.unorderedList },
                    { cmd: "insertOrderedList", Icon: ListOrdered, active: activeFormats.orderedList },
                  ].map(({ cmd, Icon, active }) => (
                    <Tooltip key={cmd} title={cmd} arrow>
                      <IconButton
                        size="small"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          saveSelection();
                        }}
                        onClick={() => applyFormatting(cmd)}
                        sx={{
                          p: 0.75,
                          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                          "&:hover": {
                            bgcolor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <Icon size={16} />
                      </IconButton>
                    </Tooltip>
                  ))}
                  
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                  {/* Attachment button */}
                  <Tooltip title="Attach files" arrow>
                    <IconButton
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        p: 0.75,
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Paperclip size={16} />
                    </IconButton>
                  </Tooltip>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={handleFileSelect}
                  />

                  <Box sx={{ flex: 1 }} />

                  {/* Priority toggle */}
                  <Tooltip title="High priority" arrow>
                    <IconButton
                      size="small"
                      onClick={() => setEmailPriority(emailPriority === "high" ? "normal" : "high")}
                      sx={{
                        p: 0.75,
                        color: emailPriority === "high" ? "#ea580c" : theme.palette.text.secondary,
                        "&:hover": {
                          bgcolor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <AlertCircle size={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {/* Editor */}
              <Box
                ref={emailEditorRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Type your email message here..."
                sx={{
                  minHeight: { xs: 250, sm: 300 },
                  p: { xs: 1.5, sm: 2 },
                  outline: "none",
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                  "&:focus": {
                    outline: "none",
                  },
                  "&:empty:before": {
                    content: "attr(data-placeholder)",
                    color: theme.palette.text.disabled,
                    pointerEvents: "none",
                  },
                  "&:focus:empty:before": {
                    content: "attr(data-placeholder)",
                    color: theme.palette.text.disabled,
                  },
                }}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
              />

              {/* Attachments Display */}
              {attachedFiles.length > 0 && (
                <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Stack spacing={1}>
                    {attachedFiles.map((f) => (
                      <Box
                        key={f.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: theme.palette.mode === "light" ? "#f8f9fa" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {f.preview ? (
                          <ImageIcon size={18} color={theme.palette.text.secondary} />
                        ) : f.file.type.includes("pdf") ? (
                          <FileText size={18} color={theme.palette.text.secondary} />
                        ) : (
                          <FileIcon size={18} color={theme.palette.text.secondary} />
                        )}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            flex: 1,
                            fontSize: "0.875rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {f.file.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          {(f.file.size / 1024).toFixed(1)} KB
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeFile(f.id)}
                          sx={{ p: 0.5 }}
                        >
                          <X size={14} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Schedule Section */}
              <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1, pb: 1 }}>
                <Button
                  variant="text"
                  onClick={() => setShowSchedule((v) => !v)}
                  disabled={loading}
                  sx={{ alignSelf: "flex-start" }}
                  startIcon={<Clock size={16} />}
                >
                  {showSchedule ? "Cancel" : "Schedule"} Send
                </Button>

                {showSchedule && (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ mt: 1, px: { xs: 1.5, sm: 2 } }}
                  >
                    <TextField
                      type="date"
                      label="Date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      fullWidth
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "transparent",
                        },
                      }}
                    />
                    <TextField
                      type="time"
                      label="Time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      fullWidth
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "transparent",
                        },
                      }}
                    />
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Send Button */}
              <Box sx={{ px: { xs: 1.5, sm: 2 }, pb: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSend}
                  disabled={loading || selectedGroups.length === 0 || !emailSubject.trim()}
                  sx={{ alignSelf: "flex-end", width: { xs: "100%", sm: "auto" } }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Send size={16} />
                    )
                  }
                >
                  {loading
                    ? showSchedule && scheduleDate && scheduleTime
                      ? "Scheduling..."
                      : "Sending..."
                    : showSchedule && scheduleDate && scheduleTime
                    ? "Schedule Email"
                    : "Send Email"}
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

