import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
  const hasInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const refreshUser = async () => {
    // Prevent concurrent calls
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
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
      isFetchingRef.current = false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setLoading(false);
    localStorage.removeItem("lastAuthSuccess");
    hasInitializedRef.current = false; // Reset on logout
    window.location.href = "/login?message=session_expired";
  };

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode (development)
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
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

