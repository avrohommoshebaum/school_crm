// src/pages/admin/UserManagement.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Divider,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import SecurityIcon from "@mui/icons-material/Security";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import useCurrentUser from "../../hooks/useCurrentUser";
import { hasPermission } from "../../utils/permissions";


import api from "../../utils/api";

// -----------------------------
// TYPES
// -----------------------------

type CoreRoleName =
  | "admin"
  | "principal"
  | "teacher"
  | "business_office"
  | "parent";

type UserStatus = "active" | "inactive" | "invited";

interface RoleOption {
  _id: string;
  name: string;
  displayName: string;
  color: string;
  isSystem: boolean;
}

interface UserRoleEntry {
  id: string;
  _id: string;
  name: string;
  displayName: string;
  color: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  status: UserStatus;
  roles: UserRoleEntry[];
  lastLogin: string | null;
  createdAt: string;
  mfaEnabled?: boolean;
  mfaPhone?: string;
  mfaMethod?: "SMS" | "phone_call";
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

// -----------------------------
// STATIC ROLE META
// -----------------------------

const coreRoleMeta: {
  value: CoreRoleName;
  label: string;
  icon: React.ReactElement;
  color: string;
}[] = [
  {
    value: "admin",
    label: "Administrator",
    icon: <AdminPanelSettingsIcon fontSize="small" />,
    color: "#d32f2f",
  },
  {
    value: "principal",
    label: "Principal",
    icon: <SupervisorAccountIcon fontSize="small" />,
    color: "#1976d2",
  },
  {
    value: "teacher",
    label: "Teacher",
    icon: <SchoolIcon fontSize="small" />,
    color: "#388e3c",
  },
  {
    value: "business_office",
    label: "Business Office",
    icon: <BusinessIcon fontSize="small" />,
    color: "#f57c00",
  },
  {
    value: "parent",
    label: "Parent",
    icon: <FamilyRestroomIcon fontSize="small" />,
    color: "#7b1fa2",
  },
];

function getCoreRoleMetaByName(name: string) {
  const match = coreRoleMeta.find((r) => r.value === name);
  if (!match) return undefined;
  return {
    label: match.label,
    icon: match.icon,
    color: match.color,
  };
}

function getRoleDisplayFromEntry(role: UserRoleEntry) {
  const core = getCoreRoleMetaByName(role.name);
  if (core) return core;

  return {
    label: role.displayName || role.name,
    icon: <SupervisorAccountIcon fontSize="small" />,
    color: role.color || "#546e7a",
  };
}

// -----------------------------
// MAIN COMPONENT
// -----------------------------

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user: currentUser, loading: userLoading } = useCurrentUser(); 


const canCreateUsers = hasPermission(currentUser, "users", "create");
const canEditUsers = hasPermission(currentUser, "users", "edit");
const canDeleteUsers = hasPermission(currentUser, "users", "delete");


