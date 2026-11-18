import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";

/**
 * Global Axios Instance for Aurevilux
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor:
 * Automatically attaches the JWT Bearer token from localStorage to every outgoing request.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("aurevilux_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Extracts standardized backend error messages from responses.
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const serverMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred.";
    return Promise.reject(new Error(serverMessage));
  }
);

/**
 * Backward-compatible generic wrapper helper:
 * Allows calling apiClient<T>(endpoint, options) and returns the response body directly.
 */
export interface RequestOptions extends AxiosRequestConfig {
  data?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await api.request<T>({
    url: endpoint,
    ...options,
  });

  return response.data;
}

export default api;
