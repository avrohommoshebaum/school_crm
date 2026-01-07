import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Divider,
  Tooltip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import GradeIcon from "@mui/icons-material/Grade";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";


import api from "../../utils/api";
import { PERMISSIONS } from "../../config/permissions";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";


// ---------- Types ----------

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

type RolePermissions = Record<
  string,
  {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }
>;




interface Role {
  _id: string;
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: RolePermissions;
  color: string;
}

interface RoleFormState {
  name: string;
  displayName: string;
  description: string;
  permissions: RolePermissions;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ApiRole {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  userCount?: number;
  color?: string;
  permissions: RolePermissions;
}

interface RolesResponse {
  roles: ApiRole[];
}

// ---------- Helpers ----------



const emptyPermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

const createEmptyPermissions = (): RolePermissions =>
  Object.fromEntries(
    PERMISSIONS.map(p => [p.key, { ...emptyPermission }])
  );

const clonePermissions = (permissions: RolePermissions): RolePermissions =>
  Object.fromEntries(
    PERMISSIONS.map(p => [
      p.key,
      { ...(permissions?.[p.key] ?? emptyPermission) },
    ])
  );


const createEmptyRoleForm = (): RoleFormState => ({
  name: "",
  displayName: "",
  description: "",
  permissions: createEmptyPermissions(),

});

// ---------- Component ----------

export default function RoleManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });



    const { user } = useAuth();

    const canViewRoles = hasPermission(user, "roles", "view");
