import { useEffect, useState, useRef } from "react";
import api from "../utils/api";

/* -------------------------------------------------
 * PERMISSIONS
 * ------------------------------------------------- */

export interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

/* -------------------------------------------------
 * ROLES
 * ------------------------------------------------- */

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  color: string;

  permissions: {
    students?: PermissionSet;
    classes?: PermissionSet;
    reportCards?: PermissionSet;
    communications?: PermissionSet;
    businessOfficeCenter?: PermissionSet;
    principalCenter?: PermissionSet;
    admissions?: PermissionSet;
    enrollment?: PermissionSet;
    applications?: PermissionSet;
    financial?: PermissionSet;
    users?: PermissionSet;
    settings?: PermissionSet;
    reports?: PermissionSet;
  };
}

/* -------------------------------------------------
 * CURRENT USER
 * ------------------------------------------------- */

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;

  roles: UserRole[];

  /** Per-user permission overrides (e.g. "users.edit": true) */
  permissionsOverride?: Record<string, boolean>;

  employeeId?: string;
  department?: string;
  hireDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bio?: string;
}

/* -------------------------------------------------
 * USER SETTINGS
 * ------------------------------------------------- */

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifyStudentAbsence: boolean;
  notifyNewApplication: boolean;
  notifyParentMessage: boolean;
  notifyReportCardDue: boolean;

  theme: "light" | "dark" | "auto";
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";

  showEmail: boolean;
  showPhone: boolean;
  profileVisibility: "all" | "staff" | "private";
}

/* -------------------------------------------------
 * HOOK
 * ------------------------------------------------- */

const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const load = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const res = await api.get("/profile/me");
      setUser(res.data.user);
      setSettings(res.data.settings);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    load();
  }, []);

  return {
    user,
    settings,
    loading,
    reload: load,
  };
};

export default useCurrentUser;
