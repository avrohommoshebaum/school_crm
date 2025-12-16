import { useEffect, useRef, useState } from "react";
import {
  Mail,
  Send,
  Search,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  Bold,
  Italic,
  List,
  AlertCircle,
  Clock,
  ChevronDown,
  ListOrdered,
  Underline,
  Paperclip,
} from "lucide-react";

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
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

export default function SendEmail() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState("");

  // Email states
  const [emailSubject, setEmailSubject] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccRecipients, setCcRecipients] = useState("");
  const [bccRecipients, setBccRecipients] = useState("");
  const [emailPriority, setEmailPriority] = useState<"normal" | "high">(
    "normal"
  );
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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

  // Mock groups
  const groups = [
    { id: "1", name: "All Parents", count: 450 },
    { id: "2", name: "Grade 1 Parents", count: 45 },
    { id: "3", name: "Grade 2 Parents", count: 48 },
    { id: "4", name: "Teachers", count: 25 },
    { id: "5", name: "Administration", count: 8 },
  ];

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  // ---------- Send ----------
  const handleSend = () => {
    if (!selectedGroups.length) {
      alert("Please select at least one group.");
      return;
    }

    if (!emailSubject.trim()) {
      alert("Please enter an email subject.");
      return;
    }

    const html = emailEditorRef.current?.innerHTML || "";
    if (!html.trim() || html === "<br>") {
      alert("Please enter your email message.");
      return;
    }

    console.log({
      selectedGroups,
      emailSubject,
      html,
      ccRecipients,
      bccRecipients,
      emailPriority,
      attachedFiles,
      scheduled: showSchedule
        ? { scheduleDate, scheduleTime }
        : null,
    });

    alert("Email sent successfully!");

    setSelectedGroups([]);
    setEmailSubject("");
    setCcRecipients("");
    setBccRecipients("");
    setShowCcBcc(false);
    setEmailPriority("normal");
    setAttachedFiles([]);
    setShowSchedule(false);
    setScheduleDate("");
    setScheduleTime("");
    if (emailEditorRef.current) emailEditorRef.current.innerHTML = "";
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
        {/* -------- Recipient Selection -------- */}
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
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid #e5e7eb",
                          bgcolor: checked ? "#eff6ff" : "transparent",
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Checkbox
                            checked={checked}
                            onChange={() =>
                              setSelectedGroups((prev) =>
                                checked
                                  ? prev.filter((id) => id !== group.id)
                                  : [...prev, group.id]
                              )
                            }
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

        {/* -------- Email Composition -------- */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
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
                          label={`${g.name} (${g.count})`}
                          color="primary"
                        />
                      ))}
                  </Stack>
                </Box>
              )}

              <TextField
                label="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />

              <Button
                variant="text"
                onClick={() => setShowCcBcc((v) => !v)}
                sx={{ alignSelf: "flex-start" }}
              >
                <ChevronDown size={16} style={{ marginRight: 6 }} />
                {showCcBcc ? "Hide" : "Add"} CC / BCC
              </Button>

              {showCcBcc && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="CC"
                    value={ccRecipients}
                    onChange={(e) => setCcRecipients(e.target.value)}
                  />
                  <TextField
                    label="BCC"
                    value={bccRecipients}
                    onChange={(e) => setBccRecipients(e.target.value)}
                  />
                </Stack>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <AlertCircle size={16} color="#ea580c" />
                  <Typography variant="body2">High Priority</Typography>
                </Stack>
                <Switch
                  checked={emailPriority === "high"}
                  onChange={(e) =>
                    setEmailPriority(e.target.checked ? "high" : "normal")
                  }
                />
              </Box>

              {/* Schedule */}
              <Button
                variant="text"
                onClick={() => setShowSchedule((v) => !v)}
                sx={{ alignSelf: "flex-start" }}
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

              {/* Toolbar */}
              <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    p: 1,
                    bgcolor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {[
                    { cmd: "bold", Icon: Bold, active: activeFormats.bold },
                    {
                      cmd: "italic",
                      Icon: Italic,
                      active: activeFormats.italic,
                    },
                    {
                      cmd: "underline",
                      Icon: Underline,
                      active: activeFormats.underline,
                    },
                    {
                      cmd: "insertUnorderedList",
                      Icon: List,
                      active: activeFormats.unorderedList,
                    },
                    {
                      cmd: "insertOrderedList",
                      Icon: ListOrdered,
                      active: activeFormats.orderedList,
                    },
                  ].map(({ cmd, Icon, active }) => (
                    <Tooltip key={cmd} title={cmd}>
                      <IconButton
                        size="small"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          saveSelection();
                        }}
                        onClick={() => applyFormatting(cmd)}
                        sx={{
                          bgcolor: active ? "#dbeafe" : "transparent",
                        }}
                      >
                        <Icon size={16} />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>

                <Box
                  ref={emailEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  sx={{
                    minHeight: 200,
                    p: 2,
                    outline: "none",
                  }}
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                />
              </Box>

              {/* Attachments */}
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  p: 3,
                  textAlign: "center",
                  border: "2px dashed",
                  borderColor: isDragging ? "primary.main" : "grey.300",
                  borderRadius: 2,
                }}
              >
                <Paperclip size={28} />
                <Typography variant="body2" sx={{ my: 1 }}>
                  Drag files here or click to upload
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} style={{ marginRight: 6 }} />
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileSelect}
                />
              </Box>

              {attachedFiles.length > 0 && (
                <Stack spacing={1}>
                  {attachedFiles.map((f) => (
                    <Box
                      key={f.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 1,
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                      }}
                    >
                      {f.preview ? (
                        <ImageIcon size={16} />
                      ) : f.file.type.includes("pdf") ? (
                        <FileText size={16} />
                      ) : (
                        <FileIcon size={16} />
                      )}
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {f.file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(f.id)}
                      >
                        <X size={14} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}

              <Divider />

              <Button
                variant="contained"
                size="large"
                onClick={handleSend}
                sx={{ alignSelf: "flex-end" }}
              >
                <Send size={16} style={{ marginRight: 8 }} />
                {showSchedule && scheduleDate && scheduleTime
                  ? "Schedule Email"
                  : "Send Email"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
