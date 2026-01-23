import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

// Global cache for require2FA to prevent duplicate API calls across multiple ProtectedRoute instances
let require2FACache: { value: boolean | null; timestamp: number } = {
  value: null,
  timestamp: 0,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let isFetchingRequire2FA = false;

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
  const hasCheckedRef = useRef(false);

  // Check if 2FA is enforced
  useEffect(() => {
    const check2FAEnforcement = async () => {
      if (!user) {
        setChecking2FA(false);
        return;
      }

      // Prevent duplicate calls in React StrictMode
      if (hasCheckedRef.current) {
        // Use cached value if available
        if (require2FACache.value !== null) {
          setRequire2FA(require2FACache.value);
          setChecking2FA(false);
        }
        return;
      }
      hasCheckedRef.current = true;

      // Check if require2FA was passed from login
      const loginData = localStorage.getItem("loginData");
      if (loginData) {
        try {
          const { require2FA: require2FAFromLogin } = JSON.parse(loginData);
          const value = require2FAFromLogin || false;
          setRequire2FA(value);
          // Cache the value
          require2FACache = { value, timestamp: Date.now() };
          setChecking2FA(false);
          localStorage.removeItem("loginData"); // Clean up
          return;
        } catch {
          // Invalid JSON, fall through to API call
        }
      }

      // Check cache first
      const now = Date.now();
      if (require2FACache.value !== null && (now - require2FACache.timestamp) < CACHE_DURATION) {
        setRequire2FA(require2FACache.value);
        setChecking2FA(false);
        return;
      }

      // Prevent concurrent API calls
      if (isFetchingRequire2FA) {
        // Wait for the ongoing fetch
        const checkInterval = setInterval(() => {
          if (!isFetchingRequire2FA && require2FACache.value !== null) {
            setRequire2FA(require2FACache.value);
            setChecking2FA(false);
            clearInterval(checkInterval);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }

      // Fetch from API
      isFetchingRequire2FA = true;
      try {
        const res = await api.get("/system-settings/require_2fa");
        const enabled = res.data.setting?.value === true || res.data.setting?.value === "true";
        setRequire2FA(enabled);
        // Cache the value
        require2FACache = { value: enabled, timestamp: Date.now() };
      } catch (error) {
        console.error("Error checking 2FA enforcement:", error);
        setRequire2FA(false);
        // Cache false value to prevent repeated failed calls
        require2FACache = { value: false, timestamp: Date.now() };
      } finally {
        setChecking2FA(false);
        isFetchingRequire2FA = false;
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

