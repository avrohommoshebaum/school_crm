import { useEffect, useState } from "react";
import api from "../utils/api";

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  color: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: UserRole[];
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

const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/profile/me");
      setUser(res.data.user);
      setSettings(res.data.settings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { user, settings, loading, reload: load };
}

export default useCurrentUser;