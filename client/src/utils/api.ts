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
  (response) => response,

  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("[AUTH] Session expired → Logging out");

      localStorage.removeItem("user");
      sessionStorage.removeItem("user");

      window.location.href = "/login?message=session_expired";
      return Promise.reject(error);
    }

    if (status === 403) {
      console.warn("[AUTH] Forbidden → Logging out");

      window.location.href = "/login?message=forbidden";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
