import React, { useEffect, useState, useCallback } from 'react';
import { ALL_QUICK_ACTIONS } from './widgets/QuickActionsWidget';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  WIDGET_REGISTRY,
  getDefaultWidgetsForRole,
  getAvailableWidgets,
} from './WidgetRegistry';
import type { Widget } from './WidgetRegistry';
import WidgetRenderer from './WidgetRenderer';
import api from '../../utils/api';

interface DashboardWidget {
  id: string;
  size: 'small' | 'medium' | 'large';
  config?: Record<string, any>; // Widget-specific configuration
}

interface DragEndEvent {
  active: { id: string | number };
  over: { id: string | number } | null;
}

// Sortable Widget Item Component
function SortableWidgetItem({
  widgetId,
  size,
  config,
  isEditMode,
  onRemove,
  onSizeChange,
  onConfigChange,
}: {
  widgetId: string;
  size: 'small' | 'medium' | 'large';
  config?: Record<string, any>;
  isEditMode: boolean;
  onRemove: (id: string) => void;
  onSizeChange: (id: string, newSize: 'small' | 'medium' | 'large') => void;
  onConfigChange: (id: string, config: Record<string, any>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widgetId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const widget = WIDGET_REGISTRY.find((w) => w.id === widgetId);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  if (!widget) return null;
  
  const isQuickActionsWidget = widgetId === 'quick-actions';

  const getGridProps = (size: string) => {
    switch (size) {
      case 'small':
        return { xs: 12, sm: 6, md: 3 };
      case 'medium':
        return { xs: 12, sm: 6, md: 6 };
      case 'large':
        return { xs: 12, sm: 12, md: 12 };
      default:
        return { xs: 12, sm: 6, md: 6 };
    }
  };

  // Memoize grid props to ensure they update when size changes
  const gridProps = React.useMemo(() => getGridProps(size), [size]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    onSizeChange(widgetId, newSize);
    handleMenuClose();
  };

  const handleRemove = () => {
    onRemove(widgetId);
    handleMenuClose();
  };

  // Force re-render when size changes by using size in the component
  const gridItemProps = {
    xs: gridProps.xs,
    sm: gridProps.sm,
    md: gridProps.md,
    item: true,
  };

  return (
    <Grid 
      item 
      {...(gridItemProps as any)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div 
        ref={setNodeRef} 
        style={{
          ...style,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {isEditMode && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              display: 'flex',
              gap: 1,
            }}
          >
            <Tooltip title="Drag to reorder">
              <IconButton
                size="small"
                {...attributes}
                {...listeners}
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <DragIndicator fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Widget options">
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem 
                onClick={() => {
                  console.log('Changing size to small for widget:', widgetId);
                  handleSizeChange('small');
                }}
                selected={size === 'small'}
              >
                Small Size {size === 'small' && '✓'}
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  console.log('Changing size to medium for widget:', widgetId);
                  handleSizeChange('medium');
                }}
                selected={size === 'medium'}
              >
                Medium Size {size === 'medium' && '✓'}
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  console.log('Changing size to large for widget:', widgetId);
                  handleSizeChange('large');
                }}
                selected={size === 'large'}
              >
                Large Size {size === 'large' && '✓'}
              </MenuItem>
              {isQuickActionsWidget && (
                <MenuItem onClick={() => {
                  setConfigDialogOpen(true);
                  handleMenuClose();
                }}>
                  Configure Actions
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Remove Widget
              </MenuItem>
            </Menu>
          </Box>
        )}
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            border: isEditMode ? '2px dashed #1976d2' : 'none',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <WidgetRenderer componentName={widget.component} config={config} />
        </Box>
      </div>
      
      {/* Quick Actions Configuration Dialog */}
      {isQuickActionsWidget && (
        <QuickActionsConfigDialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          selectedActions={config?.selectedActions || []}
          onSave={(selectedActions) => {
            onConfigChange(widgetId, { selectedActions });
            setConfigDialogOpen(false);
          }}
        />
      )}
    </Grid>
  );
}

