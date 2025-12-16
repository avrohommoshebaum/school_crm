import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Box,
  Collapse,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MessageIcon from '@mui/icons-material/Message';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PaymentIcon from '@mui/icons-material/Payment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FlagIcon from '@mui/icons-material/Flag';
import EventIcon from '@mui/icons-material/Event';
import WarningIcon from '@mui/icons-material/Warning';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SecurityIcon from '@mui/icons-material/Security';
import { hasPermission } from "../utils/permissions";



import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

import nachlasLogo from '../assets/nachlasLogo.png';

import api from '../utils/api';



const DRAWER_WIDTH_OPEN = 250;
const DRAWER_WIDTH_CLOSED = 72;

type IconType = OverridableComponent<SvgIconTypeMap<object, 'svg'>> & {
  muiName: string;
};

interface NavChildItem {
  name: string;
  path: string;
  icon: IconType;
  permission?: {
    module: string;
    action: "view";
  };
}

interface NavItem {
  name: string;
  path: string;
  icon: IconType;
    permission?: {
    module: string;
    action: "view";
  };
  children?: NavChildItem[];
}

// Navigation structure
const navigationItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: DashboardIcon },
  {
    name: 'Communication Center',
    path: '/communication',
    icon: MessageIcon,
    children: [
      { name: 'Quick Compose', path: '/communication', icon: EditNoteIcon },
      { name: 'Send Email', path: '/communication/email', icon: EmailIcon },
      { name: 'Send SMS', path: '/communication/sms', icon: SmsIcon },
      { name: 'Send Robocall', path: '/communication/robocall', icon: PhoneIcon },
      { name: 'Manage Groups', path: '/communication/groups', icon: GroupsIcon },
      { name: 'History', path: '/communication/history', icon: HistoryIcon },
    ],
  },
  { name: 'Students', path: '/students', icon: PeopleIcon },
  { name: 'Teachers', path: '/teachers', icon: SchoolIcon },
  {
    name: 'Teacher Center',
    path: '/teacher-center',
    icon: AssignmentIcon,
    children: [
      { name: 'My Classes', path: '/teacher-center/my-classes', icon: ClassIcon },
      { name: 'Attendance', path: '/teacher-center/attendance', icon: CheckCircleIcon },
      { name: 'Report Cards', path: '/teacher-center/report-cards', icon: DescriptionIcon },
    ],
  },
  { name: 'Classes', path: '/classes', icon: ClassIcon },
  { name: 'Applications', path: '/applications', icon: AssignmentTurnedInIcon },
  { name: 'Report Cards', path: '/report-cards', icon: DescriptionIcon },
  {
    name: 'Principal Center',
    path: '/principal',
    permission: { module: "principalCenter", action: "view" },
    icon: AdminPanelSettingsIcon,
    children: [
      { name: 'Overview', path: '/principal', icon: DashboardIcon },
      { name: 'Student Logs', path: '/principal/student-logs', icon: AssignmentIcon },
      { name: 'Flagged Students', path: '/principal/flagged-students', icon: FlagIcon },
      { name: 'Parent Meetings', path: '/principal/parent-meetings', icon: EventIcon },
      { name: 'Behavior Tracking', path: '/principal/behavior-tracking', icon: WarningIcon },
      { name: 'Academic Concerns', path: '/principal/academic-concerns', icon: AssessmentIcon },
    ],
  },
  {
    name: 'Business Office',
    path: '/business-office',
     permission: { module: "businessOfficeCenter", action: "view" },
    icon: AccountBalanceIcon,
    children: [
      { name: 'Overview', path: '/business-office', icon: DashboardIcon },
      { name: 'Tuition Management', path: '/business-office/tuition', icon: PaymentIcon },
      { name: 'Donations', path: '/business-office/donations', icon: FavoriteIcon },
      { name: 'Transportation', path: '/business-office/transportation', icon: DirectionsBusIcon },
      { name: 'Financial Reports', path: '/business-office/reports', icon: AssessmentIcon },
    ],
  },
  {
    name: 'Admin Center',
    path: '/admin',
    icon: SupervisorAccountIcon,
     permission: { module: "users", action: "view" },
    children: [
      { name: 'Overview', path: '/admin', icon: DashboardIcon, permission: { module: "users", action: "view" },},
      { name: 'User Management', path: '/admin/users', icon: PeopleIcon, permission: { module: "users", action: "view" },},
      { name: 'Role Management', path: '/admin/roles', icon: SecurityIcon, permission: { module: "users", action: "view" },},
      { name: 'School Settings', path: '/admin/school-settings', icon: SchoolIcon, permission: { module: "settings", action: "view" },},
      { name: 'School Calendar', path: '/admin/school-calendar', icon: CalendarMonthIcon, permission: { module: "settings", action: "view" },},
      { name: 'Application Settings', path: '/admin/application-settings', icon: AssignmentTurnedInIcon, permission: { module: "settings", action: "view" },},
      { name: 'Academic Year', path: '/admin/academic-year', icon: EventIcon, permission: { module: "settings", action: "view" },},
      { name: 'System Settings', path: '/admin/system-settings', icon: SettingsIcon, permission: { module: "settings", action: "view" },},
    ],
  },
];

export default function LayoutMUI() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [currentUser, setCurrentUser] = useState<null | {
  name: string;
  roles: { displayName: string; name: string }[];
}>(null);

