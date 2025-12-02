import React, { useState } from "react";
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

type UserRole =
  | "admin"
  | "principal"
  | "teacher"
  | "business_office"
  | "parent";

type UserStatus = "active" | "inactive" | "pending";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Rabbi David Schwartz",
    email: "dschwartz@nachlasbaisyaakov.org",
    role: "admin",
    status: "active",
    lastLogin: "2024-12-01 09:30 AM",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Mrs. Rachel Cohen",
    email: "rcohen@nachlasbaisyaakov.org",
    role: "teacher",
    status: "active",
    lastLogin: "2024-12-01 08:15 AM",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Mrs. Sarah Goldstein",
    email: "sgoldstein@nachlasbaisyaakov.org",
    role: "principal",
    status: "active",
    lastLogin: "2024-11-30 04:45 PM",
    createdAt: "2024-01-10",
  },
  {
    id: "4",
    name: "Mr. Moshe Klein",
    email: "mklein@gmail.com",
    role: "parent",
    status: "active",
    lastLogin: "2024-11-29 07:20 PM",
    createdAt: "2024-03-05",
  },
  {
    id: "5",
    name: "Mrs. Leah Friedman",
    email: "lfriedman@nachlasbaisyaakov.org",
    role: "business_office",
    status: "active",
    lastLogin: "2024-11-28 10:00 AM",
    createdAt: "2024-01-20",
  },
  {
    id: "6",
    name: "Mrs. Devorah Weiss",
    email: "dweiss@nachlasbaisyaakov.org",
    role: "teacher",
    status: "inactive",
    lastLogin: "2024-10-15 03:30 PM",
    createdAt: "2023-09-01",
  },
];

