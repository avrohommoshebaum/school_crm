import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface ModulePermissions {
  [key: string]: Permission;
}

interface ProtectedProps {
  roles?: string[];
  permission?: {
    module: keyof ModulePermissions;
    action: keyof Permission;
  };
}

export default function ProtectedRoute({ roles, permission }: ProtectedProps) {
  const location = useLocation();
  const { user, loading } = useAuth();

  // ⏳ Wait for auth to resolve
  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // ❌ Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login?msg=session_expired"
        replace
        state={{ from: location }}
      />
    );
  }

  // 🔐 Force password change
  if (
    user.mustChangePassword &&
    location.pathname !== "/force-password-change"
  ) {
    return <Navigate to="/force-password-change" replace />;
  }

  // 👑 ADMIN OVERRIDE
  const isAdmin = user.roles?.some((r: any) => r.name === "admin");
  if (isAdmin) {
    return <Outlet />;
  }

  // 🎭 Role check
  if (roles?.length) {
    const roleNames = user.roles.map((r: any) => r.name);
    if (!roles.some((r) => roleNames.includes(r))) {
      return <Navigate to="/login?msg=unauthorized" replace />;
    }
  }

  // 🔑 Permission check
  if (permission) {
    const { module, action } = permission;

    const hasPermission = user.roles.some((role: any) => {
      const perms = role.permissions?.[module];
      return perms?.[action] === true;
    });

    if (!hasPermission) {
      return <Navigate to="/login?msg=unauthorized" replace />;
    }
  }

  return <Outlet />;
}
