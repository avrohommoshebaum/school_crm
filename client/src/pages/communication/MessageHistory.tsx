import { useState, useEffect, useRef } from "react";
import {
  Mail,
  MessageSquare,
  Phone,
  Hash,
  Clock,
  Eye,
  X,
  Edit,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { AlertColor } from "@mui/material/Alert";
import api from "../../utils/api";

// ---------- Types ----------

type MessageType = "email" | "sms" | "call" | "robocall" | "scheduled";
type MessageStatus = "sent" | "delivered" | "failed" | "queued" | "pending" | "scheduled" | "cancelled" | "completed";

// Base message type - can be extended for different message types
type Message = {
  id: string;
  type: MessageType;
  messageType?: "sent" | "scheduled"; // Track if this is a scheduled or sent message
  message?: string; // For SMS
  subject?: string; // For email
  body?: string; // For email
  html_content?: string; // For email HTML content
  preview?: string; // For email preview
  content?: string; // For robocall
  
  // Common fields
  recipient_type: "group" | "individual";
  recipient_group_id?: string;
  recipient_member_id?: string;
  recipient_count?: number;
  
  // Status fields (vary by message type)
  status?: string;
  twilio_status?: string; // For SMS
  email_status?: string; // For email
  call_status?: string; // For robocall
  
  // IDs for tracking
  twilio_message_sid?: string; // For SMS
  email_message_id?: string; // For email
  call_sid?: string; // For robocall
  
  // Timing
  sent_at?: string;
  scheduled_for?: string;
  created_at: string;
  
  // Metadata
  sent_by: string;
  sent_by_name?: string;
  group_name?: string;
  member_first_name?: string;
  member_last_name?: string;
  
  // SMS-specific
  recipient_phone_numbers?: string[];
  segments?: number;
  
  // Email-specific
  recipient_emails?: string[];
  
  // Robocall-specific
  phone_number?: string;
};

type RecipientLog = {
  id: string;
  // Contact info (varies by message type)
  phone_number?: string;
  email?: string;
  
  // Status tracking
  status: string;
  error_code?: string;
  error_message?: string;
  
  // External IDs
  twilio_sid?: string; // For SMS/call
  email_message_id?: string; // For email
  
  created_at: string;
};

type RecipientDetails = {
  message: Message;
  recipients: RecipientLog[];
  summary: {
    total: number;
    sent: number;
    failed: number;
    queued: number;
  };
};

// ---------- Component ----------

export default function MessageHistory() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filter
  const [messageTypeFilter, setMessageTypeFilter] = useState<MessageType | "all">("all");

  // Dialogs
  const [recipientDetailsDialog, setRecipientDetailsDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [recipientDetails, setRecipientDetails] = useState<RecipientDetails | null>(null);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [viewMessageDialog, setViewMessageDialog] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);

  const [editScheduledDialog, setEditScheduledDialog] = useState(false);
  const [editingScheduled, setEditingScheduled] = useState<Message | null>(null);
  const [editForm, setEditForm] = useState({ message: "", scheduledDate: "", scheduledTime: "" });
  const [saving, setSaving] = useState(false);

  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancellingScheduled, setCancellingScheduled] = useState<Message | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  // Refs to prevent duplicate calls
  const lastLoadedRef = useRef<string>("");
  const isFetchingRef = useRef(false);

  // ---------- Load Messages ----------

  const loadMessages = async () => {
    // Prevent duplicate calls for the same page/filter combination
    const stateKey = `${page}-${messageTypeFilter}`;
    if (lastLoadedRef.current === stateKey || isFetchingRef.current) {
      return;
    }
    lastLoadedRef.current = stateKey;
    isFetchingRef.current = true;
    try {
      setLoading(true);
      
      // Fetch SMS, Email, and Robocall history
      const [smsResponse, emailResponse, robocallResponse] = await Promise.all([
        api.get("/sms/history", {
          params: { page, limit: 20, includeScheduled: true },
        }).catch((error) => {
          console.error("Error fetching SMS history:", error);
          return { data: { messages: [] } };
        }),
        api.get("/email/history", {
          params: { page, limit: 20 },
        }).catch((error) => {
          console.error("Error fetching Email history:", error);
          return { data: { messages: [] } };
        }),
        api.get("/robocall/history", {
          params: { page, limit: 20, includeScheduled: true },
        }).catch((error) => {
          console.error("Error fetching Robocall history:", error);
          return { data: { messages: [] } };
        }),
      ]);
      
      // Debug: Log responses to see what we're getting
      console.log("SMS Response:", smsResponse?.data);
      console.log("Email Response:", emailResponse?.data);
      console.log("Robocall Response:", robocallResponse?.data);
      
      // Check if responses have the expected structure
      if (!smsResponse?.data) {
        console.warn("SMS response missing data:", smsResponse);
      }
      if (!emailResponse?.data) {
        console.warn("Email response missing data:", emailResponse);
      }
      if (!robocallResponse?.data) {
        console.warn("Robocall response missing data:", robocallResponse);
      }
      
      // Transform SMS messages to generic Message format
      const smsMessages: Message[] = (smsResponse.data.messages || []).map((msg: any) => ({
        ...msg,
        type: msg.type === "scheduled" ? "sms" : "sms", // Keep type as sms, use status for scheduled
        messageType: msg.type || "sent", // Track if scheduled or sent
        recipient_count: msg.recipient_phone_numbers?.length || msg.recipient_count || 0,
        status: msg.type === "scheduled" ? (msg.status || "pending") : (msg.twilio_status || "sent"),
        scheduled_for: msg.type === "scheduled" ? msg.scheduled_for : undefined,
        html_content: undefined, // SMS don't have HTML
      }));
      
      // Transform Email messages to generic Message format
      const emailData = emailResponse?.data?.messages || emailResponse?.data || [];
      const emailMessages: Message[] = (Array.isArray(emailData) ? emailData : []).map((msg: any) => ({
        ...msg,
        type: msg.messageType === "scheduled" ? "email" : "email", // Keep type as email, use status for scheduled
        messageType: msg.messageType || "sent", // Track if scheduled or sent
        message: msg.subject || msg.preview,
        subject: msg.subject,
        html_content: msg.html_content || msg.htmlContent,
        recipient_count: msg.recipientCount || msg.recipient_count || 0,
        status: msg.messageType === "scheduled" ? (msg.status || "pending") : (msg.status || "sent"),
        scheduled_for: msg.messageType === "scheduled" ? (msg.scheduledFor || msg.scheduled_for) : undefined,
        sent_at: msg.sentAt || msg.sent_at,
        created_at: msg.createdAt || msg.created_at,
        sent_by: msg.sentBy || msg.sent_by, // Preserve sent_by information
        sent_by_name: msg.sentBy || msg.sent_by_name, // For display
        sent_by_email: msg.sentBy || msg.sent_by_email, // For display
      }));
      
      // Transform Robocall messages to generic Message format
      const robocallData = robocallResponse?.data?.messages || robocallResponse?.data || [];
      const robocallMessages: Message[] = (Array.isArray(robocallData) ? robocallData : []).map((msg: any) => ({
        ...msg,
        type: msg.type === "scheduled" ? "robocall" : "robocall", // Keep type as robocall
        messageType: msg.type === "scheduled" ? "scheduled" : "sent", // Track if scheduled or sent
        message: msg.text_content || msg.textContent || "Robocall",
        recipient_count: msg.recipient_count || msg.recipient_phone_numbers?.length || 0,
        status: msg.type === "scheduled" ? (msg.status || "pending") : (msg.twilio_status || msg.status || "sent"),
        scheduled_for: msg.type === "scheduled" ? msg.scheduled_for : undefined,
        sent_at: msg.sent_at,
        created_at: msg.created_at,
        recording_method: msg.recording_method || msg.recordingMethod,
        sent_by: msg.sent_by || msg.sentBy,
        sent_by_name: msg.sent_by_name || msg.sentByName,
        sent_by_email: msg.sent_by_email || msg.sentByEmail,
      }));
      
      // Combine and sort by date
      const allMessages = [...smsMessages, ...emailMessages, ...robocallMessages].sort((a, b) => {
        const dateA = new Date(a.sent_at || a.scheduled_for || a.created_at).getTime();
        const dateB = new Date(b.sent_at || b.scheduled_for || b.created_at).getTime();
        return dateB - dateA;
      });
      
      // Filter by message type if needed
      const filteredMessages = messageTypeFilter === "all" 
        ? allMessages 
        : allMessages.filter(m => {
          if (messageTypeFilter === "sms") return m.type === "sms";
          if (messageTypeFilter === "email") return m.type === "email";
          if (messageTypeFilter === "robocall") return m.type === "robocall";
          if (messageTypeFilter === "scheduled") return m.messageType === "scheduled" || m.status === "pending" || m.status === "scheduled";
          return true;
        });
      
      // Pagination: Calculate total pages and slice messages
      const itemsPerPage = 20;
      const totalItems = filteredMessages.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedMessages = filteredMessages.slice(startIndex, endIndex);
      
      setMessages(paginatedMessages);
      setTotalPages(totalPages);
      setTotal(totalItems);
    } catch (error: any) {
      console.error("Error loading message history:", error);
      showSnackbar(error?.response?.data?.message || "Error loading message history", "error");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    // Reset to page 1 when filter changes
    setPage(1);
  }, [messageTypeFilter]);

  useEffect(() => {
    loadMessages();
  }, [page, messageTypeFilter]);

  // ---------- Handlers ----------

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewMessage = (message: Message) => {
    setViewingMessage(message);
    setViewMessageDialog(true);
  };

  const handleViewRecipients = async (message: Message) => {
    // Don't show recipient details for scheduled/pending messages
    if (message.messageType === "scheduled" || message.status === "pending" || message.status === "scheduled") {
      showSnackbar("Recipient details are not available for scheduled messages until they are sent", "info");
      return;
    }

    try {
      setSelectedMessage(message);
      setLoadingRecipients(true);
      setRecipientDetailsDialog(true);

      // Route to appropriate endpoint based on message type
      if (message.type === "sms") {
        const { data } = await api.get(`/sms/${message.id}/recipients`);
        setRecipientDetails(data);
      } else if (message.type === "email") {
        const { data } = await api.get(`/email/${message.id}/recipients`);
        setRecipientDetails(data);
      } else {
        showSnackbar("Recipient details are not yet available for this message type", "info");
        setRecipientDetailsDialog(false);
      }
    } catch (error: any) {
      console.error("Error loading recipient details:", error);
      showSnackbar(error?.response?.data?.message || "Error loading recipient details", "error");
      setRecipientDetailsDialog(false);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleEditScheduled = (message: Message) => {
    // Check if it's a scheduled message with pending status
    if (message.messageType !== "scheduled" && message.status !== "pending" && message.status !== "scheduled") {
      return;
    }

    setEditingScheduled(message);
    const scheduledDate = message.scheduled_for ? new Date(message.scheduled_for) : new Date();
    setEditForm({
      message: message.message || message.subject || "",
      scheduledDate: scheduledDate.toISOString().split("T")[0],
      scheduledTime: scheduledDate.toTimeString().slice(0, 5),
    });
    setEditScheduledDialog(true);
  };

  const handleSaveScheduled = async () => {
    if (!editingScheduled) return;

    try {
      setSaving(true);
      const scheduledDateTime = new Date(`${editForm.scheduledDate}T${editForm.scheduledTime}`);
      
      // Determine if this is an SMS or Email scheduled message
      const isEmail = editingScheduled.type === "email";
      const endpoint = isEmail 
        ? `/email/scheduled/${editingScheduled.id}`
        : `/sms/scheduled/${editingScheduled.id}`;
      
      const payload = isEmail
        ? {
            subject: editForm.message,
            scheduledFor: scheduledDateTime.toISOString(),
          }
        : {
            message: editForm.message,
            scheduledFor: scheduledDateTime.toISOString(),
          };

      await api.put(endpoint, payload);

      showSnackbar(`Scheduled ${isEmail ? "email" : "SMS"} updated successfully`, "success");
      setEditScheduledDialog(false);
      loadMessages();
    } catch (error: any) {
      console.error("Error updating scheduled message:", error);
      showSnackbar(error?.response?.data?.message || "Error updating scheduled message", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelScheduled = (message: Message) => {
    // Check if it's a scheduled message with pending status
    if (message.messageType !== "scheduled" && message.status !== "pending" && message.status !== "scheduled") {
      return;
    }
    
    setCancellingScheduled(message);
    setCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingScheduled) return;

    try {
      setCancelling(true);
      
      // Determine if this is an SMS or Email scheduled message
      const isEmail = cancellingScheduled.type === "email";
      const endpoint = isEmail 
        ? `/email/scheduled/${cancellingScheduled.id}`
        : `/sms/scheduled/${cancellingScheduled.id}`;

      await api.delete(endpoint);

      showSnackbar(`Scheduled ${isEmail ? "email" : "SMS"} cancelled successfully`, "success");
      setCancelDialog(false);
      setCancellingScheduled(null);
      loadMessages();
    } catch (error: any) {
      console.error("Error cancelling scheduled message:", error);
      showSnackbar(error?.response?.data?.message || "Error cancelling scheduled message", "error");
    } finally {
      setCancelling(false);
    }
  };

  // ---------- Helpers ----------

  const getStatusColor = (status?: string): "default" | "primary" | "success" | "warning" | "error" => {
    if (!status) return "default";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "sent" || lowerStatus === "delivered" || lowerStatus === "completed") return "success";
    if (lowerStatus === "failed" || lowerStatus === "cancelled" || lowerStatus === "undelivered") return "error";
    if (lowerStatus === "pending" || lowerStatus === "scheduled" || lowerStatus === "queued") return "warning";
    return "primary";
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === "sent" || lowerStatus === "delivered") return <CheckCircle size={16} />;
    if (lowerStatus === "failed" || lowerStatus === "cancelled") return <XCircle size={16} />;
    if (lowerStatus === "pending" || lowerStatus === "scheduled") return <Clock size={16} />;
    return <AlertCircle size={16} />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatPhone = (phone: string) => {
    // Format phone number: 7325514480 -> (732) 551-4480
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getMessageIcon = (message: Message) => {
    // Use the actual message type (sms/email) for the icon, not the scheduled status
    const type = message.type;
    switch (type) {
      case "email":
        return <Mail size={20} color={theme.palette.primary.main} />;
      case "sms":
        return <MessageSquare size={20} color={theme.palette.primary.main} />;
      case "call":
      case "robocall":
        return <Phone size={20} color={theme.palette.primary.main} />;
      default:
        return <MessageSquare size={20} color={theme.palette.primary.main} />;
    }
  };

  const getMessagePreview = (message: Message): string => {
    if (message.type === "email") {
      return message.subject || message.preview || "";
    } else if (message.type === "robocall" || message.type === "call") {
      return message.content || message.message || "";
    }
    return message.message || "";
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
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Message History
          </Typography>
          <Typography variant="body2" color="text.secondary">
          View all sent and scheduled messages (SMS, Email, Robocall)
          </Typography>
        </Box>

        <Card>
          <CardHeader
            title={messageTypeFilter === "all" ? "All Messages" : messageTypeFilter === "sms" ? "SMS Messages" : messageTypeFilter === "email" ? "Email Messages" : messageTypeFilter === "robocall" ? "Robocall Messages" : "Scheduled Messages"}
            subheader={`${total} total message${total !== 1 ? "s" : ""}`}
          />

          <CardContent>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <MessageSquare size={48} color={theme.palette.text.secondary} style={{ margin: "0 auto 16px" }} />
              <Typography variant="body1" color="text.secondary">
                No SMS messages yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Start sending SMS messages to see them here
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {messages.map((msg) => {
                const isScheduled = msg.messageType === "scheduled" || msg.status === "pending" || msg.status === "scheduled";
                // Status: if scheduled and pending, show "scheduled", otherwise show actual status
                const displayStatus = isScheduled && (msg.status === "pending" || msg.status === "scheduled") 
                  ? "scheduled" 
                  : (msg.status || msg.twilio_status || msg.email_status || msg.call_status || "sent");
                const date = isScheduled ? msg.scheduled_for : msg.sent_at || msg.created_at;
                const recipientCount = msg.recipient_count || msg.recipient_phone_numbers?.length || msg.recipient_emails?.length || 0;
                const messagePreview = getMessagePreview(msg);
                const messageTypeLabel = msg.type === "email" ? "Email" : msg.type === "sms" ? "SMS" : msg.type === "robocall" ? "Robocall" : msg.type;

                return (
                <Box
                  key={msg.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    gap: 2,
                      "&:hover": { bgcolor: "grey.50", cursor: "pointer" },
                  }}
                    onClick={() => handleViewMessage(msg)}
                >
                  {/* Left */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                          bgcolor: msg.type === "email" 
                            ? alpha(theme.palette.info.light, 0.3)
                            : alpha(theme.palette.primary.light, 0.3),
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                        {getMessageIcon(msg)}
                    </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Chip
                            size="small"
                            label={messageTypeLabel}
                            sx={{
                              bgcolor: msg.type === "email" ? "info.50" : "primary.50",
                              color: msg.type === "email" ? "info.main" : "primary.main",
                              fontSize: "0.75rem",
                              height: 20,
                            }}
                          />
                          {isScheduled && (
                            <Chip
                              size="small"
                              label="Scheduled"
                              sx={{ 
                                bgcolor: "warning.50",
                                color: "warning.main",
                                fontSize: "0.75rem",
                                height: 20,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography fontWeight={500} noWrap>
                          {messagePreview.substring(0, 60)}{messagePreview.length > 60 ? "..." : ""}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(date)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • {recipientCount} {msg.type === "email" ? "recipient" : "recipient"}{recipientCount !== 1 ? "s" : ""}
                          </Typography>

                          {msg.sent_by && (
                            <Typography variant="body2" color="text.secondary">
                              • Sent by {msg.sent_by_name || msg.sent_by_email || msg.sent_by}
                            </Typography>
                          )}

                          {msg.group_name && (
                            <Chip
                              size="small"
                              label={msg.group_name}
                              sx={{ bgcolor: "primary.50", color: "primary.main" }}
                            />
                          )}
                        </Stack>
                    </Box>
                  </Stack>

                  {/* Right */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={{ sm: "flex-end" }}
                    flexWrap="wrap"
                  >
                    <Chip
                        icon={getStatusIcon(displayStatus)}
                        label={displayStatus}
                        color={getStatusColor(displayStatus)}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />

                      {/* View recipients - available for sent messages */}
                      {!isScheduled && msg.type === "sms" && (
                        <Tooltip title="View recipient details">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRecipients(msg);
                            }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Edit/Cancel scheduled */}
                      {isScheduled && (displayStatus === "pending" || displayStatus === "scheduled") && (
                        <>
                          <Tooltip title="Edit scheduled message">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditScheduled(msg);
                              }}
                            >
                              <Edit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel scheduled message">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelScheduled(msg);
                              }}
                            >
                              <X size={18} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPagination-ul": {
                    justifyContent: "center",
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recipient Details Dialog */}
      <Dialog
        open={recipientDetailsDialog}
        onClose={() => setRecipientDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MessageSquare size={20} />
            <Typography variant="h6">Recipient Details</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {loadingRecipients ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : recipientDetails ? (
            <Stack spacing={3}>
              {/* Message Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Message
                </Typography>
                <Typography variant="body1">{getMessagePreview(recipientDetails.message)}</Typography>
              </Box>

              {/* Summary */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  display: "grid",
                  gridTemplateColumns: { 
                    xs: "1fr 1fr", 
                    sm: selectedMessage?.type === "email" ? "repeat(6, 1fr)" : "repeat(4, 1fr)" 
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6">{recipientDetails.summary.total}</Typography>
                </Box>
                {selectedMessage?.type === "email" && (
                  <>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        TO
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {recipientDetails.summary.to || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        CC
                      </Typography>
                      <Typography variant="h6" color="secondary.main">
                        {recipientDetails.summary.cc || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        BCC
                      </Typography>
                      <Typography variant="h6">
                        {recipientDetails.summary.bcc || 0}
                      </Typography>
                    </Box>
                  </>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {selectedMessage?.type === "email" ? "Sent" : "Sent/Delivered"}
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {recipientDetails.summary.sent}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Failed
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {recipientDetails.summary.failed}
                  </Typography>
                </Box>
                {selectedMessage?.type !== "email" && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Queued
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {recipientDetails.summary.queued || 0}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Recipients Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {selectedMessage?.type === "email" && <TableCell>Type</TableCell>}
                      <TableCell>{selectedMessage?.type === "sms" || selectedMessage?.type === "robocall" ? "Phone Number" : "Email"}</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recipientDetails.recipients.map((recipient) => (
                      <TableRow key={recipient.id}>
                        {selectedMessage?.type === "email" && (
                          <TableCell>
                            <Chip
                              label={recipient.type?.toUpperCase() || "TO"}
                              size="small"
                              color={
                                recipient.type === "to" ? "primary" :
                                recipient.type === "cc" ? "secondary" :
                                recipient.type === "bcc" ? "default" : "primary"
                              }
                              sx={{ textTransform: "uppercase", fontWeight: 600 }}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          {recipient.phone_number ? formatPhone(recipient.phone_number) : recipient.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={recipient.status}
                            color={getStatusColor(recipient.status)}
                            size="small"
                            icon={getStatusIcon(recipient.status)}
                            sx={{ textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell>
                          {recipient.error_message ? (
                            <Tooltip title={recipient.error_code ? `Error Code: ${recipient.error_code}` : ""}>
                              <Typography variant="caption" color="error">
                                {recipient.error_message}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipientDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Scheduled SMS Dialog */}
      <Dialog
        open={editScheduledDialog}
        onClose={() => setEditScheduledDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Edit Scheduled SMS</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Message"
              multiline
              rows={4}
              value={editForm.message}
              onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="date"
                label="Scheduled Date"
                value={editForm.scheduledDate}
                onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="time"
                label="Scheduled Time"
                value={editForm.scheduledTime}
                onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditScheduledDialog(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveScheduled}
            disabled={saving || !editForm.message.trim() || !editForm.scheduledDate || !editForm.scheduledTime}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Scheduled SMS Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Scheduled SMS?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this scheduled SMS? This action cannot be undone.
          </Typography>
          {cancellingScheduled && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Message: {getMessagePreview(cancellingScheduled).substring(0, 100)}
                {getMessagePreview(cancellingScheduled).length > 100 ? "..." : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Scheduled for: {formatDate(cancellingScheduled.scheduled_for)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)} disabled={cancelling}>
            Keep Scheduled
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} /> : null}
          >
            {cancelling ? "Cancelling..." : `Cancel ${cancellingScheduled?.type === "email" ? "Email" : "SMS"}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog
        open={viewMessageDialog}
        onClose={() => setViewMessageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            {viewingMessage && getMessageIcon(viewingMessage)}
            <Typography variant="h6">
              {viewingMessage?.type === "email" ? "Email Message" : "SMS Message"}
            </Typography>
            {viewingMessage && (
              <Chip
                size="small"
                label={viewingMessage.type === "email" ? "Email" : "SMS"}
                sx={{ 
                  bgcolor: viewingMessage.type === "email" ? "info.50" : "primary.50",
                  color: viewingMessage.type === "email" ? "info.main" : "primary.main",
                }}
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent>
          {viewingMessage && (
            <Stack spacing={2}>
              {/* Subject (for emails) */}
              {viewingMessage.type === "email" && viewingMessage.subject && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    Subject
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {viewingMessage.subject}
                  </Typography>
                </Box>
              )}

              {/* Message Content */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Message
                </Typography>
                {viewingMessage.type === "email" && viewingMessage.html_content ? (
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                      bgcolor: "background.paper",
                      maxHeight: 400,
                      overflowY: "auto",
                      "& img": { maxWidth: "100%", height: "auto" },
                    }}
                    dangerouslySetInnerHTML={{ __html: viewingMessage.html_content }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {viewingMessage.message || viewingMessage.subject || "No message content"}
                  </Typography>
                )}
              </Box>

              {/* Metadata */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      icon={getStatusIcon(viewingMessage.status || "sent")}
                      label={viewingMessage.status || "sent"}
                      color={getStatusColor(viewingMessage.status || "sent")}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {viewingMessage.messageType === "scheduled" || viewingMessage.status === "pending" || viewingMessage.status === "scheduled" ? "Scheduled For" : "Sent At"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDate(
                      viewingMessage.messageType === "scheduled" || viewingMessage.status === "pending" || viewingMessage.status === "scheduled"
                        ? viewingMessage.scheduled_for
                        : viewingMessage.sent_at || viewingMessage.created_at
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Recipients
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {viewingMessage.recipient_count || 0}
                  </Typography>
                </Box>
                {viewingMessage.sent_by && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Sent By
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {viewingMessage.sent_by_name || viewingMessage.sent_by_email || viewingMessage.sent_by}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewMessageDialog(false)}>Close</Button>
          {viewingMessage && viewingMessage.messageType !== "scheduled" && viewingMessage.type === "sms" && (
            <Button
              variant="contained"
              onClick={() => {
                setViewMessageDialog(false);
                handleViewRecipients(viewingMessage);
              }}
            >
              View Recipients
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Box
        component="div"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
        }}
      >
        {snackbar.open && (
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ minWidth: 300 }}
          >
            {snackbar.message}
          </Alert>
        )}
      </Box>
    </Box>
  );
}