const NO_PERMISSION_TOOLTIP =
  "You do not have permission to perform this action.";


  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState(0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);


  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetMethod, setResetMethod] = useState<"password" | "email">("password");
  const [tempPassword, setTempPassword] = useState("");
  const [requireChange, setRequireChange] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);

  // 2FA Admin Management
  const [update2FAPhoneDialog, setUpdate2FAPhoneDialog] = useState(false);
  const [backupCodesDialog, setBackupCodesDialog] = useState(false);
  const [twoFAPhone, setTwoFAPhone] = useState("");
  const [twoFAMethod, setTwoFAMethod] = useState<"SMS" | "phone_call">("SMS");
  const [updating2FA, setUpdating2FA] = useState(false);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodesStatus, setBackupCodesStatus] = useState<{ total: number; unused: number; used: number } | null>(null);


  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [searchExpanded, setSearchExpanded] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    roleIds: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    status: "" as UserStatus | "",
    roleIds: [] as string[],
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // -----------------------------
  // SNACKBAR
  // -----------------------------

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // -----------------------------
  // LOADERS
  // -----------------------------

  // Helper function to safely format dates
  const formatDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    
    try {
      // Handle Firestore Timestamp objects (has toDate method)
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleString();
      }
      
      // Handle Firestore Timestamp objects (has seconds/nanoseconds)
      if (dateValue.seconds !== undefined) {
        return new Date(dateValue.seconds * 1000).toLocaleString();
      }
      
      // Handle regular Date objects or ISO strings
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toLocaleString();
    } catch (err) {
      console.error("Date formatting error:", err, dateValue);
      return null;
    }
  };

  const formatDateShort = (dateValue: any): string | null => {
    if (!dateValue) return null;
    
    try {
      // Handle Firestore Timestamp objects (has toDate method)
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString();
      }
      
      // Handle Firestore Timestamp objects (has seconds/nanoseconds)
      if (dateValue.seconds !== undefined) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString();
      }
      
      // Handle regular Date objects or ISO strings
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toLocaleDateString();
    } catch (err) {
      console.error("Date formatting error:", err, dateValue);
      return null;
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get<{ users: any[] }>("/users");

      const formatted: User[] = data.users.map((u) => ({
        _id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        roles: (u.roles || []).map((r: { _id: any; id: any; name: any; displayName: any; color: any; }) => ({
          _id: r._id || r.id,  
          name: r.name,
          displayName: r.displayName,
          color: r.color,
        })),
        lastLogin: formatDate(u.lastLogin),
        createdAt: formatDateShort(u.createdAt) || "—",
      }));

      setUsers(formatted);
    } catch (err: any) {
      console.error(err);
      showSnackbar(err?.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const { data } = await api.get<{ roles: any[] }>("/roles");

      setRoles(
        data.roles.map((r) => ({
          _id: r._id,
          name: r.name,
          displayName: r.displayName,
          color: r.color || "#546e7a",
          isSystem: !!r.isSystem,
        }))
      );
    } catch (err: any) {
      console.error(err);
      showSnackbar(err?.response?.data?.message || "Failed to load roles", "error");
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([loadUsers(), loadRoles()]);
    })();
  }, []);

  // -----------------------------
  // MENU HANDLING
  // -----------------------------

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(e.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => setAnchorEl(null);

 

    // -----------------------------
  // INVITE USER
  // -----------------------------

  const handleInviteUser = async () => {
    if (!inviteForm.email.trim()) {
      showSnackbar("Email is required", "error");
      return;
    }
    if (inviteForm.roleIds.length === 0) {
      showSnackbar("Select at least one role", "error");
      return;
    }

    setInviting(true);
    try {
      await api.post("/invite", {
        email: inviteForm.email,
        roleIds: inviteForm.roleIds,
      });

      showSnackbar("Invitation sent!", "success");
      setInviteDialogOpen(false);
      setInviteForm({ name: "", email: "", roleIds: [] });
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err?.response?.data?.message || "Error sending invite",
        "error"
      );
    } finally {
      setInviting(false);
    }
  };

  // -----------------------------
  // EDIT USER
  // -----------------------------

  const handleEditUser = () => {
    if (!selectedUser) return;

    setEditForm({
  name: selectedUser.name,
  email: selectedUser.email,
  status: selectedUser.status,
  roleIds: selectedUser.roles.map((r) => r._id || r.id),
});

    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.status) {
      showSnackbar("Please fill in all required fields", "error");
      return;
    }

    if (editForm.roleIds.length === 0) {
      showSnackbar("Select at least one role", "error");
      return;
    }

    try {
      await api.put(`/users/${selectedUser._id}`, {
        name: editForm.name,
        email: editForm.email,
        status: editForm.status,
        roleIds: editForm.roleIds,
      });

      showSnackbar("User updated!", "success");
      setEditDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err?.response?.data?.message || "Error updating user",
        "error"
      );
    }
  };

  // -----------------------------
  // DELETE USER
  // -----------------------------

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setDeleting(true);
    try {
      await api.delete(`/users/${selectedUser._id}`);
      showSnackbar("User deleted!", "success");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err?.response?.data?.message || "Unable to delete user",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // -----------------------------
  // TOGGLE STATUS
  // -----------------------------

  const handleToggleStatus = async () => {
    if (!selectedUser) return;

    const newStatus: UserStatus =
      selectedUser.status === "active" ? "inactive" : "active";

    try {
      await api.put(`/users/${selectedUser._id}`, {
        name: selectedUser.name,
        email: selectedUser.email,
        status: newStatus,
        roleIds: selectedUser.roles.map((r) => r._id),
      });

      showSnackbar(
        `User ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`,
        "success"
      );
      handleMenuClose();
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err?.response?.data?.message || "Failed to update user status",
        "error"
      );
    }
  };

  // -----------------------------
  // RESET / RESEND PLACEHOLDERS
  // -----------------------------

