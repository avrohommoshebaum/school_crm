import { useState, useEffect } from "react";
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
  message?: string; // For SMS
  subject?: string; // For email
  body?: string; // For email
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

  // ---------- Load Messages ----------

  const loadMessages = async () => {
    try {
      setLoading(true);
      // For now, only SMS is implemented. In the future, this will fetch from a unified endpoint
      // that returns all message types (SMS, email, robocall)
      const { data } = await api.get("/sms/history", {
        params: { page, limit: 20, includeScheduled: true },
      });
      
      // Transform SMS messages to generic Message format
      const transformedMessages: Message[] = (data.messages || []).map((msg: any) => ({
        ...msg,
        type: msg.type === "scheduled" ? "scheduled" : "sms",
        recipient_count: msg.recipient_phone_numbers?.length || 0,
      }));
      
      // Filter by message type if needed
      const filteredMessages = messageTypeFilter === "all" 
        ? transformedMessages 
        : transformedMessages.filter(m => m.type === messageTypeFilter);
      
      setMessages(filteredMessages);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error: any) {
      console.error("Error loading message history:", error);
      showSnackbar(error?.response?.data?.message || "Error loading message history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [page, messageTypeFilter]);

  // ---------- Handlers ----------

  const showSnackbar = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewRecipients = async (message: Message) => {
    if (message.type === "scheduled") {
      showSnackbar("Recipient details are not available for scheduled messages until they are sent", "info");
      return;
    }

    try {
      setSelectedMessage(message);
      setLoadingRecipients(true);
      setRecipientDetailsDialog(true);

      // For now, only SMS has recipient details endpoint
      // In the future, this will route to the appropriate endpoint based on message type
      if (message.type === "sms") {
        const { data } = await api.get(`/sms/${message.id}/recipients`);
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
    if (message.type !== "scheduled" || message.status !== "pending") {
      return;
    }
    
    // For now, only SMS scheduled messages can be edited
    // In the future, this will support email and robocall scheduled messages

    setEditingScheduled(message);
    const scheduledDate = message.scheduled_for ? new Date(message.scheduled_for) : new Date();
    setEditForm({
      message: message.message,
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
      
      await api.put(`/sms/scheduled/${editingScheduled.id}`, {
        message: editForm.message,
        scheduledFor: scheduledDateTime.toISOString(),
      });

      showSnackbar("Scheduled SMS updated successfully", "success");
      setEditScheduledDialog(false);
      loadMessages();
    } catch (error: any) {
      console.error("Error updating scheduled SMS:", error);
      showSnackbar(error?.response?.data?.message || "Error updating scheduled SMS", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelScheduled = (message: Message) => {
    if (message.type !== "scheduled" || message.status !== "pending") {
      return;
    }
    
    // For now, only SMS scheduled messages can be cancelled
    // In the future, this will support email and robocall scheduled messages
    setCancellingScheduled(message);
    setCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingScheduled) return;

    try {
      setCancelling(true);
      await api.delete(`/sms/scheduled/${cancellingScheduled.id}`);

      showSnackbar("Scheduled SMS cancelled successfully", "success");
      setCancelDialog(false);
      setCancellingScheduled(null);
      loadMessages();
    } catch (error: any) {
      console.error("Error cancelling scheduled SMS:", error);
      showSnackbar(error?.response?.data?.message || "Error cancelling scheduled SMS", "error");
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

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case "email":
        return <Mail size={20} color={theme.palette.primary.main} />;
      case "sms":
        return <MessageSquare size={20} color={theme.palette.primary.main} />;
      case "call":
      case "robocall":
        return <Phone size={20} color={theme.palette.primary.main} />;
      case "scheduled":
        return <Clock size={20} color={theme.palette.warning.main} />;
      default:
        return <MessageSquare size={20} color={theme.palette.primary.main} />;
    }
  };

  const getMessagePreview = (message: Message): string => {
    if (message.type === "email") {
      return message.subject || message.body?.substring(0, 60) || "";
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
          View all sent and scheduled SMS messages
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
                const isScheduled = msg.type === "scheduled";
                const status = isScheduled ? msg.status || "pending" : msg.twilio_status || msg.email_status || msg.call_status || "unknown";
                const date = isScheduled ? msg.scheduled_for : msg.sent_at || msg.created_at;
                const recipientCount = msg.recipient_count || msg.recipient_phone_numbers?.length || msg.recipient_emails?.length || 0;
                const messagePreview = getMessagePreview(msg);

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
                      "&:hover": { bgcolor: "grey.50" },
                    }}
                  >
                    {/* Left */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: isScheduled 
                            ? alpha(theme.palette.warning.light, 0.5)
                            : alpha(theme.palette.primary.light, 0.5),
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {getMessageIcon(msg.type)}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={500} noWrap>
                          {messagePreview.substring(0, 60)}{messagePreview.length > 60 ? "..." : ""}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(date)} • {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                          </Typography>

                          {msg.group_name && (
                            <Chip
                              size="small"
                              label={msg.group_name}
                              sx={{ bgcolor: "primary.50", color: "primary.main" }}
                            />
                          )}

                          {isScheduled && (
                            <Chip
                              size="small"
                              icon={<Calendar size={14} />}
                              label="Scheduled"
                              sx={{ bgcolor: "warning.50", color: "warning.main" }}
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
                        icon={getStatusIcon(status)}
                        label={status}
                        color={getStatusColor(status)}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />

                      {/* View recipients - available for sent SMS, will be extended for email/robocall */}
                      {!isScheduled && msg.type === "sms" && (
                        <Tooltip title="View recipient details">
                          <IconButton size="small" onClick={() => handleViewRecipients(msg)}>
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Edit/Cancel scheduled - currently only for SMS, will be extended */}
                      {isScheduled && status === "pending" && msg.type === "scheduled" && (
                        <>
                          <Tooltip title="Edit scheduled message">
                            <IconButton size="small" onClick={() => handleEditScheduled(msg)}>
                              <Edit size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel scheduled message">
                            <IconButton size="small" color="error" onClick={() => handleCancelScheduled(msg)}>
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
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                variant="outlined"
                size="small"
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ alignSelf: "center" }}>
                Page {page} of {totalPages}
              </Typography>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                variant="outlined"
                size="small"
              >
                Next
              </Button>
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
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6">{recipientDetails.summary.total}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Sent/Delivered
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
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Queued
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {recipientDetails.summary.queued}
                  </Typography>
                </Box>
              </Box>

              {/* Recipients Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{selectedMessage?.type === "sms" || selectedMessage?.type === "robocall" ? "Phone Number" : "Email"}</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recipientDetails.recipients.map((recipient) => (
                      <TableRow key={recipient.id}>
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
            {cancelling ? "Cancelling..." : "Cancel SMS"}
          </Button>
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
