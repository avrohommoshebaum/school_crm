import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../utils/api";

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
  const [checking2FA, setChecking2FA] = useState(true);
  const [require2FA, setRequire2FA] = useState(false);

  // Check if 2FA is enforced
  useEffect(() => {
    const check2FAEnforcement = async () => {
      if (!user) {
        setChecking2FA(false);
        return;
      }

      try {
        const res = await api.get("/system-settings/require_2fa");
        const enabled = res.data.setting?.value === true || res.data.setting?.value === "true";
        setRequire2FA(enabled);
      } catch (error) {
        console.error("Error checking 2FA enforcement:", error);
        setRequire2FA(false);
      } finally {
        setChecking2FA(false);
      }
    };

    if (!loading && user) {
      check2FAEnforcement();
    } else if (!loading) {
      setChecking2FA(false);
    }
  }, [user, loading]);

  // ⏳ Wait for auth to resolve
  if (loading || checking2FA) {
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

  // 🔒 2FA Enforcement Check
  // Don't redirect if user is already on enrollment or setup page
  if (
    require2FA &&
    !user.mfaEnabled &&
    location.pathname !== "/2fa/enforce" &&
    location.pathname !== "/2fa/setup" &&
    location.pathname !== "/2fa/verify"
  ) {
    return <Navigate to="/2fa/enforce" replace />;
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
