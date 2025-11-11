
// Modification de l'interceptor api.js
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { baseUrl } from "../types";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis les cookies au lieu du localStorage
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token from cookies
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Exemple d'implémentation du refresh
        // const response = await axios.post('/api/v1/auth/refresh', { token: refreshToken });
        // const { access_token } = response.data;

        // Cookies.set('access_token', access_token, {
        //   secure: window.location.protocol === 'https:',
        //   sameSite: 'strict'
        // });
        // return api(originalRequest);

        // Pour l'instant, déconnexion simple
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        sessionStorage.removeItem("user");
        window.location.href = "/login";

        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, logout
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        sessionStorage.removeItem("user");

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Show error message
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

export default api;
