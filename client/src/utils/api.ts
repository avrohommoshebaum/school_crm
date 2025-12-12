import axios, { AxiosError } from "axios";

// ------------------------------
// Base URL Resolution
// ------------------------------
let baseURL: string =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8080";

// In production, override using runtime config (injected at deploy time)
if (import.meta.env.PROD && window.__APP_CONFIG__?.SERVER_URL) {
  baseURL = window.__APP_CONFIG__.SERVER_URL;
}

// ------------------------------
// Axios Instance
// ------------------------------
const api = axios.create({
  baseURL,
  withCredentials: true, // IMPORTANT for session auth
});

// ------------------------------
// GLOBAL RESPONSE INTERCEPTOR
// - Automatically logs out on 401 or 403
// ------------------------------
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("[AUTH] Session expired → Logging out");

      // Clear any stored client-side auth data
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      // Redirect to login with message
      window.location.href = "/login?message=session_expired";

      return Promise.reject(error);
    }

    if (status === 403) {
      console.warn("[AUTH] Forbidden. User has no permission → Logging out");

      window.location.href = "/login?message=forbidden";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;

// ------------------------------
// Global Type Declaration
// ------------------------------
declare global {
  interface Window {
    __APP_CONFIG__?: {
      SERVER_URL: string;
    };
  }
}
