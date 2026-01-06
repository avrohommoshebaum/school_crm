import axios, { AxiosError } from "axios";

const baseURL =
  import.meta.env.DEV
    ? "http://localhost:8080/api"
    : "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ------------------------------
// GLOBAL RESPONSE INTERCEPTOR
// ------------------------------
api.interceptors.response.use(
  (response) => {
    // Track successful authenticated requests
    // This helps detect session expiration without extra API calls
    if (response.config.url?.includes("/auth/me") || 
        response.config.url?.includes("/profile/") ||
        response.config.url?.includes("/robocall/") ||
        response.config.url?.includes("/sms/") ||
        response.config.url?.includes("/email/")) {
      localStorage.setItem("lastAuthSuccess", Date.now().toString());
    }
    return response;
  },

  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("[AUTH] Session expired → Logging out");

      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      localStorage.removeItem("lastAuthSuccess");

      window.location.href = "/login?message=session_expired";
      return Promise.reject(error);
    }

    if (status === 403) {
      console.warn("[AUTH] Forbidden → Logging out");

      localStorage.removeItem("lastAuthSuccess");
      window.location.href = "/login?message=forbidden";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
