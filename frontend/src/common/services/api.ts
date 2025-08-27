import { AuthUrl } from "@/auth/routes";
import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:4001"}/api`,
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const message = retryAfter
        ? `Too many requests. Please try again in ${retryAfter} seconds.`
        : "Too many requests. Please try again later.";
      toast.error(message);
    }
    // Handle unauthorized - redirect to login only if not already on auth pages
    else if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath.includes('/login') ||
                          currentPath.includes('/signup') ||
                          currentPath.includes('/forgot-password') ||
                          currentPath.includes('/reset-password') ||
                          currentPath.includes('/verify');

      if (!isOnAuthPage) {
        window.location.href = AuthUrl.login;
      }
      // If on auth page, let the component handle the error instead of redirecting
    }
    // Handle other errors
    else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
