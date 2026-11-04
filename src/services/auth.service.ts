import { api } from "./api";

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
  // Login with username & password to Node.js/Express backend via Axios
  login: async (payload: LoginPayload): Promise<AuthResponse["data"]> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);

    if (data?.data?.access_token) {
      localStorage.setItem("aurevilux_token", data.data.access_token);
      localStorage.setItem("aurevilux_refresh_token", data.data.refresh_token);
      localStorage.setItem("aurevilux_user", JSON.stringify(data.data));
    }

    return data.data;
  },

  // Register a new customer via Axios
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<{ message: string }>("/auth/register", payload);
    return data;
  },

  // Fetch authenticated user details via Axios
  getProfile: async (): Promise<UserDetailsResponse["data"]> => {
    const { data } = await api.get<UserDetailsResponse>("/auth/me");
    return data.data;
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
