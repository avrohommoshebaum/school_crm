import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";
import api from "../utils/api";

interface SessionTimeoutContextValue {
  extendSession: () => void;
  sessionExpiresAt: number | null;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextValue>({
  extendSession: () => {},
  sessionExpiresAt: null,
});

export const useSessionTimeout = () => useContext(SessionTimeoutContext);

export const SessionTimeoutProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(60); // 60 seconds to auto-logout
  
  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Get session timeout from server (only once on login)
  useEffect(() => {
    if (!user) {
      // Clear everything on logout
      setSessionTimeout(null);
      setSessionExpiresAt(null);
      setShowWarning(false);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    // Fetch session timeout from server (only if not already set)
    if (!sessionTimeout) {
      api.get("/auth/me")
        .then((res) => {
          if (res.data.sessionTimeout) {
            const timeout = res.data.sessionTimeout;
            setSessionTimeout(timeout);
            // Set expiration time based on current time + timeout
            const expiresAt = Date.now() + timeout;
            setSessionExpiresAt(expiresAt);
            lastActivityRef.current = Date.now();
            scheduleWarning(expiresAt);
          }
        })
        .catch(console.error);
    }
  }, [user, sessionTimeout]);

  // Track user activity
  const handleActivity = useCallback(() => {
    if (!user || !sessionExpiresAt || !sessionTimeout) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only reset if user was active (not just a passive event)
    // Reset expiration time based on last activity
    const newExpiresAt = now + sessionTimeout;
    setSessionExpiresAt(newExpiresAt);
    lastActivityRef.current = now;
    
    // Reschedule warnings
    if (showWarning) {
      // If warning is showing, hide it and reset timers
      setShowWarning(false);
      setWarningCountdown(60);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }
    
    scheduleWarning(newExpiresAt);
  }, [user, sessionExpiresAt, sessionTimeout, showWarning]);

  // Schedule warning 60 seconds before expiration
  const scheduleWarning = useCallback((expiresAt: number) => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    const now = Date.now();
    const timeUntilExpiration = expiresAt - now;
    const warningTime = 60 * 1000; // 60 seconds
    
    if (timeUntilExpiration <= warningTime) {
      // Already past warning time, show immediately
      showWarningModal();
    } else {
      // Schedule warning
      const timeUntilWarning = timeUntilExpiration - warningTime;
      warningTimerRef.current = window.setTimeout(() => {
        showWarningModal();
      }, timeUntilWarning);
    }
  }, []);

  const showWarningModal = () => {
    setShowWarning(true);
    setWarningCountdown(60);
    
    // Start countdown
    countdownIntervalRef.current = window.setInterval(() => {
      setWarningCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Auto-logout after 60 seconds
    logoutTimerRef.current = window.setTimeout(() => {
      handleLogout();
    }, 60000);
  };

  const handleLogout = async () => {
    setShowWarning(false);
    await logout();
  };

  const handleStaySignedIn = async () => {
    setShowWarning(false);
    setWarningCountdown(60);
    
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    // Extend session on SERVER by calling the extend-session endpoint
    // This will touch the session and refresh the cookie
    try {
      const res = await api.post("/auth/extend-session");
      if (res.data.sessionTimeout) {
        const newExpiresAt = res.data.expiresAt || (Date.now() + res.data.sessionTimeout);
        setSessionExpiresAt(newExpiresAt);
        lastActivityRef.current = Date.now();
        scheduleWarning(newExpiresAt);
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
      await logout();
    }
  };

  // Throttle function
  function throttle(func: () => void, limit: number) {
    let inThrottle: boolean;
    return function (this: any) {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Track user activity (mouse, keyboard, touch, scroll)
  useEffect(() => {
    if (!user || !sessionExpiresAt) return;

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    const throttledActivity = throttle(handleActivity, 5000); // Throttle to every 5 seconds

    events.forEach((event) => {
      document.addEventListener(event, throttledActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledActivity);
      });
    };
  }, [user, sessionExpiresAt, handleActivity]);

  // Check session on tab visibility change
  useEffect(() => {
    if (!user || !sessionExpiresAt) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        if (now >= sessionExpiresAt) {
          // Session expired while tab was hidden
          handleLogout();
        } else {
          // Reschedule warnings based on remaining time
          scheduleWarning(sessionExpiresAt);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, sessionExpiresAt, scheduleWarning]);

  return (
    <SessionTimeoutContext.Provider value={{ extendSession: handleStaySignedIn, sessionExpiresAt }}>
      {children}
      
      {/* Warning Modal */}
      <Dialog
        open={showWarning}
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>Session About to Expire</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your session will expire in {warningCountdown} second{warningCountdown !== 1 ? "s" : ""}.
            Would you like to stay signed in?
          </Typography>
          <Box sx={{ width: "100%", mb: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={(60 - warningCountdown) / 60 * 100} 
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            You will be automatically logged out if no action is taken.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="error">
            Log Out
          </Button>
          <Button onClick={handleStaySignedIn} variant="contained" color="primary">
            Stay Signed In
          </Button>
        </DialogActions>
      </Dialog>
    </SessionTimeoutContext.Provider>
  );
};

