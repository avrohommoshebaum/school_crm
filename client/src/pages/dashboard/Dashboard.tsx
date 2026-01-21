import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import useCurrentUser from '../../hooks/useCurrentUser';
import { WIDGET_REGISTRY, DEFAULT_DASHBOARDS, getDefaultWidgetsForRole } from './WidgetRegistry';
import WidgetRenderer from './WidgetRenderer';

export default function Dashboard() {
  const { user, loading: userLoading } = useCurrentUser();
  const [widgetIds, setWidgetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    // Determine user's primary role
    const roles = user.roles || [];
    const primaryRole = roles.find(r => r.name === 'admin')?.name ||
                       roles.find(r => r.name === 'principal')?.name ||
                       roles.find(r => r.name === 'business_office')?.name ||
                       roles.find(r => r.name === 'teacher')?.name ||
                       roles.find(r => r.name === 'parent')?.name ||
                       'teacher'; // Default fallback

    // Get user permissions
    const userPermissions: string[] = [];
    roles.forEach(role => {
      Object.entries(role.permissions || {}).forEach(([module, perms]: [string, any]) => {
        if (perms?.view) userPermissions.push(`${module}.view`);
        if (perms?.create) userPermissions.push(`${module}.create`);
        if (perms?.edit) userPermissions.push(`${module}.edit`);
        if (perms?.delete) userPermissions.push(`${module}.delete`);
      });
    });

    // Get default widgets for role
    const defaultWidgets = getDefaultWidgetsForRole(primaryRole, userPermissions);
    setWidgetIds(defaultWidgets);
    setLoading(false);
  }, [user, userLoading]);

  const getWidgetSize = (widgetId: string) => {
    const widget = WIDGET_REGISTRY.find(w => w.id === widgetId);
    return widget?.defaultSize || 'medium';
  };

  const getGridSize = (size: string) => {
    switch (size) {
      case 'small':
        return { xs: 12, sm: 6, md: 3 };
      case 'medium':
        return { xs: 12, sm: 6, md: 6 };
      case 'large':
        return { xs: 12, md: 12 };
      default:
        return { xs: 12, sm: 6, md: 6 };
    }
  };

  if (userLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const userName = user?.name || 'User';
  const primaryRole = user?.roles?.[0]?.displayName || user?.roles?.[0]?.name || 'User';

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Welcome back, {userName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your school today.
        </Typography>
      </Box>

      {/* Widgets Grid */}
      {widgetIds.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No widgets available for your role ({primaryRole})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Contact your administrator to configure your dashboard.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {widgetIds.map((widgetId) => {
            const widget = WIDGET_REGISTRY.find(w => w.id === widgetId);
            if (!widget) return null;

            const size = getWidgetSize(widgetId);
            const gridSize = getGridSize(size);

            return (
              <Grid item {...gridSize} key={widgetId}>
                <WidgetRenderer componentName={widget.component} />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}