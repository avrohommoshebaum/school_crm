import { useState, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import GradeIcon from '@mui/icons-material/Grade';
import EmailIcon from '@mui/icons-material/Email';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface ModulePermissions {
  students: Permission;
  classes: Permission;
  reportCards: Permission;
  communications: Permission;
  applications: Permission;
  financial: Permission;
  users: Permission;
  settings: Permission;
  reports: Permission;
}

type ModuleKey = keyof ModulePermissions;

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: ModulePermissions;
  color: string;
}

interface RoleFormState {
  name: string;
  displayName: string;
  description: string;
  permissions: ModulePermissions;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const defaultPermission: Permission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

const createEmptyModulePermissions = (): ModulePermissions => ({
  students: { ...defaultPermission },
  classes: { ...defaultPermission },
  reportCards: { ...defaultPermission },
  communications: { ...defaultPermission },
  applications: { ...defaultPermission },
  financial: { ...defaultPermission },
  users: { ...defaultPermission },
  settings: { ...defaultPermission },
  reports: { ...defaultPermission },
});

const cloneModulePermissions = (permissions: ModulePermissions): ModulePermissions => ({
  students: { ...permissions.students },
  classes: { ...permissions.classes },
  reportCards: { ...permissions.reportCards },
  communications: { ...permissions.communications },
  applications: { ...permissions.applications },
  financial: { ...permissions.financial },
  users: { ...permissions.users },
  settings: { ...permissions.settings },
  reports: { ...permissions.reports },
});

const modules: {
  key: ModuleKey;
  name: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { key: 'students', name: 'Student Management', icon: SchoolIcon, color: '#1976d2' },
  { key: 'classes', name: 'Classes & Attendance', icon: ClassIcon, color: '#388e3c' },
  { key: 'reportCards', name: 'Report Cards & Grades', icon: GradeIcon, color: '#f57c00' },
  { key: 'communications', name: 'Communications', icon: EmailIcon, color: '#7b1fa2' },
  { key: 'applications', name: 'Applications', icon: AssignmentIcon, color: '#0097a7' },
  { key: 'financial', name: 'Financial Management', icon: AttachMoneyIcon, color: '#689f38' },
  { key: 'users', name: 'User Management', icon: PeopleIcon, color: '#d32f2f' },
  { key: 'settings', name: 'School Settings', icon: SettingsIcon, color: '#5d4037' },
  { key: 'reports', name: 'Reports & Analytics', icon: BarChartIcon, color: '#455a64' },
];

const createEmptyRoleForm = (): RoleFormState => ({
  name: '',
  displayName: '',
  description: '',
  permissions: createEmptyModulePermissions(),
});

export default function RoleManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<RoleFormState>(() => createEmptyRoleForm());

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access with all permissions',
      isSystem: true,
      userCount: 2,
      color: '#d32f2f',
      permissions: {
        students: { view: true, create: true, edit: true, delete: true },
        classes: { view: true, create: true, edit: true, delete: true },
        reportCards: { view: true, create: true, edit: true, delete: true },
        communications: { view: true, create: true, edit: true, delete: true },
        applications: { view: true, create: true, edit: true, delete: true },
        financial: { view: true, create: true, edit: true, delete: true },
        users: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, create: true, edit: true, delete: true },
      },
    },
    {
      id: 'principal',
      name: 'principal',
      displayName: 'Principal',
      description: 'Manages students, applications, and communications',
      isSystem: true,
      userCount: 3,
      color: '#1976d2',
      permissions: {
        students: { view: true, create: true, edit: true, delete: false },
        classes: { view: true, create: true, edit: true, delete: false },
        reportCards: { view: true, create: true, edit: true, delete: false },
        communications: { view: true, create: true, edit: false, delete: false },
        applications: { view: true, create: true, edit: true, delete: false },
        financial: { view: true, create: false, edit: false, delete: false },
        users: { view: true, create: false, edit: false, delete: false },
        settings: { view: true, create: false, edit: false, delete: false },
        reports: { view: true, create: true, edit: false, delete: false },
      },
    },
    {
      id: 'teacher',
      name: 'teacher',
      displayName: 'Teacher',
      description: 'Manages classes, attendance, and report cards',
      isSystem: true,
      userCount: 15,
      color: '#388e3c',
      permissions: {
        students: { view: true, create: false, edit: false, delete: false },
        classes: { view: true, create: false, edit: true, delete: false },
        reportCards: { view: true, create: true, edit: true, delete: false },
        communications: { view: true, create: false, edit: false, delete: false },
        applications: { view: false, create: false, edit: false, delete: false },
        financial: { view: false, create: false, edit: false, delete: false },
        users: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
      },
    },
    {
      id: 'business_office',
      name: 'business_office',
      displayName: 'Business Office',
      description: 'Manages financial aspects, tuition, and donations',
      isSystem: true,
      userCount: 2,
      color: '#689f38',
      permissions: {
        students: { view: true, create: false, edit: false, delete: false },
        classes: { view: true, create: false, edit: false, delete: false },
        reportCards: { view: false, create: false, edit: false, delete: false },
        communications: { view: true, create: true, edit: false, delete: false },
        applications: { view: true, create: false, edit: false, delete: false },
        financial: { view: true, create: true, edit: true, delete: false },
        users: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        reports: { view: true, create: true, edit: false, delete: false },
      },
    },
    {
      id: 'parent',
      name: 'parent',
      displayName: 'Parent',
      description: "Views their children's information and report cards",
      isSystem: true,
      userCount: 45,
      color: '#7b1fa2',
      permissions: {
        students: { view: true, create: false, edit: false, delete: false },
        classes: { view: true, create: false, edit: false, delete: false },
        reportCards: { view: true, create: false, edit: false, delete: false },
        communications: { view: true, create: false, edit: false, delete: false },
        applications: { view: false, create: false, edit: false, delete: false },
        financial: { view: true, create: false, edit: false, delete: false },
        users: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        reports: { view: false, create: false, edit: false, delete: false },
      },
    },
  ]);

  const handleSnackbarClose = useCallback(
    (_: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return;
      setSnackbar((prev) => ({ ...prev, open: false }));
    },
    []
  );

  const openSnackbar = useCallback((message: string, severity: AlertColor = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCreateRole = useCallback(() => {
    setEditingRole(null);
    setNewRole(createEmptyRoleForm());
    setDialogOpen(true);
  }, []);

  const handleEditRole = useCallback(
    (role: Role) => {
      if (role.isSystem) {
        openSnackbar('System roles cannot be edited', 'error');
        return;
      }
      setEditingRole(role);
      setNewRole({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: cloneModulePermissions(role.permissions),
      });
      setDialogOpen(true);
    },
    [openSnackbar]
  );

  const handleDuplicateRole = useCallback((role: Role) => {
    setEditingRole(null);
    setNewRole({
      name: '',
      displayName: `${role.displayName} (Copy)`,
      description: role.description,
      permissions: cloneModulePermissions(role.permissions),
    });
    setDialogOpen(true);
  }, []);

  const handleDeleteRole = useCallback(
    (roleId: string) => {
      const role = roles.find((r) => r.id === roleId);
      if (role?.isSystem) {
        openSnackbar('System roles cannot be deleted', 'error');
        return;
      }
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      openSnackbar('Role deleted successfully', 'success');
    },
    [roles, openSnackbar]
  );

  const validateRoleForm = (roleForm: RoleFormState): string | null => {
    if (!roleForm.name.trim() || !roleForm.displayName.trim()) {
      return 'Please fill in all required fields';
    }

    const namePattern = /^[a-z0-9_]+$/;
    if (!namePattern.test(roleForm.name)) {
      return 'Role name can only contain lowercase letters, numbers, and underscores';
    }

    return null;
  };

  const handleSaveRole = useCallback(() => {
    const error = validateRoleForm(newRole);
    if (error) {
      openSnackbar(error, 'error');
      return;
    }

    const normalizedName = newRole.name.toLowerCase();

    if (editingRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRole.id
            ? {
                ...r,
                displayName: newRole.displayName.trim(),
                description: newRole.description.trim(),
                permissions: cloneModulePermissions(newRole.permissions),
              }
            : r
        )
      );
      openSnackbar('Role updated successfully', 'success');
    } else {
      const id = normalizedName.replace(/\s+/g, '_');

      if (roles.some((r) => r.id === id)) {
        openSnackbar('A role with this name already exists', 'error');
        return;
      }

      const newRoleObj: Role = {
        id,
        name: id,
        displayName: newRole.displayName.trim(),
        description: newRole.description.trim(),
        isSystem: false,
        userCount: 0,
        color: '#0097a7',
        permissions: cloneModulePermissions(newRole.permissions),
      };
      setRoles((prev) => [...prev, newRoleObj]);
      openSnackbar('Role created successfully', 'success');
    }

    setDialogOpen(false);
  }, [newRole, editingRole, roles, openSnackbar]);

  const handlePermissionChange = useCallback(
    (moduleKey: ModuleKey, permissionKey: keyof Permission, value: boolean) => {
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

  const handleSelectAllModule = useCallback((moduleKey: ModuleKey, value: boolean) => {
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
  }, []);

  const getPermissionSummary = useCallback((permissions: ModulePermissions): string => {
    let total = 0;
    let granted = 0;

    (Object.values(permissions) as Permission[]).forEach((module) => {
      Object.values(module).forEach((perm) => {
        total += 1;
        if (perm) granted += 1;
      });
    });

    return `${granted}/${total}`;
  }, []);

  const sortedRoles = useMemo(
    () =>
      [...roles].sort((a, b) => {
        if (a.isSystem && !b.isSystem) return -1;
        if (!a.isSystem && b.isSystem) return 1;
        return a.displayName.localeCompare(b.displayName);
      }),
    [roles]
  );

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: 'linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)',
          color: 'white',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Role Management
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Create custom roles and manage access permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRole}
            sx={{
              bgcolor: 'white',
              color: '#5e35b1',
              '&:hover': { bgcolor: '#f5f5f5' },
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
          System roles (Administrator, Principal, Teacher, Business Office, Parent) are predefined
          and cannot be edited or deleted. You can create custom roles with specific permissions
          tailored to your school&apos;s needs.
        </Typography>
      </Alert>

      {/* Roles layout (no Grid) */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
        }}
      >
        {sortedRoles.map((role) => (
          <Box
            key={role.id}
            sx={{
              width: {
                xs: '100%',
                sm: 'calc(50% - 12px)', // spacing ~3 => 24px; half - half-gap
                lg: 'calc(33.333% - 16px)', // three per row on large
              },
              flexGrow: 1,
              minWidth: { xs: '100%', sm: 260 },
            }}
          >
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
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
                            bgcolor: 'rgba(0,0,0,0.08)',
                            height: 24,
                            fontSize: '0.75rem',
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
                            sx={{ color: 'primary.main' }}
                            aria-label={`Duplicate ${role.displayName} role`}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditRole(role)}
                            sx={{ color: 'primary.main' }}
                            aria-label={`Edit ${role.displayName} role`}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteRole(role.id)}
                            sx={{ color: 'error.main' }}
                            aria-label={`Delete ${role.displayName} role`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                    {role.description}
                  </Typography>

                  <Divider />

                  {/* Stats */}
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Users
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: role.color }}>
                        {role.userCount}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Permissions
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: role.color }}>
                        {getPermissionSummary(role.permissions)}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Quick Permission Overview */}
                  <Box sx={{ pt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Key Permissions:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {modules.map((module) => {
                        const modPerms = role.permissions[module.key];
                        const hasAnyPerm =
                          modPerms.view || modPerms.create || modPerms.edit || modPerms.delete;
                        if (!hasAnyPerm) return null;
                        return (
                          <Chip
                            key={module.key}
                            label={module.name.replace(' & ', ' ')}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              bgcolor: `${module.color}15`,
                              color: module.color,
                              fontWeight: 500,
                            }}
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
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)',
            color: 'white',
            fontWeight: 600,
          }}
        >
          {editingRole ? 'Edit Role' : 'Create Custom Role'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
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
                        name: e.target.value.toLowerCase().replace(/\s+/g, '_'),
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
                  {modules.map((module) => {
                    const ModuleIcon = module.icon;
                    const modPerms = newRole.permissions[module.key];
                    const hasAnyPerm =
                      modPerms.view || modPerms.create || modPerms.edit || modPerms.delete;

                    return (
                      <Accordion key={module.key}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <ModuleIcon sx={{ color: module.color, fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {module.name}
                            </Typography>
                            {hasAnyPerm && (
                              <Chip
                                label="Active"
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={1}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={modPerms.view}
                                  onChange={(e) =>
                                    handlePermissionChange(module.key, 'view', e.target.checked)
                                  }
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2">View</Typography>}
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={modPerms.create}
                                  onChange={(e) =>
                                    handlePermissionChange(module.key, 'create', e.target.checked)
                                  }
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2">Create</Typography>}
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={modPerms.edit}
                                  onChange={(e) =>
                                    handlePermissionChange(module.key, 'edit', e.target.checked)
                                  }
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2">Edit</Typography>}
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={modPerms.delete}
                                  onChange={(e) =>
                                    handlePermissionChange(module.key, 'delete', e.target.checked)
                                  }
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2">Delete</Typography>}
                            />
                            <Button
                              size="small"
                              onClick={() => handleSelectAllModule(module.key, !hasAnyPerm)}
                              variant="outlined"
                              fullWidth
                            >
                              {hasAnyPerm ? 'Clear All' : 'Select All'}
                            </Button>
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
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
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
                      {modules.map((module) => {
                        const ModuleIcon = module.icon;
                        const modPerms = newRole.permissions[module.key];
                        const allChecked =
                          modPerms.view &&
                          modPerms.create &&
                          modPerms.edit &&
                          modPerms.delete;

                        return (
                          <TableRow key={module.key} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <ModuleIcon sx={{ color: module.color, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {module.name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={modPerms.view}
                                onChange={(e) =>
                                  handlePermissionChange(module.key, 'view', e.target.checked)
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={modPerms.create}
                                onChange={(e) =>
                                  handlePermissionChange(module.key, 'create', e.target.checked)
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={modPerms.edit}
                                onChange={(e) =>
                                  handlePermissionChange(module.key, 'edit', e.target.checked)
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={modPerms.delete}
                                onChange={(e) =>
                                  handlePermissionChange(module.key, 'delete', e.target.checked)
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Checkbox
                                checked={allChecked}
                                onChange={(e) =>
                                  handleSelectAllModule(module.key, e.target.checked)
                                }
                                size="small"
                                color="secondary"
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
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveRole} variant="contained" startIcon={<SaveIcon />}>
            {editingRole ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
