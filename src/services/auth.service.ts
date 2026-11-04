import { apiClient } from "./api";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data: {
    username: string;
    roles: string[];
    access_token: string;
    refresh_token: string;
  };
}

export interface UserDetailsResponse {
  message: string;
  data: {
    id: string;
    name: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export const AuthService = {
  // Login with username & password to Node.js/Express backend
  login: async (payload: LoginPayload): Promise<AuthResponse["data"]> => {
    const response = await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      data: payload,
    });

    if (response.data && response.data.access_token) {
      localStorage.setItem("aurevilux_token", response.data.access_token);
      localStorage.setItem("aurevilux_refresh_token", response.data.refresh_token);
      localStorage.setItem("aurevilux_user", JSON.stringify(response.data));
    }

    return response.data;
  },

  // Register a new customer
  register: async (payload: RegisterPayload) => {
    return apiClient<{ message: string }>("/auth/register", {
      method: "POST",
      data: payload,
    });
  },

  // Fetch authenticated user details
  getProfile: async (): Promise<UserDetailsResponse["data"]> => {
    const response = await apiClient<UserDetailsResponse>("/auth/me", {
      method: "GET",
    });
    return response.data;
  },

  // Logout and clear tokens
  logout: () => {
    localStorage.removeItem("aurevilux_token");
    localStorage.removeItem("aurevilux_refresh_token");
    localStorage.removeItem("aurevilux_user");
  },

  // Check if token exists
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("aurevilux_token");
  },

  // Get current stored user
  getStoredUser: () => {
    try {
      const u = localStorage.getItem("aurevilux_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
};
