import { env } from "@/env";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { authClient } from "@/lib/auth-client";

// Create base axios instance
const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_ENDPOINT_URL || "https://erp.tsicertification.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session?.user && 'access_token' in session.user) {
      config.headers.Authorization = `${session.user.access_token}`;
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        // Proper logout using better-auth
        authClient.signOut().then(() => {
          window.location.href = "/login";
        }).catch(() => {
          // Fallback to direct redirect if signOut fails
          window.location.href = "/login";
        });
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
