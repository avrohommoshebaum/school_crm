// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { Box, CircularProgress } from "@mui/material";

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
    module: keyof ModulePermissions; // "users"
    action: keyof Permission;        // "view" | "create" | "edit" | "delete"
  };
}


export default function ProtectedRoute({
  roles,
  permission,
}: ProtectedProps) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (mounted) setAuthUser(res.data.user);
      })
      .catch(() => {
        if (mounted) setAuthUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // ❌ Not logged in → redirect to login
  if (!authUser) {
    return (
      <Navigate
        to={`/login?msg=session_expired`}
        replace
        state={{ from: location }}
      />
    );
  }


  //force password change
  if (
  authUser.mustChangePassword &&
  location.pathname !== "/force-password-change"
) {
  return (
    <Navigate
      to="/force-password-change"
      replace
      state={{ from: location }}
    />
  );
}

  // ----------------------------------------
  // ✅ ROLE NAME CHECK
  // ----------------------------------------
  if (roles?.length) {
    const roleNames = authUser.roles.map((r: any) => r.name);
    const hasRole = roles.some((role) => roleNames.includes(role));

    if (!hasRole) {
      return (
        <Navigate
          to="/login?msg=unauthorized"
          replace
          state={{ from: location }}
        />
      );
    }
  }

  // ----------------------------------------
  // ✅ PERMISSION CHECK
  // ----------------------------------------
  if (permission) {
    const { module, action } = permission;

    // user may have multiple roles; allow if ANY role grants permission
    const hasPermission = authUser.roles.some((role: any) => {
      const perms = role.permissions?.[module];
      return perms && perms[action] === true;
    });

    if (!hasPermission) {
      return (
        <Navigate
          to="/login?msg=unauthorized"
          replace
          state={{ from: location }}
        />
      );
    }
  }

  // ----------------------------------------
  // ✅ Allowed
  // ----------------------------------------
  return <Outlet />;
}
