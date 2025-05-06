import { env } from "@/env";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

// Create base axios instance
const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_ENDPOINT_URL || "https://erp.tsicertification.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json", // Request JSON if possible
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session?.user?.access_token) {
      config.headers.Authorization = `${session.user.access_token}`;
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to check if a response is HTML/XML
const isHtmlResponse = (data: any): boolean => {
  if (typeof data !== "string") return false;
  const trimmed = data.trim();
  return (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    trimmed.includes("<?xml") ||
    (trimmed.startsWith("<") && trimmed.includes("</"))
  );
};

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    // Check if response is successful but contains HTML instead of JSON
    if (response.data && isHtmlResponse(response.data)) {
      console.warn(
        "========== Received HTML response instead of JSON =========="
      );

      // Create standardized error response
      const error = new Error("Server returned HTML instead of JSON");
      const customError: AxiosError = error as any;
      customError.response = {
        ...response,
        data: {
          success: false,
          error: {
            code: response.status,
            message: "Server returned invalid format. Please try again later.",
          },
        },
      };

      return Promise.reject(customError);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    console.log("========== ERROR Exeption ==========");

    // Handle 401 unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Handle HTML responses in error cases (especially 500 errors)
    if (error.response?.data && isHtmlResponse(error.response.data as any)) {
      console.error("========== Received HTML error response ==========");

      // Try to extract a meaningful error message if possible
      let errorMessage = "Server error occurred";
      const htmlData = error.response.data as string;

      // You could try to extract specific error information
      // For example, looking for a title or specific error pattern
      if (htmlData.includes("<title>")) {
        const titleMatch = /<title>(.*?)<\/title>/i.exec(htmlData);
        if (titleMatch && titleMatch[1]) {
          errorMessage = titleMatch[1].trim();
        }
      }

      // Replace the HTML data with a structured error object
      error.response.data = {
        success: false,
        error: {
          code: error.response.status,
          message: errorMessage,
          originalError: "HTML response received",
        },
      };
    }

    return Promise.reject(error);
  }
);

export default apiClient;