const canCreateRoles = hasPermission(user, "roles", "create");
const canEditRoles = hasPermission(user, "roles", "edit");
const canDeleteRoles = hasPermission(user, "roles", "delete");



  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<RoleFormState>(() =>
    createEmptyRoleForm()
  );

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ---------- Snackbar ----------

  const handleSnackbarClose = useCallback(
    (_event?: unknown, reason?: string) => {
      if (reason === "clickaway") return;
      setSnackbar((prev) => ({ ...prev, open: false }));
    },
    []
  );

  const openSnackbar = useCallback(
    (message: string, severity: AlertColor = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  // ---------- Load Roles from API ----------

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<RolesResponse>("/roles");

      setRoles(
        data.roles.map(
          (r): Role => ({
            id: r._id,
            name: r.name,
            displayName: r.displayName,
            description: r.description,
            isSystem: r.isSystem,
            userCount: r.userCount ?? 0,
            color: r.color ?? "#0097a7",
            permissions: clonePermissions(r.permissions),
            _id: ""
          })
        )
      );
    } catch (err) {
      console.error("Error loading roles:", err);
      openSnackbar("Failed to load roles", "error");
    } finally {
      setLoading(false);
    }
  }, [openSnackbar]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // ---------- Handlers ----------

  const handleCreateRole = useCallback(() => {
    setEditingRole(null);
    setNewRole(createEmptyRoleForm());
    setDialogOpen(true);
  }, []);

  const handleEditRole = useCallback(
    (role: Role) => {
      if (role.isSystem) {
        openSnackbar("System roles cannot be edited", "error");
        return;
      }
      setEditingRole(role);
      setNewRole({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: clonePermissions(role.permissions),
      });
      setDialogOpen(true);
    },
    [openSnackbar]
  );

  const handleDuplicateRole = useCallback((role: Role) => {
    setEditingRole(null);
    setNewRole({
      name: "",
      displayName: `${role.displayName} (Copy)`,
      description: role.description,
      permissions: clonePermissions(role.permissions),
    });
    setDialogOpen(true);
  }, []);

  const handleDeleteRole = useCallback(
    (roleId: string) => {
      const role = roles.find((r) => r._id === roleId || r.id === roleId);
      if (!role) {
        openSnackbar("Role not found", "error");
        return;
      }
      if (role.isSystem) {
        openSnackbar("System roles cannot be deleted", "error");
        return;
      }
      setRoleToDelete(role);
      setDeleteDialogOpen(true);
      setDeleteConfirmText("");
    },
    [roles, openSnackbar]
  );

  const confirmDeleteRole = useCallback(async () => {
    if (!roleToDelete) return;

    if (deleteConfirmText !== roleToDelete.displayName) {
      openSnackbar(
        "The typed name does not match the role's display name",
        "error"
      );
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/roles/${roleToDelete.id}`);
      openSnackbar("Role deleted successfully", "success");
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      setDeleteConfirmText("");
      await loadRoles();
    } catch (err: any) {
      console.error("Error deleting role:", err);
      openSnackbar(
        err?.response?.data?.message || "Failed to delete role",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }, [roleToDelete, deleteConfirmText, openSnackbar, loadRoles]);

  const validateRoleForm = (roleForm: RoleFormState): string | null => {
    if (!roleForm.name.trim() || !roleForm.displayName.trim()) {
      return "Please fill in all required fields";
    }

    const namePattern = /^[a-z0-9_]+$/;
    if (!namePattern.test(roleForm.name)) {
      return "Role name can only contain lowercase letters, numbers, and underscores";
    }

    return null;
  };

  const handleSaveRole = useCallback(async () => {
    const error = validateRoleForm(newRole);
    if (error) {
      openSnackbar(error, "error");
      return;
    }

    setSaving(true);

    const normalizedName = newRole.name.toLowerCase();

    const payload = {
      name: normalizedName,
      displayName: (newRole.displayName || "").trim(),
      description: (newRole.description || "").trim(),
      permissions: newRole.permissions,
    };

    try {
      if (editingRole) {
        // Update existing role
        await api.put(`/roles/${editingRole.id}`, payload);
        openSnackbar("Role updated successfully", "success");
      } else {
        // Create new role
        await api.post("/roles", payload);
        openSnackbar("Role created successfully", "success");
      }

      setDialogOpen(false);
      await loadRoles();
    } catch (err: any) {
      console.error("Error saving role:", err);
      openSnackbar(
        err?.response?.data?.message || "Failed to save role",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }, [newRole, editingRole, openSnackbar, loadRoles]);

  const handlePermissionChange = useCallback(
    (moduleKey: string, permissionKey: keyof Permission, value: boolean) => {
      setNewRole((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleKey]: {
            ...prev.permissions[moduleKey],
            [permissionKey]: value,
          },
        },
      }));
    },
    []
  );

  const handleSelectAllModule = useCallback(
    (moduleKey: string, value: boolean) => {
      setNewRole((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleKey]: {
            view: value,
            create: value,
            edit: value,
            delete: value,
          },
        },
      }));
    },
    []
  );

  const getPermissionSummary = useCallback(
    (permissions: RolePermissions): string => {
      let total = 0;
      let granted = 0;

      (Object.values(permissions) as Permission[]).forEach((module) => {
        Object.values(module).forEach((perm) => {
          total += 1;
          if (perm) granted += 1;
        });
      });

      return `${granted}/${total}`;
    },
    []
  );

  const sortedRoles = useMemo(
    () =>
      [...roles].sort((a, b) => {
        if (a.isSystem && !b.isSystem) return -1;
        if (!a.isSystem && b.isSystem) return 1;
        return a.displayName.localeCompare(b.displayName);
      }),
    [roles]
  );

  // ---------- Render ----------

  if (!canViewRoles) {
  return (
    <Alert severity="error">
      You do not have permission to view role management.
    </Alert>
  );
}


  return (
    <Box>


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
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: "linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)",
          color: "white",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Role Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Create custom roles and manage access permissions
            </Typography>
            {loading && (
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, display: "block", mt: 0.5 }}
              >
                Loading roles...
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRole}
            disabled={!canCreateRoles}
            sx={{
              bgcolor: "white",
              color: "#5e35b1",
              "&:hover": { bgcolor: "#f5f5f5" },
              fontWeight: 600,
            }}
          >
            Create Custom Role
          </Button>
        </Stack>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          System roles (Administrator, Principal, Teacher, Business Office,
          Parent) are predefined and cannot be edited or deleted. You can create
          custom roles with specific permissions tailored to Nachlas Bais Yaakov&apos;s
          needs.
        </Typography>
      </Alert>
            

{!canEditRoles && (
  <Alert severity="info" sx={{ mb: 2 }}>
    You have view-only access. Editing is disabled.
  </Alert>
)}

      {/* Roles layout */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {sortedRoles.map((role) => (
          <Box
            key={role._id}
            sx={{
              width: {
                xs: "100%",
                sm: "calc(50% - 12px)",
                lg: "calc(33.333% - 16px)",
              },
              flexGrow: 1,
              minWidth: { xs: "100%", sm: 260 },
            }}
          >
            <Card
              elevation={3}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <SecurityIcon sx={{ color: role.color, fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {role.displayName}
                        </Typography>
                      </Stack>
                      {role.isSystem && (
                        <Chip
                          icon={<LockIcon />}
                          label="System Role"
                          size="small"
                          sx={{
                            bgcolor: "rgba(0,0,0,0.08)",
                            height: 24,
                            fontSize: "0.75rem",
                          }}
                        />
                      )}
                    </Box>
                    {!role.isSystem && (
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Duplicate">
                          <IconButton
                            size="small"
                            onClick={() => handleDuplicateRole(role)}
                            disabled={!canCreateRoles}
                            sx={{ color: "primary.main" }}
                            aria-label={`Duplicate ${role.displayName} role`}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRole(role)}
                            disabled={!canEditRoles}
                            sx={{ color: "primary.main" }}
                            aria-label={`Edit ${role.displayName} role`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={!canDeleteRoles}
                            sx={{ color: "error.main" }}
                            aria-label={`Delete ${role.displayName} role`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minHeight: 40 }}
                  >
                    {role.description}
                  </Typography>

                  <Divider />

                  {/* Stats */}
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Users
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: role.color }}
                      >
                        {role.userCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Permissions
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: role.color }}
                      >
                        {getPermissionSummary(role.permissions)}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Quick Permission Overview */}
                  <Box sx={{ pt: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Key Permissions:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {PERMISSIONS.map(({ key, label }) => {
  const perms = role.permissions[key];
  const hasAny =
    perms?.view || perms?.create || perms?.edit || perms?.delete;

  if (!hasAny) return null;

  return (
    <Chip
      key={key}
      label={label}
      size="small"
      sx={{ height: 22, fontSize: "0.7rem" }}
    />
  );
})}

                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Create/Edit Role Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!saving) {
            setDialogOpen(false);
          }
        }}
        maxWidth="md"
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
            background: "linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)",
            color: "white",
            fontWeight: 600,
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
          }}
        >
          {editingRole ? "Edit Role" : "Create Custom Role"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Role Name *"
                    placeholder="e.g., guidance_counselor"
                    value={newRole.name}
                    onChange={(e) =>
                      setNewRole((prev) => ({
                        ...prev,
                        name: e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "_"),
                      }))
                    }
                    size="small"
                    helperText="Lowercase, no spaces (underscores only)"
                    disabled={!!editingRole}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Display Name *"
                    placeholder="e.g., Guidance Counselor"
                    value={newRole.displayName}
                    onChange={(e) =>
                      setNewRole((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    size="small"
                  />
                </Box>
              </Stack>

              <TextField
                fullWidth
                label="Description"
                placeholder="Brief description of this role's responsibilities"
                value={newRole.description}
                onChange={(e) =>
                  setNewRole((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                size="small"
                multiline
                rows={2}
              />
            </Box>

            <Divider />

            {/* Permissions */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Module Permissions
              </Typography>

              {isMobile ? (
                // Mobile: Accordion View
                <Stack spacing={1}>
                  {PERMISSIONS.map(({ key, label }) => {
                    const perms = newRole.permissions[key];
                    const allChecked =
                      perms.view && perms.create && perms.edit && perms.delete;

                    return (
                      <Accordion key={key} defaultExpanded={false}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            "& .MuiAccordionSummary-content": {
                              alignItems: "center",
                              justifyContent: "space-between",
                            },
                          }}
                        >
                          <Typography variant="body2" fontWeight={500}>
                            {label}
                          </Typography>
                          <Checkbox
                            checked={allChecked}
                            disabled={!canEditRoles}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleSelectAllModule(key, e.target.checked)
                            }
                            sx={{ ml: 2 }}
                          />
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={1.5}>
                            {(["view", "create", "edit", "delete"] as const).map(
                              (action) => (
                                <FormControlLabel
                                  key={action}
                                  control={
                                    <Checkbox
                                      checked={perms[action]}
                                      disabled={!canEditRoles}
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          key,
                                          action,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  }
                                  label={
                                    <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                      {action}
                                    </Typography>
                                  }
                                />
                              )
                            )}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              ) : (
                // Desktop: Table View
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Module</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          View
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Create
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Edit
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Delete
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          All
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {PERMISSIONS.map(({ key, label }) => {
  const perms = newRole.permissions[key];
  const allChecked =
    perms.view && perms.create && perms.edit && perms.delete;

  return (
    <TableRow key={key}>
      <TableCell>{label}</TableCell>

      {(["view", "create", "edit", "delete"] as const).map(action => (
        <TableCell align="center" key={action}>
          <Checkbox
            checked={perms[action]}
            disabled={!canEditRoles}
            onChange={(e) =>
              handlePermissionChange(key, action, e.target.checked)
            }
          />
        </TableCell>
      ))}

      <TableCell align="center">
        <Checkbox
          checked={allChecked}
          disabled={!canEditRoles}
          onChange={(e) =>
            handleSelectAllModule(key, e.target.checked)
          }
        />
      </TableCell>
    </TableRow>
  );
})}

                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
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
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            disabled={saving}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRole}
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            disabled={
              saving ||
              (editingRole ? !canEditRoles : !canCreateRoles)
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {saving
              ? editingRole
                ? "Updating..."
                : "Creating..."
              : editingRole
              ? "Update Role"
              : "Create Role"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Role Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
            setRoleToDelete(null);
            setDeleteConfirmText("");
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
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DeleteIcon color="error" />
              <Typography variant="h6">Delete Role</Typography>
            </Box>
            {roleToDelete && (
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  color: "error.main",
                  fontSize: "1.1rem",
                }}
              >
                Confirm deletion of: <strong>{roleToDelete.displayName}</strong>
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="error" icon={<DeleteIcon />}>
              This action cannot be undone. This will permanently delete the role
              and remove it from all users who have it assigned.
            </Alert>

            <Box>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                To confirm deletion, type the role's display name below:
              </Typography>

              <TextField
                fullWidth
                label={`Type "${roleToDelete?.displayName || ""}" to confirm`}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={roleToDelete?.displayName || ""}
                disabled={deleting || !roleToDelete?.displayName}
                autoFocus
                error={
                  deleteConfirmText.length > 0 &&
                  deleteConfirmText !== (roleToDelete?.displayName || "")
                }
                helperText={
                  !roleToDelete?.displayName
                    ? "Loading role information..."
                    : deleteConfirmText.length > 0 &&
                      deleteConfirmText !== roleToDelete.displayName
                    ? "The name does not match"
                    : `Type "${roleToDelete.displayName}" exactly as shown`
                }
                sx={{ mb: 1 }}
              />
            </Box>
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
              setDeleteDialogOpen(false);
              setRoleToDelete(null);
              setDeleteConfirmText("");
            }}
            variant="outlined"
            disabled={deleting}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteRole}
            variant="contained"
            color="error"
            disabled={
              deleting ||
              !roleToDelete?.displayName ||
              deleteConfirmText !== roleToDelete.displayName
            }
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {deleting ? "Deleting..." : "Delete Role"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