const roleOptions: {
  value: UserRole;
  label: string;
  icon: React.ReactNode;
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
    
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [searchExpanded, setSearchExpanded] = useState(false);

  const [inviteForm, setInviteForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
  }>({
    name: "",
    email: "",
    role: "teacher",
  });

  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    role: UserRole | "";
    status: UserStatus | "";
  }>({
    name: "",
    email: "",
    role: "",
    status: "",
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInviteUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: "pending",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers((prev) => [...prev, newUser]);
    setInviteDialogOpen(false);
    setInviteForm({ name: "", email: "", role: "teacher" });
    showSnackbar("Invitation sent successfully!", "success");
  };

  const handleEditUser = () => {
    if (!selectedUser) return;

    setEditForm({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      status: selectedUser.status,
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (!selectedUser || !editForm.role || !editForm.status) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: editForm.name,
              email: editForm.email,
              role: editForm.role as UserRole,
              status: editForm.status as UserStatus,
            }
          : u
      )
    );
    setEditDialogOpen(false);
    showSnackbar("User updated successfully!", "success");
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (!selectedUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setDeleteDialogOpen(false);
    showSnackbar("User deleted successfully!", "success");
  };

  const handleToggleStatus = () => {
    if (!selectedUser) return;

    const newStatus: UserStatus =
      selectedUser.status === "active" ? "inactive" : "active";

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, status: newStatus } : u
      )
    );
    handleMenuClose();
    showSnackbar(
      `User ${
        newStatus === "active" ? "activated" : "deactivated"
      } successfully!`,
      "success"
    );
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    handleMenuClose();
    showSnackbar("Password reset email sent!", "success");
  };

  const handleResendInvite = () => {
    if (!selectedUser) return;
    handleMenuClose();
    showSnackbar("Invitation resent successfully!", "success");
  };

  const getRoleConfig = (role: UserRole) =>
    roleOptions.find((r) => r.value === role) ?? roleOptions[0];

  const filteredUsers = users.filter((user) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q);

    if (currentTab === 0) return matchesSearch;
    if (currentTab === 1) return matchesSearch && user.role === "admin";
    if (currentTab === 2) return matchesSearch && user.role === "principal";
    if (currentTab === 3) return matchesSearch && user.role === "teacher";
    if (currentTab === 4)
      return matchesSearch && user.role === "business_office";
    if (currentTab === 5) return matchesSearch && user.role === "parent";

    return matchesSearch;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const countByRole = (role: UserRole) =>
    users.filter((u) => u.role === role).length;

  return (
    <Box>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
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

            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteDialogOpen(true)}
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
              isMobile
                ? "Admin"
                : `Admins (${countByRole("admin")})`
            }
          />
          <Tab
            label={
              isMobile
                ? "Principal"
                : `Principals (${countByRole("principal")})`
            }
          />
          <Tab
            label={
              isMobile
                ? "Teacher"
                : `Teachers (${countByRole("teacher")})`
            }
          />
          <Tab
            label={
              isMobile
                ? "Business"
                : `Business (${countByRole("business_office")})`
            }
          />
          <Tab
            label={
              isMobile
                ? "Parent"
                : `Parents (${countByRole("parent")})`
            }
          />
        </Tabs>
      </Paper>

      {/* Users list: mobile cards or desktop table */}
      {isMobile ? (
        <Stack spacing={2}>
          {filteredUsers.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No users found</Typography>
            </Paper>
          ) : (
            filteredUsers.map((user) => {
              const roleConfig = getRoleConfig(user.role);

              return (
                <Card key={user.id} elevation={2}>
                  <CardContent sx={{ pb: 1 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: roleConfig.color,
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
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        <Chip
                          icon={roleConfig.icon}
                          label={roleConfig.label}
                          size="small"
                          sx={{
                            bgcolor: `${roleConfig.color}15`,
                            color: roleConfig.color,
                            fontWeight: 500,
                          }}
                        />
                        {user.status === "active" ? (
                          <Chip label="Active" color="success" size="small" />
                        ) : user.status === "inactive" ? (
                          <Chip label="Inactive" color="error" size="small" />
                        ) : (
                          <Chip label="Pending" color="warning" size="small" />
                        )}
                      </Stack>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Login
                        </Typography>
                        <Typography variant="body2">
                          {user.lastLogin}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
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
                  Role
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
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => {
                  const roleConfig = getRoleConfig(user.role);

                  return (
                    <TableRow
                      key={user.id}
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
                              bgcolor: roleConfig.color,
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
                        <Chip
                          icon={roleConfig.icon}
                          label={roleConfig.label}
                          size="small"
                          sx={{
                            bgcolor: `${roleConfig.color}15`,
                            color: roleConfig.color,
                            fontWeight: 500,
                            fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                            height: { xs: 24, sm: 28 },
                            "& .MuiChip-icon": {
                              fontSize: { xs: 14, sm: 18 },
                            },
                          }}
                        />
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
                            label="Pending"
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
                          {user.lastLogin}
                        </Typography>
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
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditUser}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>

        {selectedUser?.status === "pending" && (
          <MenuItem onClick={handleResendInvite}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Resend Invitation</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleResetPassword}>
          <ListItemIcon>
            <LockResetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset Password</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleToggleStatus}>
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

        <Divider />

        <MenuItem
          onClick={handleDeleteUser}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Invite User Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
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
          Invite New User
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
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
            />

            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteForm.role}
                label="Role"
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    role: e.target.value as UserRole,
                  }))
                }
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      {role.icon}
                      <Typography
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
                        {role.label}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Alert
              severity="info"
              sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
            >
              An invitation email will be sent to the user with instructions to
              set up their account.
            </Alert>
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
            onClick={() => setInviteDialogOpen(false)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInviteUser}
            variant="contained"
            disabled={!inviteForm.name || !inviteForm.email}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Send Invitation
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
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                label="Role"
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    role: e.target.value as UserRole,
                  }))
                }
              >
                {roleOptions.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      {role.icon}
                      <Typography
                        sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                      >
                        {role.label}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
        onClose={() => setDeleteDialogOpen(false)}
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
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
export default UserManagement;