// Quick Actions Configuration Dialog Component
function QuickActionsConfigDialog({
  open,
  onClose,
  selectedActions,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selectedActions: string[];
  onSave: (selectedActions: string[]) => void;
}) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedActions);
  
  React.useEffect(() => {
    setLocalSelected(selectedActions);
  }, [selectedActions, open]);

  const handleToggle = (actionId: string) => {
    setLocalSelected((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleSave = () => {
    onSave(localSelected);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure Quick Actions</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select which actions to display in your Quick Actions widget
        </Typography>
        <List>
          {ALL_QUICK_ACTIONS.map((action: any) => {
            const Icon = action.icon;
            const isSelected = localSelected.includes(action.id);
            return (
              <ListItem
                key={action.id}
                onClick={() => handleToggle(action.id)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isSelected}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemIcon>
                  <Icon sx={{ color: `${action.color}.main` }} />
                </ListItemIcon>
                <ListItemText
                  primary={action.label}
                  secondary={action.path}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Dashboard() {
  const { user, loading: userLoading, settings, reload } = useCurrentUser();
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(
    []
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [widgetPickerOpen, setWidgetPickerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const [welcomeShown, setWelcomeShown] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load dashboard configuration
  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    const loadDashboard = async () => {
      try {
        // Check if user has saved dashboard configuration
        // Settings structure from API: { settings: { dashboard: { widgets: [...] } } }
        // But settings object itself might be the settings property
        const settingsData = (settings as any)?.settings || (settings as any);
        const savedConfig = settingsData?.dashboard;
        
        console.log('Loading dashboard - settings:', settings);
        console.log('Loading dashboard - savedConfig:', savedConfig);
        
        if (savedConfig && Array.isArray(savedConfig.widgets) && savedConfig.widgets.length > 0) {
          console.log('Loading saved dashboard config:', savedConfig.widgets);
          // Validate saved widgets are still available
          const roles = user.roles || [];
          const userPermissions: string[] = [];
          roles.forEach((role) => {
            Object.entries(role.permissions || {}).forEach(
              ([module, perms]: [string, any]) => {
                if (perms?.view) userPermissions.push(`${module}.view`);
                if (perms?.create) userPermissions.push(`${module}.create`);
                if (perms?.edit) userPermissions.push(`${module}.edit`);
                if (perms?.delete) userPermissions.push(`${module}.delete`);
              }
            );
          });

          const availableWidgets = getAvailableWidgets(userPermissions);
          const availableWidgetIds = availableWidgets.map((w) => w.id);

          const validWidgets = savedConfig.widgets.filter(
            (w: DashboardWidget) => availableWidgetIds.includes(w.id)
          );

          if (validWidgets.length > 0) {
            setDashboardWidgets(validWidgets);
            setLoading(false);
            return;
          }
        }

        // Fall back to default widgets for role
        const roles = user.roles || [];
        const primaryRole =
          roles.find((r) => r.name === 'admin')?.name ||
          roles.find((r) => r.name === 'principal')?.name ||
          roles.find((r) => r.name === 'business_office')?.name ||
          roles.find((r) => r.name === 'teacher')?.name ||
          roles.find((r) => r.name === 'parent')?.name ||
          'teacher';

        const userPermissions: string[] = [];
        roles.forEach((role) => {
          Object.entries(role.permissions || {}).forEach(
            ([module, perms]: [string, any]) => {
              if (perms?.view) userPermissions.push(`${module}.view`);
              if (perms?.create) userPermissions.push(`${module}.create`);
              if (perms?.edit) userPermissions.push(`${module}.edit`);
              if (perms?.delete) userPermissions.push(`${module}.delete`);
            }
          );
        });

        const defaultWidgets = getDefaultWidgetsForRole(
          primaryRole,
          userPermissions
        );
        const widgetsWithSize: DashboardWidget[] = defaultWidgets.map(
          (widgetId) => {
            const widget = WIDGET_REGISTRY.find((w) => w.id === widgetId);
            return {
              id: widgetId,
              size: widget?.defaultSize || 'medium',
            };
          }
        );
        setDashboardWidgets(widgetsWithSize);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user, userLoading, settings]);


  // Save dashboard configuration
  const saveDashboard = useCallback(async () => {
    if (!user) return;

    setSaving(true);
    try {
      const dashboardConfig = {
        dashboard: {
          widgets: dashboardWidgets,
        },
      };
      
      console.log('Saving dashboard config:', dashboardConfig);
      
      await api.put('/profile/me/settings', dashboardConfig);
      
      // Reload settings to get the updated configuration
      await reload();
      
      console.log('Dashboard saved successfully');
      setSnackbar({
        open: true,
        message: 'Dashboard saved successfully!',
        severity: 'success',
      });
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving dashboard:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save dashboard. Please try again.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [dashboardWidgets, user, reload]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDashboardWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Remove widget
  const handleRemoveWidget = (widgetId: string) => {
    setDashboardWidgets((items) => items.filter((item) => item.id !== widgetId));
  };

  // Change widget size
  const handleSizeChange = (
    widgetId: string,
    newSize: 'small' | 'medium' | 'large'
  ) => {
    console.log('Changing widget size:', widgetId, 'to', newSize);
    setDashboardWidgets((items) => {
      const updated = items.map((item) =>
        item.id === widgetId ? { ...item, size: newSize } : item
      );
      console.log('Updated widgets:', updated);
      return updated;
    });
  };

  // Change widget configuration
  const handleConfigChange = (
    widgetId: string,
    newConfig: Record<string, any>
  ) => {
    console.log('Changing widget config:', widgetId, newConfig);
    setDashboardWidgets((items) => {
      const updated = items.map((item) =>
        item.id === widgetId ? { ...item, config: { ...item.config, ...newConfig } } : item
      );
      console.log('Updated widgets with config:', updated);
      return updated;
    });
  };

  // Add widget
  const handleAddWidget = (widget: Widget) => {
    if (!dashboardWidgets.find((w) => w.id === widget.id)) {
      setDashboardWidgets((items) => [
        ...items,
        {
          id: widget.id,
          size: widget.defaultSize,
        },
      ]);
    }
    setWidgetPickerOpen(false);
  };

  // Get available widgets for picker
  const getAvailableWidgetsForPicker = (): Widget[] => {
    if (!user) return [];

    const roles = user.roles || [];
    const userPermissions: string[] = [];
    roles.forEach((role) => {
      Object.entries(role.permissions || {}).forEach(
        ([module, perms]: [string, any]) => {
          if (perms?.view) userPermissions.push(`${module}.view`);
          if (perms?.create) userPermissions.push(`${module}.create`);
          if (perms?.edit) userPermissions.push(`${module}.edit`);
          if (perms?.delete) userPermissions.push(`${module}.delete`);
        }
      );
    });

    const available = getAvailableWidgets(userPermissions);
    const currentWidgetIds = dashboardWidgets.map((w) => w.id);
    return available.filter((w) => !currentWidgetIds.includes(w.id));
  };

  const userName = user?.name || 'User';
  const primaryRole =
    user?.roles?.[0]?.displayName || user?.roles?.[0]?.name || 'User';

  // Show welcome popup when dashboard loads (must be before any conditional returns)
  useEffect(() => {
    if (!loading && !userLoading && user && !welcomeShown) {
      const welcomeMessages = [
        `Welcome back, ${userName}! 🎉`,
        `Great to see you again, ${userName}! ✨`,
        `Hey ${userName}, let's make today amazing! 🚀`,
        `Welcome back, ${userName}! Ready to dive in? 💪`,
        `${userName}, you've got this! 🌟`,
      ];
      const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      
      setSnackbar({
        open: true,
        message: randomMessage,
        severity: 'success',
      });
      setWelcomeShown(true);
      
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }, 4000);
    }
  }, [loading, userLoading, user, welcomeShown, userName]);

  if (userLoading || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Edit Mode Toggle */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isEditMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setIsEditMode(false);
                  // Reload to reset changes
                  window.location.reload();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveDashboard}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditMode(true)}
            >
              Customize Dashboard
            </Button>
          )}
        </Box>
      </Box>

      {/* Edit Mode Instructions */}
      {isEditMode && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'info.light',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2">
            <strong>Edit Mode:</strong> Drag widgets to reorder, use the menu
            to change size or remove widgets, and click "Add Widget" to add new
            widgets.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setWidgetPickerOpen(true)}
          >
            Add Widget
          </Button>
        </Box>
      )}

      {/* Widgets Grid */}
      {dashboardWidgets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No widgets available for your role ({primaryRole})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isEditMode ? (
              <>
                Click "Add Widget" to add widgets to your dashboard.
              </>
            ) : (
              <>
                Contact your administrator to configure your dashboard, or click
                "Customize Dashboard" to add widgets.
              </>
            )}
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dashboardWidgets.map((w) => w.id)}
          >
            <Grid 
              container 
              spacing={3}
              key={`grid-container-${dashboardWidgets.map(w => `${w.id}:${w.size}`).join('|')}`}
              sx={{
                alignItems: 'stretch',
                '& > .MuiGrid-item': {
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
            >
              {dashboardWidgets.map((widget) => (
                <SortableWidgetItem
                  key={widget.id}
                  widgetId={widget.id}
                  size={widget.size}
                  config={widget.config}
                  isEditMode={isEditMode}
                  onRemove={handleRemoveWidget}
                  onSizeChange={handleSizeChange}
                  onConfigChange={handleConfigChange}
                />
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
      )}

      {/* Widget Picker Dialog */}
      <Dialog
        open={widgetPickerOpen}
        onClose={() => setWidgetPickerOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Widget to Dashboard</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {getAvailableWidgetsForPicker().length === 0 ? (
              <Typography color="text.secondary">
                All available widgets are already added to your dashboard.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {getAvailableWidgetsForPicker().map((widget) => (
                  <Grid item xs={12} sm={6} md={4} key={widget.id} {...({} as any)}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => handleAddWidget(widget)}
                    >
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {widget.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {widget.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={widget.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={widget.defaultSize}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWidgetPickerOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.message.includes('🎉') || snackbar.message.includes('✨') || snackbar.message.includes('🚀') || snackbar.message.includes('💪') || snackbar.message.includes('🌟') ? 4000 : 6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            fontSize: '1.1rem',
            fontWeight: 600,
          },
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontSize: '1.1rem',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
          icon={snackbar.message.includes('🎉') || snackbar.message.includes('✨') || snackbar.message.includes('🚀') || snackbar.message.includes('💪') || snackbar.message.includes('🌟') ? false : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