const handleResetPassword = () => {
  setResetDialogOpen(true);
  handleMenuClose();
};


  const handleResendInvite = async () => {
    if (!selectedUser) return;
    handleMenuClose();

    setResendingInvite(true);
    try {
      await api.post(`/invite/resend/${selectedUser._id}`);
      showSnackbar("Invitation resent successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showSnackbar(
        err?.response?.data?.message || "Error resending invitation",
        "error"
      );
    } finally {
      setResendingInvite(false);
    }
  };

  // -----------------------------
  // 2FA ADMIN HANDLERS
  // -----------------------------

  const handleUpdate2FAPhone = () => {
    if (!selectedUser) return;
    setTwoFAPhone(selectedUser.mfaPhone || "");
    setTwoFAMethod(selectedUser.mfaMethod || "SMS");
    setUpdate2FAPhoneDialog(true);
    handleMenuClose();
  };

  const handleSave2FAPhone = async () => {
    if (!selectedUser || !twoFAPhone.trim()) {
      showSnackbar("Please enter a phone number", "error");
      return;
    }

    const digits = twoFAPhone.replace(/\D/g, "");
    if (digits.length !== 10) {
      showSnackbar("Please enter a valid 10-digit phone number", "error");
      return;
    }

    setUpdating2FA(true);
    try {
      const e164Phone = digits.length === 10 ? `+1${digits}` : twoFAPhone;
      await api.put(`/users/${selectedUser._id}/2fa-phone`, {
        phoneNumber: e164Phone,
        method: twoFAMethod,
      });

      showSnackbar("2FA phone number updated successfully", "success");
      setUpdate2FAPhoneDialog(false);
      await loadUsers();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || "Failed to update 2FA phone", "error");
    } finally {
      setUpdating2FA(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!selectedUser) return;
    setGeneratingCodes(true);
    try {
      const res = await api.post(`/users/${selectedUser._id}/backup-codes/generate`);
      setBackupCodes(res.data.codes);
      setBackupCodesDialog(true);
      await loadBackupCodesStatus();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || "Failed to generate backup codes", "error");
    } finally {
      setGeneratingCodes(false);
    }
  };

  const handleViewBackupCodes = async () => {
    if (!selectedUser) return;
    try {
      const res = await api.get(`/users/${selectedUser._id}/backup-codes`);
      setBackupCodesStatus(res.data);
      setBackupCodesDialog(true);
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || "Failed to load backup codes status", "error");
    }
  };

  const loadBackupCodesStatus = async () => {
    if (!selectedUser) return;
    try {
      const res = await api.get(`/users/${selectedUser._id}/backup-codes`);
      setBackupCodesStatus(res.data);
    } catch (error) {
      // Ignore errors
    }
  };

  // -----------------------------
  // HELPERS
  // -----------------------------

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
  (user.name ?? "").toLowerCase().includes(q) ||
  (user.email ?? "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (currentTab === 0) return true; // All

    const coreRole = coreRoleMeta[currentTab - 1]?.value;
    if (!coreRole) return true;

    return user.roles.some((r) => r.name === coreRole);
  });

  const getInitials = (name?: string, email?: string) => {
  if (name && name.trim()) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  // Fallback for invited users (no name yet)
  return email?.[0]?.toUpperCase() ?? "?";
};


  const countByCoreRole = (roleName: CoreRoleName) =>
    users.filter((u) => u.roles.some((r) => r.name === roleName)).length;

  // -----------------------------
  // RENDER
  // -----------------------------

    return (
  <Box>
    {userLoading ? (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    ) : (
      <>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={handleSnackbarClose}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 1 },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: { xs: "flex-start", sm: "space-between" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1976d2",
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
            }}
          >
            User Management
          </Typography>

            {!canCreateUsers && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You have view-only access. Editing is disabled.
              </Alert>
            )}

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "space-between", sm: "flex-end" },
            }}
          >
            {searchExpanded ? (
              <TextField
                autoFocus
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth={isMobile}
                sx={{
                  flex: { xs: 1, sm: "unset" },
                  width: { xs: "auto", sm: 250 },
                  "& .MuiInputBase-root": {
                    height: 40,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearchExpanded(false);
                          setSearchQuery("");
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <IconButton
                onClick={() => setSearchExpanded(true)}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                <SearchIcon />
              </IconButton>
            )}

          
            
<Tooltip
  title={!canCreateUsers ? NO_PERMISSION_TOOLTIP : ""}
  disableHoverListener={canCreateUsers}
>
  <span>
    <Button
      variant="contained"
      startIcon={<PersonAddIcon />}
      onClick={() => setInviteDialogOpen(true)}
      disabled={!canCreateUsers}
      sx={{
        height: 40,
        px: 2,
        fontSize: "0.875rem",
        textTransform: "none",
        whiteSpace: "nowrap",
      }}
    >
      {isMobile ? "Invite" : "Invite User"}
    </Button>
  </span>
</Tooltip>

          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: 0,
            borderTop: "1px solid #e0e0e0",
            minHeight: { xs: 40, sm: 48 },
            "& .MuiTab-root": {
              minHeight: { xs: 40, sm: 48 },
              py: { xs: 0.5, sm: 1 },
              textTransform: "none",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              minWidth: { xs: 60, sm: 100 },
              px: { xs: 1, sm: 2.5 },
            },
            "& .MuiTabs-scrollButtons": {
              width: { xs: 28, sm: 40 },
              "&.Mui-disabled": {
                opacity: 0.3,
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
            },
          }}
        >
          <Tab label={isMobile ? "All" : `All (${users.length})`} />
          <Tab
            label={
              isMobile ? "Admin" : `Admins (${countByCoreRole("admin")})`
            }
          />
          <Tab
            label={
              isMobile
                ? "Principal"
                : `Principals (${countByCoreRole("principal")})`
            }
          />
          <Tab
            label={
              isMobile
                ? "Teacher"
                : `Teachers (${countByCoreRole("teacher")})`
            }
          />
          <Tab
            label={
              isMobile
                ? "Business"
                : `Business (${countByCoreRole("business_office")})`
            }
          />
          <Tab
            label={
              isMobile ? "Parent" : `Parents (${countByCoreRole("parent")})`
            }
          />
        </Tabs>
      </Paper>

      {/* Users list: mobile cards or desktop table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Stack spacing={2}>
          {filteredUsers.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No users found</Typography>
            </Paper>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user._id} elevation={2}>
                <CardContent sx={{ pb: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor:
                            user.roles[0]?.color || coreRoleMeta[0].color,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{ fontWeight: 600, fontSize: "1rem" }}
                        >
                          {user.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: "0.8125rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                     <Tooltip
  title={
    !canEditUsers && !canDeleteUsers
      ? NO_PERMISSION_TOOLTIP
      : ""
  }
  disableHoverListener={canEditUsers || canDeleteUsers}
>
  <span>
    <IconButton
      size="small"
      onClick={(e) => handleMenuOpen(e, user)}
      disabled={!canEditUsers && !canDeleteUsers}
    >
      <MoreVertIcon fontSize="small" />
    </IconButton>
  </span>
</Tooltip>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {user.roles.map((role) => {
                        const meta = getRoleDisplayFromEntry(role);
                        return (
                          <Chip
                            key={role._id}
                            icon={meta.icon}
                            label={meta.label}
                            size="small"
                            sx={{
                              bgcolor: `${meta.color}15`,
                              color: meta.color,
                              fontWeight: 500,
                            }}
                          />
                        );
                      })}
                      {user.status === "active" ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : user.status === "inactive" ? (
                        <Chip label="Inactive" color="error" size="small" />
                      ) : (
                        <Chip label="Invited" color="warning" size="small" />
                      )}
                    </Stack>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body2">
                        {user.lastLogin || "—"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        2FA Status
                      </Typography>
                      {user.mfaEnabled ? (
                        <Chip
                          label="Enabled"
                          color="success"
                          size="small"
                          icon={<SecurityIcon sx={{ fontSize: "14px !important" }} />}
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Chip
                          label="Disabled"
                          color="default"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      ) : (
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ overflowX: "auto" }}
        >
          <Table sx={{ minWidth: { xs: 650, md: "auto" } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#1976d2" }}>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                  }}
                >
                  User
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                    display: { xs: "none", md: "table-cell" },
                  }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                  }}
                >
                  Roles
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                  }}
                  align="center"
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  Last Login
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                    display: { xs: "none", lg: "table-cell" },
                  }}
                  align="center"
                >
                  2FA
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                    display: { xs: "none", lg: "table-cell" },
                  }}
                >
                  Created
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderBottom: "none",
                  }}
                  align="center"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow
                    key={user._id}
                    hover
                    sx={{
                      bgcolor: index % 2 === 0 ? "white" : "#fafafa",
                    }}
                  >
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={{ xs: 1, sm: 2 }}
                        alignItems="center"
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              user.roles[0]?.color || coreRoleMeta[0].color,
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            }}
                          >
                            {user.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              display: { xs: "block", md: "none" },
                              fontSize: "0.75rem",
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.secondary",
                        display: { xs: "none", md: "table-cell" },
                      }}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap" gap={1}
                      >
                        {user.roles.map((role) => {
                          const meta = getRoleDisplayFromEntry(role);
                          return (
                            <Chip
                              key={role._id}
                              icon={meta.icon}
                              label={meta.label}
                              size="small"
                              sx={{
                                bgcolor: `${meta.color}15`,
                                color: meta.color,
                                fontWeight: 500,
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.8125rem",
                                },
                                height: { xs: 24, sm: 28 },
                                "& .MuiChip-icon": {
                                  fontSize: { xs: 14, sm: 18 },
                                },
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {user.status === "active" ? (
                        <Chip
                          label="Active"
                          color="success"
                          size="small"
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                          }}
                        />
                      ) : user.status === "inactive" ? (
                        <Chip
                          label="Inactive"
                          color="error"
                          size="small"
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                          }}
                        />
                      ) : (
                        <Chip
                          label="Invite sent"
                          color="warning"
                          size="small"
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {user.lastLogin || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", lg: "table-cell" } }}
                      align="center"
                    >
                      {user.mfaEnabled ? (
                        <Chip
                          label="Enabled"
                          color="success"
                          size="small"
                          icon={<SecurityIcon sx={{ fontSize: "14px !important" }} />}
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                          }}
                        />
                      ) : (
                        <Chip
                          label="Disabled"
                          color="default"
                          size="small"
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", lg: "table-cell" } }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {user.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                    <Tooltip
  title={
    !canEditUsers && !canDeleteUsers
      ? NO_PERMISSION_TOOLTIP
      : ""
  }
  disableHoverListener={canEditUsers || canDeleteUsers}
>
  <span>
    <IconButton
      size="small"
      onClick={(e) => handleMenuOpen(e, user)}
      disabled={!canEditUsers && !canDeleteUsers}
    >
      <MoreVertIcon />
    </IconButton>
  </span>
</Tooltip>

                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
       <Tooltip
  title={!canEditUsers ? NO_PERMISSION_TOOLTIP : ""}
  placement="left"
  disableHoverListener={canEditUsers}
>
  <span>
    <MenuItem onClick={handleEditUser} disabled={!canEditUsers}>
      <ListItemIcon>
        <EditIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Edit User</ListItemText>
    </MenuItem>
  </span>
</Tooltip>


        {selectedUser?.status === "invited" && (
          <MenuItem 
            onClick={handleResendInvite}
            disabled={resendingInvite}
          >
            <ListItemIcon>
              {resendingInvite ? (
                <CircularProgress size={16} />
              ) : (
                <EmailIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {resendingInvite ? "Resending..." : "Resend Invitation"}
            </ListItemText>
          </MenuItem>
        )}
<Tooltip
  title={!canEditUsers ? NO_PERMISSION_TOOLTIP : ""}
  placement="left"
  disableHoverListener={canEditUsers}
>
  <span>
    <MenuItem onClick={handleResetPassword} disabled={!canEditUsers}>
      <ListItemIcon>
        <LockResetIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Reset Password</ListItemText>
    </MenuItem>
  </span>
</Tooltip>


       <Tooltip
  title={!canEditUsers ? NO_PERMISSION_TOOLTIP : ""}
  placement="left"
  disableHoverListener={canEditUsers}
>
  <span>
    <MenuItem onClick={handleToggleStatus} disabled={!canEditUsers}>
      <ListItemIcon>
        {selectedUser?.status === "active" ? (
          <BlockIcon fontSize="small" color="error" />
        ) : (
          <CheckCircleIcon fontSize="small" color="success" />
        )}
      </ListItemIcon>
      <ListItemText>
        {selectedUser?.status === "active" ? "Deactivate" : "Activate"}
      </ListItemText>
    </MenuItem>
  </span>
</Tooltip>

        <Divider />
        <Typography 
          variant="caption" 
          sx={{ 
            px: 2, 
            py: 1, 
            color: "text.secondary", 
            fontWeight: 600,
            display: "block"
          }}
        >
          Two-Factor Authentication
        </Typography>
        {selectedUser?.mfaEnabled ? (
          <>
            <Tooltip
              title={!canEditUsers ? NO_PERMISSION_TOOLTIP : ""}
              placement="left"
              disableHoverListener={canEditUsers}
            >
              <span>
                <MenuItem onClick={handleUpdate2FAPhone} disabled={!canEditUsers}>
                  <ListItemIcon>
                    <PhoneIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Update 2FA Phone</ListItemText>
                </MenuItem>
              </span>
            </Tooltip>
            <Tooltip
              title={!canEditUsers ? NO_PERMISSION_TOOLTIP : ""}
              placement="left"
              disableHoverListener={canEditUsers}
            >
              <span>
                <MenuItem onClick={handleGenerateBackupCodes} disabled={!canEditUsers || generatingCodes}>
                  <ListItemIcon>
                    {generatingCodes ? (
                      <CircularProgress size={16} />
                    ) : (
                      <VpnKeyIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText>
                    {generatingCodes ? "Generating..." : "Generate Backup Codes"}
                  </ListItemText>
                </MenuItem>
              </span>
            </Tooltip>
            <Tooltip
              title={!canEditUsers ? NO_PERMISSION_TOOLTIP : ""}
              placement="left"
              disableHoverListener={canEditUsers}
            >
              <span>
                <MenuItem onClick={handleViewBackupCodes} disabled={!canEditUsers}>
                  <ListItemIcon>
                    <SecurityIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Backup Codes Status</ListItemText>
                </MenuItem>
              </span>
            </Tooltip>
          </>
        ) : (
          <MenuItem disabled>
            <ListItemText
              primary="2FA Not Enabled"
              secondary="User must enable 2FA in their settings"
              primaryTypographyProps={{ variant: "body2", sx: { fontSize: "0.875rem" } }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </MenuItem>
        )}

        <Divider />

      <Tooltip
  title={
    !canDeleteUsers
      ? "You do not have permission to delete users."
      : ""
  }
  placement="left"
  disableHoverListener={canDeleteUsers}
>
  <span>
    <MenuItem
      onClick={handleDeleteUser}
      disabled={!canDeleteUsers}
      sx={{ color: canDeleteUsers ? "error.main" : "text.disabled" }}
    >
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Delete User</ListItemText>
    </MenuItem>
  </span>
</Tooltip>
      </Menu>

      {/* Invite User Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => {
          if (!inviting) {
            setInviteDialogOpen(false);
          }
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
            width: { xs: "100%", sm: "auto" },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonAddIcon color="primary" />
            <Typography variant="h6">Invite New User</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Full Name (optional)"
              value={inviteForm.name}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Enter user's full name"
              size="small"
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="user@example.com"
              size="small"
              required
              error={inviteForm.email.length > 0 && !inviteForm.email.includes("@")}
              helperText={
                inviteForm.email.length > 0 && !inviteForm.email.includes("@")
                  ? "Please enter a valid email address"
                  : ""
              }
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Select Roles *
              </Typography>
              <FormControl
                fullWidth
                size="small"
                error={inviteForm.roleIds.length === 0 && inviteForm.email.length > 0}
              >
                <InputLabel id="roles-select-label">Roles</InputLabel>
                <Select
                  labelId="roles-select-label"
                  multiple
                  value={inviteForm.roleIds}
                  label="Roles"
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      roleIds:
                        typeof e.target.value === "string"
                          ? e.target.value.split(",")
                          : (e.target.value as string[]),
                    }))
                  }
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <Typography color="text.secondary">Select roles...</Typography>
                      );
                    }
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((roleId) => {
                          const role = roles.find((r) => r._id === roleId);
                          if (!role) return null;
                          return (
                            <Chip
                              key={roleId}
                              label={role.displayName}
                              size="small"
                              sx={{
                                backgroundColor: role.color || "#546e7a",
                                color: "white",
                                fontSize: "0.75rem",
                                height: 24,
                              }}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {roles.length === 0 ? (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        No roles available
                      </Typography>
                    </MenuItem>
                  ) : (
                    roles.map((role) => (
                      <MenuItem key={role._id} value={role._id}>
                        <Checkbox
                          checked={inviteForm.roleIds.includes(role._id)}
                          sx={{ mr: 1.5 }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: role.color || "#546e7a",
                            }}
                          />
                          <Typography variant="body2">{role.displayName}</Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
                {inviteForm.roleIds.length === 0 && inviteForm.email.length > 0 && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    At least one role must be selected
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Alert severity="info" icon={<EmailIcon />}>
              An invitation email will be sent to the user with instructions to
              set up their account.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: 1,
          }}
        >
          <Button
            onClick={() => setInviteDialogOpen(false)}
            variant="outlined"
            disabled={inviting}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInviteUser}
            variant="contained"
            disabled={
              inviting ||
              !inviteForm.email ||
              inviteForm.roleIds.length === 0
            }
            startIcon={
              inviting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAddIcon />
              )
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {inviting ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 3 },
            maxHeight: { xs: "calc(100% - 32px)", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              size="small"
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                label="Status"
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: e.target.value as UserStatus,
                  }))
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={editForm.roleIds}
                label="Roles"
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    roleIds:
                      typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : (e.target.value as string[]),
                  }))
                }
                renderValue={(selected) => {
                  const labels = roles
                    .filter((r) => selected.includes(r._id))
                    .map((r) => r.displayName);
                  return labels.join(", ");
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox
                        checked={editForm.roleIds.includes(role._id)}
                        sx={{ padding: 0, mr: 1 }}
                      />
                      <Typography
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
                        {role.displayName}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
          }}
        >
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
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
          Delete User
        </DialogTitle>
        <DialogContent>
          <Alert
            severity="error"
            sx={{ mb: 2, fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            This action cannot be undone!
          </Alert>
          <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Are you sure you want to delete{" "}
            <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            All data associated with this user will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {deleting ? "Deleting..." : "Delete User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => {
          setResetDialogOpen(false);
          setResetMethod("password");
          setTempPassword("");
          setRequireChange(true);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 3 },
            maxHeight: { xs: "100%", sm: "calc(100% - 64px)" },
            width: { xs: "100%", sm: "auto" },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockResetIcon color="primary" />
            <Typography variant="h6">Reset Password</Typography>
          </Box>
          {selectedUser && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedUser.name} ({selectedUser.email})
            </Typography>
          )}
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Stack spacing={3} sx={{ mt: 1, width: "100%", maxWidth: "100%" }}>
            {/* Method Selection */}
            <Box sx={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                Choose Reset Method
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{
                  width: "100%",
                  "& > *": {
                    flex: 1,
                    minWidth: 0, // Prevents overflow
                  },
                }}
              >
                <Card
                  onClick={() => setResetMethod("password")}
                  sx={{
                    cursor: "pointer",
                    border: 2,
                    borderColor:
                      resetMethod === "password" ? "primary.main" : "divider",
                    backgroundColor:
                      resetMethod === "password"
                        ? "action.selected"
                        : "background.paper",
                    transition: "all 0.2s",
                    width: "100%",
                    maxWidth: "100%",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <LockResetIcon
                        color={resetMethod === "password" ? "primary" : "action"}
                        sx={{ fontSize: 32 }}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Set Temporary Password
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create a temporary password that the user must change on
                        next login
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  onClick={() => setResetMethod("email")}
                  sx={{
                    cursor: "pointer",
                    border: 2,
                    borderColor:
                      resetMethod === "email" ? "primary.main" : "divider",
                    backgroundColor:
                      resetMethod === "email"
                        ? "action.selected"
                        : "background.paper",
                    transition: "all 0.2s",
                    width: "100%",
                    maxWidth: "100%",
                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <EmailIcon
                        color={resetMethod === "email" ? "primary" : "action"}
                        sx={{ fontSize: 32 }}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Send Reset Link
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email a secure password reset link to the user's email
                        address
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>

            <Divider />

            {/* Temporary Password Form */}
            {resetMethod === "password" && (
              <Stack spacing={2}>
                {requireChange && (
                  <Alert severity="info" icon={<LockResetIcon />}>
                    The user will be required to change this password on their next
                    login.
                  </Alert>
                )}

                <TextField
                  label="Temporary Password"
                  type="password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  fullWidth
                  required
                  helperText="Minimum 8 characters"
                  error={tempPassword.length > 0 && tempPassword.length < 8}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={requireChange}
                      onChange={(e) => setRequireChange(e.target.checked)}
                    />
                  }
                  label="Require password change on next login"
                />
              </Stack>
            )}

            {/* Email Reset Form */}
            {resetMethod === "email" && (
              <Stack spacing={2}>
                <Alert severity="info" icon={<EmailIcon />}>
                  A password reset link will be sent to{" "}
                  <strong>{selectedUser?.email}</strong>. The link will expire
                  in 1 hour.
                </Alert>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>What happens next:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    • User receives an email with a reset link
                    <br />• User clicks the link to set a new password
                    <br />• Link expires after 1 hour
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              setResetDialogOpen(false);
              setResetMethod("password");
              setTempPassword("");
              setRequireChange(true);
            }}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>

          {resetMethod === "password" ? (
            <Button
              onClick={async () => {
                if (!tempPassword || tempPassword.length < 8) {
                  showSnackbar(
                    "Password must be at least 8 characters",
                    "error"
                  );
                  return;
                }

                setResetting(true);
                try {
                  await api.post(`/users/${selectedUser!._id}/reset-password`, {
                    tempPassword,
                    requireChange,
                  });
                  showSnackbar("Temporary password set successfully", "success");
                  setResetDialogOpen(false);
                  setTempPassword("");
                  setRequireChange(true);
                } catch (err: any) {
                  showSnackbar(
                    err?.response?.data?.message ||
                      "Failed to set temporary password",
                    "error"
                  );
                } finally {
                  setResetting(false);
                }
              }}
              variant="contained"
              disabled={!tempPassword || tempPassword.length < 8 || resetting}
              startIcon={resetting ? <CircularProgress size={16} /> : <LockResetIcon />}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {resetting ? "Setting Password..." : "Set Temporary Password"}
            </Button>
          ) : (
            <Button
              onClick={async () => {
                setResetting(true);
                try {
                  await api.post(
                    `/users/${selectedUser!._id}/send-reset-email`
                  );
                  showSnackbar(
                    "Password reset email sent successfully",
                    "success"
                  );
                  setResetDialogOpen(false);
                } catch (err: any) {
                  showSnackbar(
                    err?.response?.data?.message ||
                      "Failed to send reset email",
                    "error"
                  );
                } finally {
                  setResetting(false);
                }
              }}
              variant="contained"
              disabled={resetting}
              startIcon={resetting ? <CircularProgress size={16} /> : <EmailIcon />}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {resetting ? "Sending..." : "Send Reset Email"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Update 2FA Phone Dialog */}
      <Dialog
        open={update2FAPhoneDialog}
        onClose={() => {
          setUpdate2FAPhoneDialog(false);
          setTwoFAPhone("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update 2FA Phone Number</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Phone Number"
              placeholder="(732) 555-1234"
              value={twoFAPhone}
              onChange={(e) => {
                const formatted = e.target.value.replace(/\D/g, "");
                if (formatted.length <= 10) {
                  const formattedPhone = formatted.length <= 3
                    ? formatted
                    : formatted.length <= 6
                    ? `(${formatted.slice(0, 3)}) ${formatted.slice(3)}`
                    : `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6, 10)}`;
                  setTwoFAPhone(formattedPhone);
                }
              }}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              helperText="Enter 10-digit phone number"
            />
            <FormControl fullWidth>
              <InputLabel>Verification Method</InputLabel>
              <Select
                value={twoFAMethod}
                onChange={(e) => setTwoFAMethod(e.target.value as "SMS" | "phone_call")}
                label="Verification Method"
              >
                <MenuItem value="SMS">SMS (Text Message)</MenuItem>
                <MenuItem value="phone_call">Phone Call</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUpdate2FAPhoneDialog(false);
              setTwoFAPhone("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave2FAPhone}
            variant="contained"
            disabled={updating2FA || !twoFAPhone.trim()}
            startIcon={updating2FA ? <CircularProgress size={16} /> : <PhoneIcon />}
          >
            {updating2FA ? "Updating..." : "Update Phone"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={backupCodesDialog}
        onClose={() => {
          setBackupCodesDialog(false);
          setBackupCodes(null);
          setBackupCodesStatus(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Backup Codes</DialogTitle>
        <DialogContent>
          {backupCodes ? (
            <Stack spacing={2}>
              <Alert severity="warning">
                <Typography variant="body2" fontWeight={600}>
                  Save these codes now! They will not be shown again.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  These codes can be used to sign in if you don't have access to your phone.
                </Typography>
              </Alert>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                }}
              >
                {backupCodes.map((code, index) => (
                  <Typography key={index} sx={{ mb: 0.5 }}>
                    {code}
                  </Typography>
                ))}
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  const text = backupCodes.join("\n");
                  navigator.clipboard.writeText(text);
                  showSnackbar("Codes copied to clipboard", "success");
                }}
              >
                Copy All Codes
              </Button>
            </Stack>
          ) : backupCodesStatus ? (
            <Stack spacing={2}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Total Codes:</strong> {backupCodesStatus.total}
                  <br />
                  <strong>Unused:</strong> {backupCodesStatus.unused}
                  <br />
                  <strong>Used:</strong> {backupCodesStatus.used}
                </Typography>
              </Alert>
              {backupCodesStatus.unused < 3 && (
                <Alert severity="warning">
                  User has fewer than 3 unused backup codes. Consider generating new codes.
                </Alert>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBackupCodesDialog(false);
              setBackupCodes(null);
              setBackupCodesStatus(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </>
    )}
  </Box>
    )}
    

export default UserManagement;