useEffect(() => {
  api.get("/auth/me")
    .then(res => setCurrentUser(res.data.user))
    .catch(() => navigate("/login"));
}, []);

  const canSeeItem = (item: NavItem) => {
  if (!item.permission) return true;

  return hasPermission(
    currentUser,
    item.permission.module,
    item.permission.action
  );
};

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const toggleDrawer = () => {
    setDrawerOpen((prev) => {
      const next = !prev;
      if (!next) {
        // Close all expanded menus when collapsing drawer
        setExpandedMenus({});
      }
      return next;
    });
  };

  const closeDrawer = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleProfileMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

const handleLogout = async () => {
  handleProfileMenuClose();

  try {
    await api.post("/auth/logout");   
  } catch (err) {
    console.error("Logout error:", err);
  }

  navigate("/login");
};

  const isActive = (path: string) => location.pathname === path;

  const isParentActive = (item: NavItem) => {
    if (isActive(item.path)) return true;
    if (!item.children) return false;
    return item.children.some((child) => isActive(child.path));
  };

  const visibleNavItems: NavItem[] = navigationItems
  .map((item) => {
    // No children → simple permission check
    if (!item.children) {
      return canSeeItem(item) ? item : null;
    }

    // Has children → filter children
    const visibleChildren = item.children.filter((child) =>
      canSeeItem(child as NavItem)
    );

    // Keep parent if:
    // - parent itself is allowed
    // - OR at least one child is allowed
    if (canSeeItem(item) || visibleChildren.length > 0) {
      return {
        ...item,
        children: visibleChildren,
      };
    }

    return null;
  })
  .filter(Boolean) as NavItem[];


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'white',
          color: 'black',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
          zIndex: (th) => th.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Menu Toggle */}
          <IconButton
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
            aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>

          {/* Logo and Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            <img
              src={nachlasLogo}
              alt="Nachlas Bais Yaakov"
              style={{
                width: '50px',
                height: '50px',
                marginRight: '12px',
              }}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: '#1976d2', lineHeight: 1.2 }}
              >
                Nachlas Bais Yaakov
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                School Management Portal
              </Typography>
            </Box>
          </Box>

          {/* Right Side Icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ display: { xs: 'none', sm: 'inline-flex' } }} aria-label="Notifications">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen} aria-label="User menu">
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Box>

          {/* Profile Menu */}
          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
           <MenuItem
  onClick={() => {
    handleProfileMenuClose();
    navigate("/profile");
  }}
>
  <AccountCircleIcon sx={{ mr: 1 }} fontSize="small" />
  Profile
</MenuItem>

<MenuItem
  onClick={() => {
    handleProfileMenuClose();
    navigate("/settings");
  }}
>
  <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
  Settings

          </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen || !isMobile}
        onClose={closeDrawer}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH_OPEN : isMobile ? 0 : DRAWER_WIDTH_CLOSED,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile
              ? DRAWER_WIDTH_OPEN
              : drawerOpen
              ? DRAWER_WIDTH_OPEN
              : DRAWER_WIDTH_CLOSED,
            boxSizing: 'border-box',
            borderRight: '1px solid #e0e0e0',
            transition: 'width 0.3s ease',
            marginTop: isMobile ? 0 : '64px',
            height: isMobile ? '100vh' : 'calc(100vh - 64px)',
            overflowX: 'hidden',
          },
        }}
      >
        <List sx={{ pt: isMobile ? 10 : 2 }}>
          {visibleNavItems.map((item) => {
            const parentActive = isParentActive(item);

            if (item.children) {
              const expanded = !!expandedMenus[item.name];
              const showText = drawerOpen || isMobile;

              return (
                <Box key={item.name}>
                  <ListItemButton
                    onClick={() => (isMobile || drawerOpen) && toggleMenu(item.name)}
                    sx={{
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                      minHeight: 48,
                      ...(parentActive && {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.16)' },
                      }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawerOpen ? 40 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <item.icon sx={{ color: parentActive ? '#1976d2' : 'inherit' }} />
                    </ListItemIcon>
                    {showText && (
                      <ListItemText
                        primary={item.name}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                      />
                    )}
                    {drawerOpen && (expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                  </ListItemButton>

                  <Collapse in={expanded && drawerOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => {
                        const activeChild = isActive(child.path);
                        return (
                          <ListItemButton
                            key={child.path}
                            component={RouterLink}
                            to={child.path}
                            selected={activeChild}
                            onClick={closeDrawer}
                            sx={{
                              pl: 4,
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.16)',
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <child.icon
                                sx={{
                                  fontSize: 20,
                                  color: activeChild ? '#1976d2' : 'inherit',
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.name}
                              primaryTypographyProps={{ fontSize: '0.8125rem' }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            const active = isActive(item.path);

            return (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={active}
                onClick={closeDrawer}
                sx={{
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.16)' },
                  },
                  minHeight: 48,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: drawerOpen ? 40 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <item.icon sx={{ color: active ? '#1976d2' : 'inherit' }} />
                </ListItemIcon>
                {(drawerOpen || isMobile) && (
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        {/* User Info at Bottom */}
        {drawerOpen && currentUser && (
  <Box sx={{ mt: "auto", p: 2, borderTop: "1px solid #e0e0e0" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: "#1976d2",
          fontWeight: "bold",
        }}
      >
        {currentUser.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentUser.name}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentUser.roles?.map((r) => r.displayName).join(", ") || "—"}
        </Typography>
      </Box>
    </Box>
  </Box>
)}

      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          marginTop: '64px',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
