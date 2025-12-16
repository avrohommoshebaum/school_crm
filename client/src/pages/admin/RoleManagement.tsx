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
import useCurrentUser from "../../hooks/useCurrentUser";
import { hasPermission } from "../../utils/permissions";

/* ---------- PERMISSIONS ---------- */

const NO_PERMISSION_TOOLTIP =
  "You do not have permission to perform this action.";

/* ---------- Types / helpers (UNCHANGED) ---------- */

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
  _id: string;
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

interface ApiRole {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  userCount?: number;
  color?: string;
  permissions: ModulePermissions;
}

interface RolesResponse {
  roles: ApiRole[];
}

/* ---------- Helpers (UNCHANGED) ---------- */

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

const cloneModulePermissions = (permissions: ModulePermissions): ModulePermissions =>
  JSON.parse(JSON.stringify(permissions));

/* ---------- Component ---------- */

export default function RoleManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const canView = hasPermission(currentUser, "users", "view");
  const canCreate = hasPermission(currentUser, "users", "create");
  const canEdit = hasPermission(currentUser, "users", "edit");
  const canDelete = hasPermission(currentUser, "users", "delete");

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<RoleFormState>(() => ({
    name: "",
    displayName: "",
    description: "",
    permissions: createEmptyModulePermissions(),
  }));

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ---------- Load Roles ---------- */

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<RolesResponse>("/roles");
      setRoles(
        data.roles.map((r) => ({
          id: r._id,
          _id: r._id,
          name: r.name,
          displayName: r.displayName,
          description: r.description,
          isSystem: r.isSystem,
          userCount: r.userCount ?? 0,
          color: r.color ?? "#0097a7",
          permissions: cloneModulePermissions(r.permissions),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) loadRoles();
  }, [loadRoles, canView]);

  /* ---------- Guard ---------- */

  if (userLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  if (!canView) {
    return (
      <Alert severity="error">
        You do not have permission to view role management.
      </Alert>
    );
  }

  /* ---------- Render ---------- */

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5" fontWeight={600}>
            Role Management
          </Typography>

          <Tooltip
            title={!canCreate ? NO_PERMISSION_TOOLTIP : ""}
            disableHoverListener={canCreate}
          >
            <span>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                disabled={!canCreate}
                onClick={() => setDialogOpen(true)}
              >
                Create Role
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>{role.displayName}</Typography>

                {!role.isSystem && (
                  <Stack direction="row" spacing={1}>
                    <Tooltip
                      title={!canEdit ? NO_PERMISSION_TOOLTIP : "Edit"}
                      disableHoverListener={canEdit}
                    >
                      <span>
                        <IconButton
                          disabled={!canEdit}
                          onClick={() => {
                            setEditingRole(role);
                            setNewRole({
                              name: role.name,
                              displayName: role.displayName,
                              description: role.description,
                              permissions: cloneModulePermissions(role.permissions),
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip
                      title={!canDelete ? NO_PERMISSION_TOOLTIP : "Delete"}
                      disableHoverListener={canDelete}
                    >
                      <span>
                        <IconButton
                          disabled={!canDelete}
                          onClick={async () => {
                            await api.delete(`/roles/${role.id}`);
                            loadRoles();
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Dialog remains unchanged except Save button */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
        <DialogContent />
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Tooltip
            title={!canEdit && editingRole ? NO_PERMISSION_TOOLTIP : ""}
            disableHoverListener={canEdit || !editingRole}
          >
            <span>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={editingRole ? !canEdit : !canCreate}
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
