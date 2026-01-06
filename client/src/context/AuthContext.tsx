import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { SessionTimeoutProvider } from "./SessionTimeoutContext";

export interface AuthUser {
  mustChangePassword: boolean;
  id: string;
  email: string;
  name: string;
  roles: any[]; // or define a proper Role type
}


interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      // Store successful auth timestamp for session timeout tracking
      localStorage.setItem("lastAuthSuccess", Date.now().toString());
    } catch {
      setUser(null);
      localStorage.removeItem("lastAuthSuccess");
    } finally {
      setLoading(false); // ✅ ALWAYS stop loading
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setLoading(false);
    localStorage.removeItem("lastAuthSuccess");
    window.location.href = "/login?message=session_expired";
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      <SessionTimeoutProvider>
        {children}
      </SessionTimeoutProvider>
    </AuthContext.Provider>
  );
};

