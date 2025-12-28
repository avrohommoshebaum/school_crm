import { useMemo, useState, useEffect } from "react";
import {
  Users,
  Plus,
  Hash,
  Copy,
  Check,
  Edit2,
  Eye,
  Upload,
  Search,
  Trash2,
  X,
  UserPlus,
  Phone,
  MessageSquare,
  Smartphone,
} from "lucide-react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Tooltip,
  TablePagination,
  Tabs,
  Tab,
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

type GroupMember = {
  _id?: string;
  id: string;
  groupId: string;
  name?: string; // Legacy field - kept for backward compatibility
  firstName?: string;
  lastName?: string;
  email?: string; // Legacy field
  phone?: string; // Legacy field
  emails?: string[]; // New array field
  phones?: string[]; // New array field
  additionalFields: Record<string, string>;
  createdAt?: string;
};

type ColumnMapping = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  additionalFields?: Record<string, string>;
};

// ---------- Component ----------

export default function ManageGroups() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  // Dialogs
  const [createGroupDialog, setCreateGroupDialog] = useState(false);
  const [editGroupDialog, setEditGroupDialog] = useState(false);
  const [viewGroupDialog, setViewGroupDialog] = useState(false);
  const [membersDialog, setMembersDialog] = useState(false);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState(false);
  const [deleteMemberDialog, setDeleteMemberDialog] = useState(false);
  const [addSingleMemberDialog, setAddSingleMemberDialog] = useState(false);
  const [bulkImportDialog, setBulkImportDialog] = useState(false);

  // Selected items
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Member dialog tab
  const [memberTab, setMemberTab] = useState(0); // 0: current, 1: add manually, 2: bulk import

  // Forms
  const [groupForm, setGroupForm] = useState({ name: "", description: "", pin: "" });
  const [memberForm, setMemberForm] = useState({ 
    firstName: "", 
    lastName: "", 
    name: "", // Legacy field, kept for backward compatibility
    emails: [""], 
    phones: [""] 
  });
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [editMemberDialog, setEditMemberDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Excel upload
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelSampleRows, setExcelSampleRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [uploading, setUploading] = useState(false);
  const [importErrors, setImportErrors] = useState<Array<{ row: number; error: string; details?: any; data?: any }>>([]);
  const [showImportErrors, setShowImportErrors] = useState(false);
  const [fixErrorDialog, setFixErrorDialog] = useState(false);
  const [editingError, setEditingError] = useState<{ row: number; error: string; details?: any; data?: any } | null>(null);
  const [errorForm, setErrorForm] = useState({ 
    firstName: "", 
    lastName: "", 
    name: "", 
    emails: [""], 
    phones: [""] 
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  // Pagination for members
  const [membersPage, setMembersPage] = useState(0);
  const [membersRowsPerPage, setMembersRowsPerPage] = useState(10);
  
  // Member search
  const [memberSearch, setMemberSearch] = useState("");

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

  // Refresh groups without showing loading state (for smooth updates after actions)
  const refreshGroups = async () => {
    try {
      const { data } = await api.get("/groups");
      setGroups(data.groups || []);
    } catch (error: any) {
      console.error("Error refreshing groups:", error);
      // Don't show error snackbar for background refreshes to avoid noise
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // ---------- Filter Groups ----------

  const filteredGroups = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.name.toLowerCase().includes(search.toLowerCase()) ||
          g.pin.includes(search) ||
          g.description.toLowerCase().includes(search.toLowerCase())
      ),
    [groups, search]
  );

  // ---------- Snackbar ----------

  const showSnackbar = (message: string, severity: AlertColor = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ---------- Group Operations ----------

  const handleCreateGroup = () => {
    setGroupForm({ name: "", description: "", pin: "" });
    setCreateGroupDialog(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || "",
      pin: group.pin,
    });
    setEditGroupDialog(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setSelectedGroup(group);
    setDeleteGroupDialog(true);
  };

  const saveGroup = async () => {
    if (!groupForm.name.trim()) {
      showSnackbar("Group name is required", "error");
      return;
    }

    try {
      setSaving(true);
      if (selectedGroup && editGroupDialog) {
        await api.put(`/groups/${selectedGroup.id}`, {
          name: groupForm.name,
          description: groupForm.description,
          pin: groupForm.pin || undefined,
        });
        showSnackbar("Group updated successfully", "success");
        setEditGroupDialog(false);
      } else {
        await api.post("/groups", {
          name: groupForm.name,
          description: groupForm.description,
          pin: groupForm.pin || undefined,
        });
        showSnackbar("Group created successfully", "success");
        setCreateGroupDialog(false);
      }
      setSelectedGroup(null);
      // Refresh groups in background without showing loading state
      await refreshGroups();
    } catch (error: any) {
      console.error("Error saving group:", error);
      showSnackbar(error?.response?.data?.message || "Error saving group", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      setDeleting(true);
      await api.delete(`/groups/${selectedGroup.id}`);
      showSnackbar("Group deleted successfully", "success");
      setDeleteGroupDialog(false);
      setSelectedGroup(null);
      // Refresh groups in background without showing loading state
      await refreshGroups();
    } catch (error: any) {
      console.error("Error deleting group:", error);
      showSnackbar(error?.response?.data?.message || "Error deleting group", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Member Operations ----------

  const handleViewGroup = async (group: Group) => {
    setSelectedGroup(group);
    setViewGroupDialog(true);
    setMemberSearch(""); // Reset search when opening
    await loadMembers(group.id);
  };

  const handleViewMembers = async (group: Group) => {
    setSelectedGroup(group);
    setMembersDialog(true);
    setMemberTab(0); // Reset to Current Members tab
    setMemberSearch(""); // Reset search when opening
    setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
    setExcelFile(null);
    setColumnMapping({});
    await loadMembers(group.id);
  };

  const loadMembers = async (groupId: string) => {
    try {
      setMembersLoading(true);
      const { data } = await api.get(`/groups/${groupId}/members`);
      setMembers(data.members || []);
    } catch (error: any) {
      console.error("Error loading members:", error);
      showSnackbar(error?.response?.data?.message || "Error loading members", "error");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = () => {
    setMemberTab(1); // Switch to Add Manually tab
    setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
    setEditingMember(null);
  };

  // Format phone for display (adds dashes: 7325514480 -> 732-551-4480)
  const formatPhoneForDisplay = (phone: string): string => {
    if (!phone) return "";
    // Remove any existing formatting
    const normalized = phone.replace(/[\s\-\(\)\.]/g, "");
    // Format US 10-digit numbers: XXX-XXX-XXXX
    if (normalized.length === 10 && /^\d{10}$/.test(normalized)) {
      return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
    }
    // Return as-is for other formats
    return phone;
  };

  // Normalize phone for storage (removes formatting: 732-551-4480 -> 7325514480)
  const normalizePhone = (phone: string): string => {
    if (!phone) return "";
    return phone.replace(/[\s\-\(\)\.]/g, "");
  };

  const handleEditMember = (member: GroupMember) => {
    setEditingMember(member);
    // Convert to arrays, handling both legacy and new formats
    const emails = member.emails || (member.email ? [member.email] : [""]);
    const phones = member.phones || (member.phone ? [member.phone] : [""]);
    // Format phones for display (with dashes)
    const formattedPhones = phones.length > 0 
      ? phones.map(p => formatPhoneForDisplay(p))
      : [""];
    
    // Extract first/last name from member (prioritize firstName/lastName, fall back to splitting name)
    let firstName = member.firstName || "";
    let lastName = member.lastName || "";
    if (!firstName && !lastName && member.name) {
      const nameParts = member.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        firstName = nameParts.slice(0, -1).join(" ");
        lastName = nameParts[nameParts.length - 1];
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
      }
    }
    
    setMemberForm({
      firstName,
      lastName,
      name: member.name || "", // Keep for backward compatibility
      emails: emails.length > 0 ? emails : [""],
      phones: formattedPhones,
    });
    setEditMemberDialog(true);
    // Make sure we're on the view tab, not the add tab
  };

  // Validation functions
  const validatePhone = (phone: string): { valid: boolean; error?: string } => {
    if (!phone || !phone.trim()) {
      return { valid: true }; // Empty phones are allowed (will be filtered out)
    }
    const trimmed = phone.trim();
    // Remove common formatting characters
    const normalized = trimmed.replace(/[\s\-\(\)\.]/g, "");
    const digitCount = normalized.replace(/\+/g, "").length;
    
    if (digitCount < 10) {
      return { valid: false, error: "Phone number must contain at least 10 digits" };
    }
    if (digitCount > 15) {
      return { valid: false, error: "Phone number is too long (maximum 15 digits)" };
    }
    // Basic phone regex validation
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(trimmed)) {
      return { valid: false, error: "Invalid phone number format" };
    }
    return { valid: true };
  };

  const validateEmail = (email: string): { valid: boolean; error?: string } => {
    if (!email || !email.trim()) {
      return { valid: true }; // Empty emails are allowed (will be filtered out)
    }
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: "Invalid email format" };
    }
    if (trimmed.length > 254) {
      return { valid: false, error: "Email is too long (maximum 254 characters)" };
    }
    return { valid: true };
  };

  const saveMember = async () => {
    if (!selectedGroup) return;
    
    // Clear any previous errors
    setMemberError(null);
    
    // Filter out empty emails and phones, but validate non-empty ones
    const emails = memberForm.emails.filter(e => e.trim());
    const phones = memberForm.phones.filter(p => p.trim());
    
    // Validate all emails
    for (let i = 0; i < emails.length; i++) {
      const validation = validateEmail(emails[i]);
      if (!validation.valid) {
        showSnackbar(`Email ${i + 1}: ${validation.error}`, "error");
        return;
      }
    }
    
    // Validate all phones (validate before normalizing)
    for (let i = 0; i < phones.length; i++) {
      const validation = validatePhone(phones[i]);
      if (!validation.valid) {
        showSnackbar(`Phone ${i + 1}: ${validation.error}`, "error");
        return;
      }
    }
    
    // Check for duplicate emails within the form
    const emailSet = new Set(emails.map(e => e.trim().toLowerCase()));
    if (emailSet.size < emails.length) {
      showSnackbar("Duplicate emails are not allowed", "error");
      return;
    }
    
    // Check for duplicate phones within the form (normalize for comparison)
    const phoneSet = new Set(phones.map(p => normalizePhone(p.trim())));
    if (phoneSet.size < phones.length) {
      showSnackbar("Duplicate phone numbers are not allowed", "error");
      return;
    }
    
    // Require either email OR phone (at least one), but name is optional
    if (emails.length === 0 && phones.length === 0) {
      showSnackbar("At least one email or phone number is required", "error");
      return;
    }

    try {
      setSaving(true);
      // Store groupId before any state changes
      const groupId = selectedGroup.id;
      
      // Normalize phones before sending to server (remove formatting)
      const normalizedPhones = phones.map(p => normalizePhone(p.trim()));
      const payload: any = {
        firstName: memberForm.firstName.trim(),
        lastName: memberForm.lastName.trim(),
        emails: emails,
        phones: normalizedPhones, // Send normalized phones to server
      };
      // Only include name if it's provided (for backward compatibility with old data)
      if (memberForm.name && memberForm.name.trim()) {
        payload.name = memberForm.name.trim();
      }
      
      if (editingMember && editMemberDialog) {
        await api.put(`/groups/${groupId}/members/${editingMember.id}`, payload);
        showSnackbar("Member updated successfully", "success");
        // Close edit dialog but keep members dialog open
        setEditMemberDialog(false);
        setEditingMember(null);
        setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
        // Refresh members list while keeping the members dialog open
        // Don't call loadGroups to avoid any state changes that might close the dialog
        await loadMembers(groupId);
      } else {
        await api.post(`/groups/${groupId}/members`, payload);
        showSnackbar("Member added successfully", "success");
        // Close add dialog but keep members dialog open
        setAddSingleMemberDialog(false);
        setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
        // Refresh members list while keeping the members dialog open
        // Don't call loadGroups to avoid any state changes that might close the dialog
        await loadMembers(groupId);
      }
    } catch (error: any) {
      console.error("Error saving member:", error);
      let errorMessage = "Error saving member";
      
      // Try to get the most specific error message
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
        // Use the first error's message
        errorMessage = error.response.data.errors[0].message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Display error in dialog
      setMemberError(errorMessage);
      // Also show snackbar for user awareness
      showSnackbar(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const addEmailField = () => {
    setMemberForm({ ...memberForm, emails: [...memberForm.emails, ""] });
  };

  const removeEmailField = (index: number) => {
    if (memberForm.emails.length > 1) {
      setMemberForm({
        ...memberForm,
        emails: memberForm.emails.filter((_, i) => i !== index),
      });
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...memberForm.emails];
    newEmails[index] = value;
    setMemberForm({ ...memberForm, emails: newEmails });
  };

  const addPhoneField = () => {
    setMemberForm({ ...memberForm, phones: [...memberForm.phones, ""] });
  };

  const removePhoneField = (index: number) => {
    if (memberForm.phones.length > 1) {
      setMemberForm({
        ...memberForm,
        phones: memberForm.phones.filter((_, i) => i !== index),
      });
    }
  };

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...memberForm.phones];
    newPhones[index] = value;
    setMemberForm({ ...memberForm, phones: newPhones });
  };

  // Error form helpers (similar to member form helpers)
  const addErrorEmailField = () => {
    setErrorForm({ ...errorForm, emails: [...errorForm.emails, ""] });
  };

  const removeErrorEmailField = (index: number) => {
    if (errorForm.emails.length > 1) {
      setErrorForm({
        ...errorForm,
        emails: errorForm.emails.filter((_, i) => i !== index),
      });
    }
  };

  const updateErrorEmail = (index: number, value: string) => {
    const newEmails = [...errorForm.emails];
    newEmails[index] = value;
    setErrorForm({ ...errorForm, emails: newEmails });
  };

  const addErrorPhoneField = () => {
    setErrorForm({ ...errorForm, phones: [...errorForm.phones, ""] });
  };

  const removeErrorPhoneField = (index: number) => {
    if (errorForm.phones.length > 1) {
      setErrorForm({
        ...errorForm,
        phones: errorForm.phones.filter((_, i) => i !== index),
      });
    }
  };

  const updateErrorPhone = (index: number, value: string) => {
    const newPhones = [...errorForm.phones];
    newPhones[index] = value;
    setErrorForm({ ...errorForm, phones: newPhones });
  };

  // Save fixed error (add member and remove from errors)
  const saveFixedError = async () => {
    if (!selectedGroup || !editingError) return;
    
    // Clear any previous errors
    setMemberError(null);
    
    // Filter out empty emails and phones, but validate non-empty ones
    const emails = errorForm.emails.filter(e => e.trim());
    const phones = errorForm.phones.filter(p => p.trim());
    
    // Validate all emails
    for (let i = 0; i < emails.length; i++) {
      const validation = validateEmail(emails[i]);
      if (!validation.valid) {
        showSnackbar(`Email ${i + 1}: ${validation.error}`, "error");
        return;
      }
    }
    
    // Validate all phones
    for (let i = 0; i < phones.length; i++) {
      const validation = validatePhone(phones[i]);
      if (!validation.valid) {
        showSnackbar(`Phone ${i + 1}: ${validation.error}`, "error");
        return;
      }
    }
    
    // Check for duplicate emails within the form
    const emailSet = new Set(emails.map(e => e.trim().toLowerCase()));
    if (emailSet.size < emails.length) {
      showSnackbar("Duplicate emails are not allowed", "error");
      return;
    }
    
    // Check for duplicate phones within the form
    const phoneSet = new Set(phones.map(p => normalizePhone(p.trim())));
    if (phoneSet.size < phones.length) {
      showSnackbar("Duplicate phone numbers are not allowed", "error");
      return;
    }
    
    // Require either email OR phone (at least one), but name is optional
    if (emails.length === 0 && phones.length === 0) {
      showSnackbar("At least one email or phone number is required", "error");
      return;
    }

    try {
      setSaving(true);
      const groupId = selectedGroup.id;
      
      // Normalize phones before sending to server
      const normalizedPhones = phones.map(p => normalizePhone(p.trim()));
      const payload: any = {
        firstName: errorForm.firstName.trim(),
        lastName: errorForm.lastName.trim(),
        emails: emails,
        phones: normalizedPhones,
      };
      // Only include name if it's provided
      if (errorForm.name && errorForm.name.trim()) {
        payload.name = errorForm.name.trim();
      }
      
      await api.post(`/groups/${groupId}/members`, payload);
      showSnackbar("Member added successfully", "success");
      
      // Remove this error from the errors list
      const errorRow = editingError.row;
      setImportErrors(prev => {
        const filtered = prev.filter(err => err.row !== errorRow);
        // If no errors left, close the errors dialog
        if (filtered.length === 0) {
          setShowImportErrors(false);
        }
        return filtered;
      });
      
      // Close dialog and reset form
      setFixErrorDialog(false);
      setEditingError(null);
      setErrorForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
    } catch (error: any) {
      console.error("Error saving fixed member:", error);
      const errorMessage = error?.response?.data?.message || "Error saving member";
      const errorDetails = error?.response?.data?.errors;
      if (errorDetails && Array.isArray(errorDetails) && errorDetails.length > 0) {
        const firstError = errorDetails[0];
        showSnackbar(firstError.message || errorMessage, "error");
      } else {
        showSnackbar(errorMessage, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  // Remove error from list (skip this row)
  const removeError = () => {
    if (!editingError) return;
    const errorRow = editingError.row;
    
    // Remove this error from the errors list
    setImportErrors(prev => {
      const filtered = prev.filter(err => err.row !== errorRow);
      // If no errors left, close the errors dialog
      if (filtered.length === 0) {
        setShowImportErrors(false);
      }
      return filtered;
    });
    
    setFixErrorDialog(false);
    setEditingError(null);
    setErrorForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
  };

  const handleDeleteMember = (member: GroupMember) => {
    setSelectedMember(member);
    setDeleteMemberDialog(true);
  };

  const deleteMember = async () => {
    if (!selectedGroup || !selectedMember) return;

    const groupId = selectedGroup.id; // Store groupId before any state changes

    try {
      setDeleting(true);
      await api.delete(`/groups/${groupId}/members/${selectedMember.id}`);
      showSnackbar("Member deleted successfully", "success");
      // Close delete confirmation dialog but keep members dialog open
      setDeleteMemberDialog(false);
      setSelectedMember(null);
      // Refresh members list while keeping the members dialog open
      // Don't call loadGroups to avoid any state changes that might close the dialog
      await loadMembers(groupId);
    } catch (error: any) {
      console.error("Error deleting member:", error);
      showSnackbar(error?.response?.data?.message || "Error deleting member", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Excel Upload ----------

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExcelFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post("/groups/parse-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setExcelHeaders(data.headers || []);
      setExcelSampleRows(data.sampleRows || []);
    } catch (error: any) {
      console.error("Error parsing Excel:", error);
      showSnackbar(error?.response?.data?.message || "Error parsing Excel file", "error");
    }
  };

  const validateColumnMapping = (): string | null => {
    if (!columnMapping.name && !columnMapping.email && !columnMapping.phone) {
      return "Please map at least one field (Name, Email, or Phone)";
    }
    return null;
  };

  const getPreviewData = () => {
    if (!excelSampleRows.length || !excelHeaders.length) return [];

    const preview: Array<{ firstName: string; lastName: string; email: string; phone: string }> = [];
    const firstNameIndex = columnMapping.firstName ? excelHeaders.indexOf(columnMapping.firstName) : -1;
    const lastNameIndex = columnMapping.lastName ? excelHeaders.indexOf(columnMapping.lastName) : -1;
    // nameIndex is kept for legacy support but not used in preview
    const emailIndex = columnMapping.email ? excelHeaders.indexOf(columnMapping.email) : -1;
    const phoneIndex = columnMapping.phone ? excelHeaders.indexOf(columnMapping.phone) : -1;

    excelSampleRows.slice(0, 5).forEach((row) => {
      preview.push({
        firstName: firstNameIndex >= 0 && row[firstNameIndex] ? String(row[firstNameIndex]).trim() : "",
        lastName: lastNameIndex >= 0 && row[lastNameIndex] ? String(row[lastNameIndex]).trim() : "",
        email: emailIndex >= 0 && row[emailIndex] ? String(row[emailIndex]).trim() : "",
        phone: phoneIndex >= 0 && row[phoneIndex] ? String(row[phoneIndex]).trim() : "",
      });
    });

    return preview;
  };

  const handleImportExcel = async () => {
    if (!selectedGroup || !excelFile) return;

    const validationError = validateColumnMapping();
    if (validationError) {
      showSnackbar(validationError, "error");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", excelFile);
      formData.append("groupId", selectedGroup.id);
      formData.append("columnMapping", JSON.stringify(columnMapping));
      formData.append("skipFirstRow", "true");

      const { data } = await api.post(`/groups/${selectedGroup.id}/import-excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      let message = `Import completed: ${data.imported} imported`;
      if (data.errors > 0) {
        message += `, ${data.errors} error${data.errors !== 1 ? "s" : ""}`;
        setImportErrors(data.details?.errors || []);
        setShowImportErrors(true);
      }

      showSnackbar(message, data.imported > 0 ? "success" : data.errors > 0 ? "warning" : "success");
      
      if (data.imported > 0 || data.errors === 0) {
        setExcelFile(null);
        setColumnMapping({});
        await loadMembers(selectedGroup.id);
        // Refresh groups in background without showing loading state
        await refreshGroups();
      }
    } catch (error: any) {
      console.error("Error importing Excel:", error);
      showSnackbar(error?.response?.data?.message || "Error importing Excel file", "error");
    } finally {
      setUploading(false);
    }
  };

  // ---------- Copy PIN ----------

  const copyPin = async (pin: string) => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 1500);
    } catch (error) {
      console.error("Error copying PIN:", error);
    }
  };

  // ---------- Render ----------

  if (loading) {
  return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            Manage Groups
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Create and manage contact groups with PIN codes for quick messaging
          </Typography>
        </Box>

        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          startIcon={<Plus size={20} />}
          onClick={handleCreateGroup}
          sx={{ whiteSpace: "nowrap" }}
        >
          New Group
        </Button>
      </Stack>

      {/* Quick Send Info */}
      <Alert
        severity="info"
        sx={{
          mb: 3,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
            <strong>Quick Send:</strong> Text{" "}
            <strong style={{ fontFamily: "monospace" }}>+1 (833) 000-0000</strong> with PIN + message
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}>
            Example: <strong>1234</strong> School closes early today at 2pm
          </Typography>
        </Stack>
      </Alert>

      {/* Search */}
          <TextField
            fullWidth
            size="small"
        placeholder="Search groups by name, PIN, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
              <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Users size={48} color={theme.palette.text.secondary} style={{ margin: "0 auto 16px" }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {search ? "No groups found" : "No groups yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {search
                ? "Try adjusting your search criteria"
                : "Create your first group to start organizing contacts"}
            </Typography>
            {!search && (
              <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleCreateGroup}>
                Create Your First Group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {filteredGroups.map((group) => (
            <Box key={group.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                  <Stack spacing={2}>
                    {/* Header with Icon, Title, Description, and Member Count */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                        {/* Icon */}
                        <Box
                          sx={{
                            mt: 0.25,
                            flexShrink: 0,
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Users size={32} />
                        </Box>
                        
                        {/* Title and Description */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              mb: 0.25,
                              fontSize: { xs: "1rem", sm: "1.0625rem" },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: "text.primary",
                              lineHeight: 1.3,
                            }}
                          >
                            {group.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                              color: "text.secondary",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: 1.4,
                            }}
                          >
                            {group.description || "No description"}
                      </Typography>
                    </Box>
                      </Stack>

                      {/* Member Count Badge */}
                      <Chip
                        label={group.memberCount || 0}
                        sx={{
                          height: 24,
                          borderRadius: "12px",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          bgcolor: "grey.100",
                          color: "text.primary",
                          border: "none",
                          flexShrink: 0,
                        }}
                      />
                    </Stack>

                    {/* PIN Display Field */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "grey.50",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Hash size={16} style={{ color: theme.palette.text.secondary }} />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                          }}
                        >
                          PIN:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 600,
                            fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                            color: "primary.main",
                          }}
                        >
                          {group.pin}
                        </Typography>
                      </Stack>

                      <Tooltip title={copiedPin === group.pin ? "Copied!" : "Copy PIN"}>
                        <IconButton
                        size="small"
                        onClick={() => copyPin(group.pin)}
                          sx={{
                            ml: 1,
                            flexShrink: 0,
                            height: 24,
                            width: 24,
                            p: 0.5,
                            "&:hover": {
                              bgcolor: "transparent",
                            },
                          }}
                      >
                        {copiedPin === group.pin ? (
                            <Check size={12} style={{ color: "#16a34a" }} />
                        ) : (
                            <Copy size={12} style={{ color: theme.palette.text.secondary }} />
                        )}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit2 size={12} />}
                        onClick={() => handleEditGroup(group)}
                        sx={{
                          flex: 1,
                          borderColor: "primary.main",
                          color: "primary.main",
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          py: 0.75,
                          minHeight: 32,
                          "& .MuiButton-startIcon": {
                            marginRight: 0.5,
                          },
                          "&:hover": {
                            borderColor: "primary.dark",
                            bgcolor: "transparent",
                          },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Eye size={12} />}
                        onClick={() => handleViewGroup(group)}
                        sx={{
                          flex: 1,
                          borderColor: "primary.main",
                          color: "primary.main",
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "0.8125rem",
                          py: 0.75,
                          minHeight: 32,
                          "& .MuiButton-startIcon": {
                            marginRight: 0.5,
                          },
                          "&:hover": {
                            borderColor: "primary.dark",
                            bgcolor: "transparent",
                          },
                        }}
                      >
                        View
                      </Button>
                    </Stack>

                    {/* Manage Members Link */}
                    <Button
                      size="small"
                      fullWidth
                      startIcon={<UserPlus size={12} />}
                      onClick={() => handleViewMembers(group)}
                      sx={{
                        color: "primary.main",
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: "0.8125rem",
                        justifyContent: "center",
                        py: 0.75,
                        minHeight: 32,
                        bgcolor: "transparent",
                        "& .MuiButton-startIcon": {
                          marginRight: 0.5,
                        },
                        "&:hover": {
                          bgcolor: "primary.50",
                        },
                      }}
                    >
                      Manage Members
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
            ))}
          </Box>
      )}

      {/* Create Group Dialog */}
      <Dialog
        open={createGroupDialog}
        onClose={() => {
          if (!saving) setCreateGroupDialog(false);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" }, fontWeight: 600 }}>
          Create New Group
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              required
              autoFocus
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              label="Description"
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              multiline
              rows={3}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              label="PIN (optional)"
              value={groupForm.pin}
              onChange={(e) => setGroupForm({ ...groupForm, pin: e.target.value })}
              helperText="Leave empty to auto-generate a unique 4-digit PIN"
              size={isMobile ? "small" : "medium"}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setCreateGroupDialog(false)} disabled={saving} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveGroup}
            disabled={saving || !groupForm.name.trim()}
            startIcon={saving ? <CircularProgress size={16} /> : null}
            fullWidth={isMobile}
          >
            {saving ? "Creating..." : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog
        open={editGroupDialog}
        onClose={() => {
          if (!saving) {
            setEditGroupDialog(false);
            setSelectedGroup(null);
          }
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" }, fontWeight: 600 }}>
          Edit Group
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupForm.name}
              onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              required
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              label="Description"
              value={groupForm.description}
              onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              multiline
              rows={3}
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              label="PIN"
              value={groupForm.pin}
              onChange={(e) => setGroupForm({ ...groupForm, pin: e.target.value })}
              helperText="Change PIN only if needed. Make sure it's unique."
              size={isMobile ? "small" : "medium"}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1, justifyContent: "space-between" }}>
          <Button
            color="error"
            onClick={() => {
              setEditGroupDialog(false);
              handleDeleteGroup(selectedGroup!);
            }}
            disabled={saving}
            startIcon={<Trash2 size={16} />}
            sx={{ mr: "auto" }}
          >
            Delete
          </Button>
          <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
            <Button onClick={() => setEditGroupDialog(false)} disabled={saving} fullWidth={isMobile}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveGroup}
              disabled={saving || !groupForm.name.trim()}
              startIcon={saving ? <CircularProgress size={16} /> : null}
              fullWidth={isMobile}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <Dialog
        open={deleteGroupDialog}
        onClose={() => {
          if (!deleting) {
            setDeleteGroupDialog(false);
            setSelectedGroup(null);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 3 },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
          Delete Group
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>{selectedGroup?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will permanently delete the group and all {selectedGroup?.memberCount || 0} member(s) in it.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setDeleteGroupDialog(false)} disabled={deleting} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteGroup}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
            fullWidth={isMobile}
          >
            {deleting ? "Deleting..." : "Delete Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Group Dialog */}
      <Dialog
        open={viewGroupDialog}
        onClose={() => {
          setViewGroupDialog(false);
          setSelectedGroup(null);
          setMemberSearch("");
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(85vh)" },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Users size={isMobile ? 18 : 20} style={{ color: "#1e40af" }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: { xs: "1rem", sm: "1.125rem" }, 
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selectedGroup?.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  display: "block",
                }}
              >
                {selectedGroup?.description || ""}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ flex: 1, overflow: "auto", px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* Group Info Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(3, 1fr)" },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {/* Members Count */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: "#eff6ff",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "#bfdbfe",
                }}
              >
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: "0.625rem", sm: "0.75rem" }, 
                    display: "block", 
                    mb: 0.5,
                    lineHeight: 1.2,
                  }}
                >
                  Members
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: "#1e3a8a", 
                    fontWeight: 600, 
                    fontSize: { xs: "1.125rem", sm: "1.5rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {selectedGroup?.memberCount || members.length}
                </Typography>
              </Box>

              {/* PIN Code */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: "#faf5ff",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "#e9d5ff",
                }}
              >
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: "0.625rem", sm: "0.75rem" }, 
                    display: "block", 
                    mb: { xs: 0.5, sm: 1 },
                    lineHeight: 1.2,
                  }}
                >
                  PIN Code
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: "#6b21a8", 
                    fontWeight: 600, 
                    fontSize: { xs: "1.125rem", sm: "1.5rem" }, 
                    fontFamily: "monospace",
                    lineHeight: 1.2,
                  }}
                >
                  {selectedGroup?.pin}
                </Typography>
              </Box>

              {/* Status */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: "#f0fdf4",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "#bbf7d0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: "0.625rem", sm: "0.75rem" }, 
                    display: "block", 
                    mb: { xs: 0.5, sm: 1 },
                    lineHeight: 1.2,
                  }}
                >
                  Status
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#166534", 
                    fontWeight: 600, 
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    lineHeight: 1.2,
                  }}
                >
                  Active
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Quick Send Instructions */}
            <Alert
              icon={<Smartphone size={isMobile ? 14 : 16} />}
              sx={{
                bgcolor: "#eff6ff",
                border: 1,
                borderColor: "#bfdbfe",
                "& .MuiAlert-icon": {
                  color: "#1e40af",
                  alignItems: "flex-start",
                  mt: 0.5,
                },
                py: 1.5,
              }}
            >
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: "#1e3a8a", 
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    mb: 0.5,
                  }}
                >
                  <strong>Quick Send:</strong> Text{" "}
                  <Typography 
                    component="strong" 
                    sx={{ 
                      fontFamily: "monospace", 
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      fontWeight: 600,
                    }}
                  >
                    +1 (833) 000-0000
                  </Typography>
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#64748b",
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    fontFamily: "monospace",
                    display: "block",
                  }}
                >
                  {selectedGroup?.pin} Your message here
                </Typography>
              </Box>
            </Alert>

            <Divider />

            {/* Members List */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    fontSize: { xs: "0.875rem", sm: "0.9375rem" } 
                  }}
                >
                  Group Members
                </Typography>
                <Chip
                  label={`${members.length} member${members.length !== 1 ? "s" : ""}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.75rem" }}
                />
              </Stack>

              {/* Search Box */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search members by name, email, or phone..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} style={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: memberSearch && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setMemberSearch("")}
                        sx={{ p: 0.5 }}
                      >
                        <X size={16} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Members List */}
              {membersLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (() => {
                const filteredMembers = memberSearch
                  ? members.filter((m) => {
                      const searchLower = memberSearch.toLowerCase();
                      const name = (m.name || "").toLowerCase();
                      const firstName = (m.firstName || "").toLowerCase();
                      const lastName = (m.lastName || "").toLowerCase();
                      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
                      const emails = (m.emails || (m.email ? [m.email] : [])).join(" ").toLowerCase();
                      const phones = (m.phones || (m.phone ? [m.phone] : [])).join(" ").toLowerCase();
                      return name.includes(searchLower) || firstName.includes(searchLower) || lastName.includes(searchLower) || fullName.includes(searchLower) || emails.includes(searchLower) || phones.includes(searchLower);
                    })
                  : members;

                return filteredMembers.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: { xs: 6, sm: 8 } }}>
                    <Users size={isMobile ? 40 : 48} style={{ color: theme.palette.text.disabled, margin: "0 auto 16px" }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}
                    >
                      {memberSearch ? "No members found matching your search." : "Members list not available"}
                    </Typography>
                    {!memberSearch && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: "block", mt: 1, fontSize: { xs: "0.75rem", sm: "0.8125rem" } }}
                      >
                        This group has {selectedGroup?.memberCount || members.length} member{selectedGroup?.memberCount !== 1 ? "s" : ""}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      maxHeight: { xs: "250px", sm: "300px" },
                      overflow: "auto",
                    }}
                  >
                    {filteredMembers.map((member, index) => (
                      <Box
                        key={member.id}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderBottom: index < filteredMembers.length - 1 ? 1 : 0,
                          borderColor: "divider",
                          "&:hover": {
                            bgcolor: "grey.50",
                          },
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500, 
                              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                              color: "text.primary",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {(() => {
                              if (member.lastName || member.firstName) {
                                const lastName = member.lastName || "";
                                const firstName = member.firstName || "";
                                return lastName && firstName
                                  ? `${lastName}, ${firstName}`
                                  : lastName || firstName || member.name || "—";
                              }
                              return member.name || "—";
                            })()}
                          </Typography>
                          <Stack spacing={0.5}>
                            {(member.phones || (member.phone ? [member.phone] : [])).length > 0 && (
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Phone size={14} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {(member.phones || [member.phone]).map(p => formatPhoneForDisplay(p || "")).join(", ")}
                                </Typography>
                              </Stack>
                            )}
                            {(member.emails || (member.email ? [member.email] : [])).length > 0 && (
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <MessageSquare size={14} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {(member.emails || [member.email]).join(", ")}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                );
              })()}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: 1, borderColor: "divider", gap: 1 }}>
          <Button 
            onClick={() => setViewGroupDialog(false)} 
            variant="outlined"
            fullWidth={isMobile}
            sx={{ 
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
              minHeight: { xs: 36, sm: 36 },
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit2 size={isMobile ? 14 : 16} />}
            onClick={() => {
              setViewGroupDialog(false);
              if (selectedGroup) handleEditGroup(selectedGroup);
            }}
            fullWidth={isMobile}
            sx={{ 
              textTransform: "none",
              fontSize: { xs: "0.875rem", sm: "0.9375rem" },
              bgcolor: "#1e40af",
              "&:hover": {
                bgcolor: "#1e3a8a",
              },
              minHeight: { xs: 36, sm: 36 },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Edit Group
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Edit
            </Box>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Members Dialog with Tabs */}
      <Dialog
        open={membersDialog}
        onClose={() => {
          setMembersDialog(false);
          setSelectedGroup(null);
          setMembers([]);
          setMembersPage(0);
          setMemberSearch("");
          setExcelFile(null);
          setColumnMapping({});
        }}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <UserPlus size={isMobile ? 18 : 20} style={{ color: "#1e40af" }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: { xs: "1rem", sm: "1.125rem" }, 
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Manage: {selectedGroup?.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  display: "block",
                }}
              >
                Add or remove contacts from this group
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", px: 0, py: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={memberTab}
              onChange={(_, newValue) => setMemberTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 48,
                "& .MuiTab-root": {
                  minHeight: 48,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  textTransform: "none",
                  px: { xs: 1.5, sm: 2 },
                },
              }}
            >
              <Tab label="Current Members" />
              <Tab label="Add Manually" />
              <Tab label="Upload Excel" />
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
            {/* Tab 0: Current Members */}
            {memberTab === 0 && (
              <Stack spacing={2}>
                {/* Search Box */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search members by name, email, or phone..."
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setMembersPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={18} />
                      </InputAdornment>
                    ),
                    endAdornment: memberSearch && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setMemberSearch("");
                            setMembersPage(0);
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <X size={16} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

              {/* Filtered Members */}
              {(() => {
                const filteredMembers = memberSearch
                  ? members.filter((m) => {
                      const searchLower = memberSearch.toLowerCase();
                      const name = (m.name || "").toLowerCase();
                      const firstName = (m.firstName || "").toLowerCase();
                      const lastName = (m.lastName || "").toLowerCase();
                      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
                      const emails = (m.emails || (m.email ? [m.email] : [])).join(" ").toLowerCase();
                      const phones = (m.phones || (m.phone ? [m.phone] : [])).join(" ").toLowerCase();
                      return name.includes(searchLower) || firstName.includes(searchLower) || lastName.includes(searchLower) || fullName.includes(searchLower) || emails.includes(searchLower) || phones.includes(searchLower);
                    })
                  : members;

                return membersLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredMembers.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      {memberSearch ? "No members found matching your search." : "No members in this group yet."}
                    </Typography>
                    {!memberSearch && (
                      <Button
                        variant="contained"
                        startIcon={<Plus size={16} />}
                        onClick={handleAddMember}
                        sx={{ mt: 2 }}
                      >
                        Add First Member
                      </Button>
                    )}
                  </Box>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <TableContainer sx={{ display: { xs: "none", sm: "block" } }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredMembers
                            .slice(membersPage * membersRowsPerPage, membersPage * membersRowsPerPage + membersRowsPerPage)
                            .map((member: GroupMember) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                {(() => {
                                  // Display: Last Name, First Name (if available) or fallback to name
                                  if (member.lastName || member.firstName) {
                                    const lastName = member.lastName || "";
                                    const firstName = member.firstName || "";
                                    return lastName && firstName 
                                      ? `${lastName}, ${firstName}`
                                      : lastName || firstName || member.name || "—";
                                  }
                                  return member.name || "—";
                                })()}
                              </TableCell>
                              <TableCell>
                                {(member.emails || (member.email ? [member.email] : [])).length > 0
                                  ? (member.emails || [member.email]).join(", ")
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {(member.phones || (member.phone ? [member.phone] : [])).length > 0
                                  ? (member.phones || [member.phone]).map(p => formatPhoneForDisplay(p || "")).join(", ")
                                  : "—"}
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                  <Tooltip title="Edit Member">
                                    <IconButton size="small" onClick={() => handleEditMember(member)}>
                                      <Edit2 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Member">
                                    <IconButton size="small" color="error" onClick={() => handleDeleteMember(member)}>
                                      <Trash2 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                    {/* Mobile Card View */}
                    <Stack spacing={1.5} sx={{ display: { xs: "flex", sm: "none" } }}>
                      {filteredMembers
                        .slice(membersPage * membersRowsPerPage, membersPage * membersRowsPerPage + membersRowsPerPage)
                        .map((member: GroupMember) => (
                        <Card key={member.id} variant="outlined" sx={{ borderRadius: 1 }}>
                          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1 } }}>
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={.5}
                                sx={{ minHeight: 0 }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: "0.875rem",
                                    lineHeight: 1.3,
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    pr: 1,
                                  }}
                                >
                                  {(() => {
                                    // Display: Last Name, First Name (if available) or fallback to name
                                    if (member.lastName || member.firstName) {
                                      const lastName = member.lastName || "";
                                      const firstName = member.firstName || "";
                                      return lastName && firstName 
                                        ? `${lastName}, ${firstName}`
                                        : lastName || firstName || member.name || "—";
                                    }
                                    return member.name || "—";
                                  })()}
                                </Typography>
                                <Box
                                  sx={{
                                    flexShrink: 0,
                                    display: "flex",
                                    flexDirection: "row",
                                    gap: 0.25,
                                    alignItems: "center",
                                    flexWrap: "nowrap",
                                    minWidth: "fit-content",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditMember(member)}
                                    sx={{
                                      p: 0.75,
                                      minWidth: 32,
                                      width: 32,
                                      height: 32,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Edit2 size={16} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteMember(member)}
                                    sx={{
                                      p: 0.75,
                                      minWidth: 32,
                                      width: 32,
                                      height: 32,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Box>
                              </Stack>

                              {(member.emails || (member.email ? [member.email] : [])).length > 0 && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "block",
                                      fontSize: "0.7rem",
                                      mb: 0.25,
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    Email{((member.emails || [member.email]).length > 1) ? "s" : ""}:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.75rem",
                                      lineHeight: 1.3,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {(member.emails || [member.email]).join(", ")}
                                  </Typography>
                                </Box>
                              )}

                              {(member.phones || (member.phone ? [member.phone] : [])).length > 0 && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      display: "block",
                                      fontSize: "0.7rem",
                                      mb: 0.25,
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    Phone{((member.phones || [member.phone]).length > 1) ? "s" : ""}:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.75rem",
                                      lineHeight: 1.3,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {(member.phones || [member.phone]).map(p => formatPhoneForDisplay(p || "")).join(", ")}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
        </CardContent>
      </Card>
                      ))}
                  </Stack>

                  {/* Pagination */}
                  <TablePagination
                    component="div"
                    count={filteredMembers.length}
                    page={membersPage}
                    onPageChange={(_, newPage) => setMembersPage(newPage)}
                    rowsPerPage={membersRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setMembersRowsPerPage(parseInt(e.target.value, 10));
                      setMembersPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                      "& .MuiTablePagination-toolbar": {
                        flexWrap: "wrap",
                        gap: 1,
                      },
                      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      },
                    }}
                  />
                </>
              );
              })()}
              </Stack>
            )}

            {/* Tab 1: Add Manually */}
            {memberTab === 1 && (
              <Stack spacing={3}>
                <Alert severity="info" sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
                  Add a new contact manually. This contact will be saved to the system and added to this group.
                </Alert>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={memberForm.firstName}
                    onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                    size={isMobile ? "small" : "medium"}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={memberForm.lastName}
                    onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                    size={isMobile ? "small" : "medium"}
                  />
                </Stack>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                    Phone Numbers (Required if no email provided)
                  </Typography>
                  <Stack spacing={1.5}>
                    {memberForm.phones.map((phone, index) => (
                      <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                        <TextField
                          fullWidth
                          label={`Phone ${index + 1}`}
                          value={phone}
                          onChange={(e) => updatePhone(index, e.target.value)}
                          size={isMobile ? "small" : "medium"}
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                        {memberForm.phones.length > 1 && (
                          <IconButton
                            size={isMobile ? "medium" : "small"}
                            color="error"
                            onClick={() => removePhoneField(index)}
                            sx={{ alignSelf: { xs: "flex-end", sm: "flex-start" }, mt: { xs: -1, sm: 0 } }}
                          >
                            <X size={isMobile ? 20 : 16} />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                    <Button
                      size={isMobile ? "medium" : "small"}
                      variant="outlined"
                      onClick={addPhoneField}
                      startIcon={<Plus size={isMobile ? 18 : 14} />}
                      sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                    >
                      Add Phone
                    </Button>
                  </Stack>
    </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                    Email Addresses (Required if no phone provided)
                  </Typography>
                  <Stack spacing={1.5}>
                    {memberForm.emails.map((email, index) => (
                      <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                        <TextField
                          fullWidth
                          label={`Email ${index + 1}`}
                          type="email"
                          value={email}
                          onChange={(e) => updateEmail(index, e.target.value)}
                          size={isMobile ? "small" : "medium"}
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                        {memberForm.emails.length > 1 && (
                          <IconButton
                            size={isMobile ? "medium" : "small"}
                            color="error"
                            onClick={() => removeEmailField(index)}
                            sx={{ alignSelf: { xs: "flex-end", sm: "flex-start" }, mt: { xs: -1, sm: 0 } }}
                          >
                            <X size={isMobile ? 20 : 16} />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                    <Button
                      size={isMobile ? "medium" : "small"}
                      variant="outlined"
                      onClick={addEmailField}
                      startIcon={<Plus size={isMobile ? 18 : 14} />}
                      sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                    >
                      Add Email
                    </Button>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  onClick={saveMember}
                  disabled={saving || (memberForm.emails.filter((e: string) => e.trim()).length === 0 && memberForm.phones.filter((p: string) => p.trim()).length === 0)}
                  startIcon={saving ? <CircularProgress size={16} /> : <Plus size={16} />}
                  fullWidth
                  sx={{ bgcolor: "#1e40af", "&:hover": { bgcolor: "#1e3a8a" } }}
                >
                  {saving ? "Adding..." : "Add Contact to Group"}
                </Button>
              </Stack>
            )}

            {/* Tab 2: Upload Excel */}
            {memberTab === 2 && (
              <Stack spacing={3}>
                <Alert severity="info" sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
                  Upload an Excel file (.xlsx, .xls) with contact information. At least one phone number (Cell or Home) is required per contact.
                </Alert>

                <Button variant="outlined" component="label" startIcon={<Upload size={16} />} fullWidth>
                  {excelFile ? excelFile.name : "Choose Excel File"}
                  <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
                </Button>

                {excelFile && excelHeaders.length > 0 && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">Map Excel Columns to Fields</Typography>

                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>First Name Column</InputLabel>
                        <Select
                          value={columnMapping.firstName || "none"}
                          label="First Name Column"
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, firstName: e.target.value === "none" ? undefined : e.target.value })
                          }
                        >
                          <MenuItem value="none">None</MenuItem>
                          {excelHeaders.map((header) => (
                            <MenuItem key={header} value={header}>
                              {header}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Last Name Column</InputLabel>
                        <Select
                          value={columnMapping.lastName || "none"}
                          label="Last Name Column"
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, lastName: e.target.value === "none" ? undefined : e.target.value })
                          }
                        >
                          <MenuItem value="none">None</MenuItem>
                          {excelHeaders.map((header) => (
                            <MenuItem key={header} value={header}>
                              {header}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Email Column</InputLabel>
                        <Select
                          value={columnMapping.email || "none"}
                          label="Email Column"
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, email: e.target.value === "none" ? undefined : e.target.value })
                          }
                        >
                          <MenuItem value="none">None</MenuItem>
                          {excelHeaders.map((header) => (
                            <MenuItem key={header} value={header}>
                              {header}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Phone Column</InputLabel>
                        <Select
                          value={columnMapping.phone || "none"}
                          label="Phone Column"
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, phone: e.target.value === "none" ? undefined : e.target.value })
                          }
                        >
                          <MenuItem value="none">None</MenuItem>
                          {excelHeaders.map((header) => (
                            <MenuItem key={header} value={header}>
                              {header}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>

                    {getPreviewData().length > 0 && (columnMapping.firstName || columnMapping.lastName || columnMapping.name || columnMapping.email || columnMapping.phone) && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Preview of Mapped Data (first 5 rows)
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>First Name</TableCell>
                                  <TableCell>Last Name</TableCell>
                                  <TableCell>Email</TableCell>
                                  <TableCell>Phone</TableCell>
                                  <TableCell>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getPreviewData().map((preview, idx) => {
                                  const hasData = preview.firstName || preview.lastName || preview.email || preview.phone;
                                  return (
                                    <TableRow key={idx}>
                                      <TableCell>{preview.firstName || "—"}</TableCell>
                                      <TableCell>{preview.lastName || "—"}</TableCell>
                                      <TableCell>{preview.email || "—"}</TableCell>
                                      <TableCell>{preview.phone || "—"}</TableCell>
                                      <TableCell>
                                        {hasData ? (
                                          <Chip label="Valid" color="success" size="small" />
                                        ) : (
                                          <Chip label="Will be skipped" color="error" size="small" />
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </>
                    )}
                  </>
                )}

                <Button
                  variant="contained"
                  onClick={handleImportExcel}
                  disabled={uploading || !excelFile || (!columnMapping.firstName && !columnMapping.lastName && !columnMapping.name && !columnMapping.email && !columnMapping.phone)}
                  startIcon={uploading ? <CircularProgress size={16} /> : <Upload size={16} />}
                  fullWidth
                  sx={{ bgcolor: "#1e40af", "&:hover": { bgcolor: "#1e3a8a" } }}
                >
                  {uploading ? "Importing..." : "Import Members"}
                </Button>
              </Stack>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, borderTop: 1, borderColor: "divider" }}>
          <Button 
            onClick={() => {
              setMembersDialog(false);
              setMemberTab(0);
              setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
              setExcelFile(null);
              setColumnMapping({});
            }} 
            variant="outlined"
            fullWidth={isMobile}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Errors Dialog */}
      <Dialog
        open={showImportErrors}
        onClose={() => setShowImportErrors(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" }, fontWeight: 600 }}>
          Import Errors ({importErrors.length} errors)
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Please review the errors below. You can fix individual errors or update your Excel file and try importing again.
            </Alert>
            <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
              <Stack spacing={1.5}>
                {importErrors.map((error, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                          <Typography variant="subtitle2" color="error" sx={{ flex: 1 }}>
                            Row {error.row}: {error.error}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => {
                                // Skip this error row
                                setImportErrors(prev => {
                                  const filtered = prev.filter(err => err.row !== error.row);
                                  if (filtered.length === 0) {
                                    setShowImportErrors(false);
                                  }
                                  return filtered;
                                });
                              }}
                              sx={{ textTransform: "none" }}
                            >
                              Skip
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Edit2 size={14} />}
                              onClick={() => {
                                setEditingError(error);
                                setErrorForm({
                                  firstName: error.data?.firstName || "",
                                  lastName: error.data?.lastName || "",
                                  name: error.data?.name || "",
                                  emails: error.data?.emails && error.data.emails.length > 0 ? error.data.emails : [""],
                                  phones: error.data?.phones && error.data.phones.length > 0 ? error.data.phones : [""],
                                });
                                setFixErrorDialog(true);
                              }}
                              sx={{ textTransform: "none" }}
                            >
                              Fix
                            </Button>
                          </Stack>
                        </Stack>
                        {error.data && (
                          <Box sx={{ pl: 1, borderLeft: 2, borderColor: "divider" }}>
                            {(error.data.firstName || error.data.lastName) && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                Name: {[error.data.firstName, error.data.lastName].filter(Boolean).join(" ") || "—"}
                              </Typography>
                            )}
                            {error.data.name && !error.data.firstName && !error.data.lastName && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                Name: {error.data.name}
                              </Typography>
                            )}
                            {error.data.emails && error.data.emails.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                Email{error.data.emails.length > 1 ? "s" : ""}: {error.data.emails.join(", ")}
                              </Typography>
                            )}
                            {error.data.phones && error.data.phones.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                Phone{error.data.phones.length > 1 ? "s" : ""}: {error.data.phones.join(", ")}
                              </Typography>
                            )}
                          </Box>
                        )}
                        {error.details && Array.isArray(error.details) && error.details.length > 0 && (
                          <Box>
                            <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>
                              Details:
                            </Typography>
                            {error.details.map((detail: any, detailIndex: number) => (
                              <Typography key={detailIndex} variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                • {detail.message}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2.5 } }}>
          <Button onClick={() => setShowImportErrors(false)} variant="contained" fullWidth={isMobile}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fix Error Dialog */}
      <Dialog
        open={fixErrorDialog}
        onClose={() => {
          if (!saving) {
            setFixErrorDialog(false);
            setEditingError(null);
            setErrorForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
          }
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" }, fontWeight: 600 }}>
          Fix Error - Row {editingError?.row}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: 1 }}>
            {editingError && (
              <>
                <Alert severity="warning" sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
                  <Typography variant="caption" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>
                    Error: {editingError.error}
                  </Typography>
                  {editingError.details && Array.isArray(editingError.details) && editingError.details.length > 0 && (
                    <Box>
                      {editingError.details.map((detail: any, detailIndex: number) => (
                        <Typography key={detailIndex} variant="caption" sx={{ display: "block" }}>
                          • {detail.message}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Alert>
                <Divider />
              </>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={errorForm.firstName}
                onChange={(e) => setErrorForm({ ...errorForm, firstName: e.target.value })}
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={errorForm.lastName}
                onChange={(e) => setErrorForm({ ...errorForm, lastName: e.target.value })}
                size={isMobile ? "small" : "medium"}
              />
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                Phone Numbers (At least one required) *
              </Typography>
              <Stack spacing={1.5}>
                {errorForm.phones.map((phone, index) => (
                  <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                    <TextField
                      fullWidth
                      label={`Phone ${index + 1}`}
                      value={phone}
                      onChange={(e) => updateErrorPhone(index, e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    {errorForm.phones.length > 1 && (
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        color="error"
                        onClick={() => removeErrorPhoneField(index)}
                        sx={{ alignSelf: { xs: "flex-end", sm: "flex-start" }, mt: { xs: -1, sm: 0 } }}
                      >
                        <X size={isMobile ? 20 : 16} />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  onClick={addErrorPhoneField}
                  startIcon={<Plus size={isMobile ? 18 : 14} />}
                  sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                >
                  Add Phone
                </Button>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                Email Addresses
              </Typography>
              <Stack spacing={1.5}>
                {errorForm.emails.map((email, index) => (
                  <Stack key={index} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                    <TextField
                      fullWidth
                      label={`Email ${index + 1}`}
                      type="email"
                      value={email}
                      onChange={(e) => updateErrorEmail(index, e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    {errorForm.emails.length > 1 && (
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        color="error"
                        onClick={() => removeErrorEmailField(index)}
                        sx={{ alignSelf: { xs: "flex-end", sm: "flex-start" }, mt: { xs: -1, sm: 0 } }}
                      >
                        <X size={isMobile ? 20 : 16} />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  onClick={addErrorEmailField}
                  startIcon={<Plus size={isMobile ? 18 : 14} />}
                  sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                >
                  Add Email
                </Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button
            onClick={removeError}
            disabled={saving}
            color="error"
            variant="outlined"
            fullWidth={isMobile}
          >
            Skip Row
          </Button>
          <Button
            onClick={() => {
              setFixErrorDialog(false);
              setEditingError(null);
              setErrorForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
            }}
            disabled={saving}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveFixedError}
            disabled={saving || (errorForm.emails.filter((e: string) => e.trim()).length === 0 && errorForm.phones.filter((p: string) => p.trim()).length === 0)}
            startIcon={saving ? <CircularProgress size={16} /> : <Check size={16} />}
            fullWidth={isMobile}
            sx={{ bgcolor: "#1e40af", "&:hover": { bgcolor: "#1e3a8a" } }}
          >
            {saving ? "Saving..." : "Save & Add Member"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog
        open={editMemberDialog}
        onClose={() => {
          if (!saving) {
            setEditMemberDialog(false);
            setEditingMember(null);
            setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
            setMemberError(null);
          }
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" }, fontWeight: 600 }}>
          Edit Member
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: 1 }}>
            {memberError && (
              <Alert severity="error" onClose={() => setMemberError(null)} sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
                {memberError}
              </Alert>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={memberForm.firstName}
                onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={memberForm.lastName}
                onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                size={isMobile ? "small" : "medium"}
              />
            </Stack>
            
            {/* Emails */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                Email Addresses
              </Typography>
              <Stack spacing={1.5}>
                {memberForm.emails.map((email, index) => (
                  <Stack
                    key={index}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "flex-start" }}
                  >
                    <TextField
                      fullWidth
                      label={`Email ${index + 1}`}
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    {memberForm.emails.length > 1 && (
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        color="error"
                        onClick={() => removeEmailField(index)}
                        sx={{
                          alignSelf: { xs: "flex-end", sm: "flex-start" },
                          mt: { xs: -1, sm: 0 },
                          mb: { xs: 0.5, sm: 0 },
                        }}
                      >
                        <X size={isMobile ? 20 : 16} />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  onClick={addEmailField}
                  startIcon={<Plus size={isMobile ? 18 : 14} />}
                  sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                >
                  Add Email
                </Button>
              </Stack>
            </Box>

            {/* Phones */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                Phone Numbers
              </Typography>
              <Stack spacing={1.5}>
                {memberForm.phones.map((phone, index) => (
                  <Stack
                    key={index}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "flex-start" }}
                  >
                    <TextField
                      fullWidth
                      label={`Phone ${index + 1}`}
                      value={phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    {memberForm.phones.length > 1 && (
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        color="error"
                        onClick={() => removePhoneField(index)}
                        sx={{
                          alignSelf: { xs: "flex-end", sm: "flex-start" },
                          mt: { xs: -1, sm: 0 },
                          mb: { xs: 0.5, sm: 0 },
                        }}
                      >
                        <X size={isMobile ? 20 : 16} />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  onClick={addPhoneField}
                  startIcon={<Plus size={isMobile ? 18 : 14} />}
                  sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                >
                  Add Phone
                </Button>
              </Stack>
            </Box>

            <Alert severity="info" sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
              At least one email or phone number is required. Name is optional.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => {
            setEditMemberDialog(false);
            setEditingMember(null);
            setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
          }} disabled={saving} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveMember}
            disabled={saving || (memberForm.emails.filter((e: string) => e.trim()).length === 0 && memberForm.phones.filter((p: string) => p.trim()).length === 0)}
            startIcon={saving ? <CircularProgress size={16} /> : null}
            fullWidth={isMobile}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Member Confirmation Dialog */}
      <Dialog
        open={deleteMemberDialog}
        onClose={() => {
          if (!deleting) {
            setDeleteMemberDialog(false);
            setSelectedMember(null);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 3 },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
          Delete Member
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to delete this member from <strong>{selectedGroup?.name}</strong>?
          </Typography>
          {selectedMember && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {selectedMember.name || "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {selectedMember.email || "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {selectedMember.phone || "—"}
              </Typography>
          </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setDeleteMemberDialog(false)} disabled={deleting} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteMember}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
            fullWidth={isMobile}
          >
            {deleting ? "Deleting..." : "Delete Member"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Single Member Dialog */}
      <Dialog
        open={addSingleMemberDialog}
        onClose={() => {
          if (!saving) {
            setAddSingleMemberDialog(false);
            setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
          }
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" }, fontWeight: 600 }}>
          Add Member to {selectedGroup?.name}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={memberForm.firstName}
                onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                size={isMobile ? "small" : "medium"}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={memberForm.lastName}
                onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                size={isMobile ? "small" : "medium"}
              />
            </Stack>
            
            {/* Emails */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                Email Addresses
              </Typography>
              <Stack spacing={1.5}>
                {memberForm.emails.map((email, index) => (
                  <Stack
                    key={index}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "flex-start" }}
                  >
                    <TextField
                      fullWidth
                      label={`Email ${index + 1}`}
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    {memberForm.emails.length > 1 && (
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        color="error"
                        onClick={() => removeEmailField(index)}
                        sx={{
                          alignSelf: { xs: "flex-end", sm: "flex-start" },
                          mt: { xs: -1, sm: 0 },
                          mb: { xs: 0.5, sm: 0 },
                        }}
                      >
                        <X size={isMobile ? 20 : 16} />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  onClick={addEmailField}
                  startIcon={<Plus size={isMobile ? 18 : 14} />}
                  sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                >
                  Add Email
                </Button>
              </Stack>
            </Box>

            {/* Phones */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: "0.875rem", sm: "0.9375rem" } }}>
                Phone Numbers
              </Typography>
              <Stack spacing={1.5}>
                {memberForm.phones.map((phone, index) => (
                  <Stack
                    key={index}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "flex-start" }}
                  >
                    <TextField
                      fullWidth
                      label={`Phone ${index + 1}`}
                      value={phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ flex: 1, minWidth: 0 }}
                    />
                    {memberForm.phones.length > 1 && (
                      <IconButton
                        size={isMobile ? "medium" : "small"}
                        color="error"
                        onClick={() => removePhoneField(index)}
                        sx={{
                          alignSelf: { xs: "flex-end", sm: "flex-start" },
                          mt: { xs: -1, sm: 0 },
                          mb: { xs: 0.5, sm: 0 },
                        }}
                      >
                        <X size={isMobile ? 20 : 16} />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <Button
                  size={isMobile ? "medium" : "small"}
                  variant="outlined"
                  onClick={addPhoneField}
                  startIcon={<Plus size={isMobile ? 18 : 14} />}
                  sx={{ alignSelf: "flex-start", mt: { xs: 0.5, sm: 0 } }}
                >
                  Add Phone
                </Button>
              </Stack>
            </Box>

            <Alert severity="info" sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}>
              At least one email or phone number is required. Name is optional.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => {
            setAddSingleMemberDialog(false);
            setMemberForm({ firstName: "", lastName: "", name: "", emails: [""], phones: [""] });
          }} disabled={saving} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveMember}
            disabled={saving || (memberForm.emails.filter((e: string) => e.trim()).length === 0 && memberForm.phones.filter((p: string) => p.trim()).length === 0)}
            startIcon={saving ? <CircularProgress size={16} /> : <Plus size={16} />}
            fullWidth={isMobile}
          >
            {saving ? "Adding..." : "Add Member"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog
        open={bulkImportDialog}
        onClose={() => {
          if (!uploading) {
            setBulkImportDialog(false);
            setExcelFile(null);
            setColumnMapping({});
          }
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" }, fontWeight: 600 }}>
          Bulk Import Members to {selectedGroup?.name}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Upload an Excel file (.xlsx, .xls) or CSV file. The first row should contain column headers.
            </Alert>

            <Button variant="outlined" component="label" startIcon={<Upload size={16} />} fullWidth>
              {excelFile ? excelFile.name : "Choose Excel File"}
              <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
            </Button>

            {excelFile && excelHeaders.length > 0 && (
              <>
                <Divider />
                <Typography variant="subtitle2">Map Excel Columns to Fields</Typography>

                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Name Column</InputLabel>
                    <Select
                      value={columnMapping.name || "none"}
                      label="Name Column"
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, name: e.target.value === "none" ? undefined : e.target.value })
                      }
                    >
                      <MenuItem value="none">None</MenuItem>
                      {excelHeaders.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Email Column</InputLabel>
                    <Select
                      value={columnMapping.email || "none"}
                      label="Email Column"
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, email: e.target.value === "none" ? undefined : e.target.value })
                      }
                    >
                      <MenuItem value="none">None</MenuItem>
                      {excelHeaders.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Phone Column</InputLabel>
                    <Select
                      value={columnMapping.phone || "none"}
                      label="Phone Column"
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, phone: e.target.value === "none" ? undefined : e.target.value })
                      }
                    >
                      <MenuItem value="none">None</MenuItem>
                      {excelHeaders.map((header) => (
                        <MenuItem key={header} value={header}>
                          {header}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                {getPreviewData().length > 0 && (columnMapping.name || columnMapping.email || columnMapping.phone) && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Preview of Mapped Data (first 5 rows)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPreviewData().map((preview, idx) => {
                              const hasData = preview.firstName || preview.lastName || preview.email || preview.phone;
                              return (
                                <TableRow key={idx}>
                                  <TableCell>{[preview.firstName, preview.lastName].filter(Boolean).join(" ") || "—"}</TableCell>
                                  <TableCell>{preview.email || "—"}</TableCell>
                                  <TableCell>{preview.phone || "—"}</TableCell>
                                  <TableCell>
                                    {hasData ? (
                                      <Chip label="Valid" color="success" size="small" />
                                    ) : (
                                      <Chip label="Will be skipped" color="error" size="small" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, flexDirection: { xs: "column-reverse", sm: "row" }, gap: 1 }}>
          <Button onClick={() => {
            setBulkImportDialog(false);
            setExcelFile(null);
            setColumnMapping({});
          }} disabled={uploading} fullWidth={isMobile}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImportExcel}
            disabled={uploading || !excelFile || (!columnMapping.name && !columnMapping.email && !columnMapping.phone)}
            startIcon={uploading ? <CircularProgress size={16} /> : <Upload size={16} />}
            fullWidth={isMobile}
          >
            {uploading ? "Importing..." : "Import Members"}
          </Button>
        </DialogActions>
      </Dialog>

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
