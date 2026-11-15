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
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    username: string;
    roles: string[];
    avatarUrl?: string;
    authProvider?: "local" | "google";
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
    avatarUrl?: string;
  };
}

export const AuthService = {
  // Login with username & password to Express backend
  login: async (payload: LoginPayload): Promise<AuthResponse["data"]> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);

    if (data?.data?.access_token) {
      localStorage.setItem("aurevilux_token", data.data.access_token);
      localStorage.setItem("aurevilux_refresh_token", data.data.refresh_token);
      localStorage.setItem("aurevilux_user", JSON.stringify(data.data));
      sessionStorage.setItem("aurevilux_user", JSON.stringify(data.data));
    }

    return data.data;
  },

  // Google Direct Authentication with Verified ID Token
  googleAuth: async (payload: {
    credential: string;
  }): Promise<AuthResponse["data"]> => {
    const { data } = await api.post<AuthResponse>("/auth/google", payload);

    if (data?.data?.access_token) {
      localStorage.setItem("aurevilux_token", data.data.access_token);
      localStorage.setItem("aurevilux_refresh_token", data.data.refresh_token);
      localStorage.setItem("aurevilux_user", JSON.stringify(data.data));
      sessionStorage.setItem("aurevilux_user", JSON.stringify(data.data));
    }

    return data.data;
  },

  // Register a new customer
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<{ message: string; data?: any }>("/auth/register", payload);
    return data;
  },

  // Register with Employee Invite Link (no tokens returned — pending approval)
  registerWithInvite: async (payload: {
    token: string;
    name: string;
    username: string;
    password: string;
  }): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/auth/register-invite", payload);
    return data;
  },

  // Verify Invite Token
  verifyInvite: async (token: string) => {
    const { data } = await api.get<{
      message: string;
      data: { email: string; role: string; invitedBy: string };
    }>(`/auth/verify-invite/${token}`);
    return data.data;
  },

  // Forgot password request (sends reset email via Nodemailer SMTP)
  forgotPassword: async (email: string) => {
    const { data } = await api.post<{ message: string }>("/auth/forgot-password", { email });
    return data;
  },

  // Reset password with recovery token
  resetPassword: async (payload: { token: string; email: string; password: string }): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/auth/reset-password", payload);
    return data;
  },

  // Fetch authenticated user profile
  getProfile: async (): Promise<UserDetailsResponse["data"]> => {
    const { data } = await api.get<UserDetailsResponse>("/auth/me");
    return data.data;
  },

  // Logout and clear tokens
  logout: () => {
    localStorage.removeItem("aurevilux_token");
    localStorage.removeItem("aurevilux_refresh_token");
    localStorage.removeItem("aurevilux_user");
    sessionStorage.removeItem("aurevilux_user");
  },

  // Check if token exists
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("aurevilux_token");
  },

  // Get current stored user (checks both localStorage and sessionStorage)
  getStoredUser: () => {
    try {
      const u = localStorage.getItem("aurevilux_user") || sessionStorage.getItem("aurevilux_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  // Update stored user object
  setStoredUser: (user: any) => {
    try {
      if (user) {
        localStorage.setItem("aurevilux_user", JSON.stringify(user));
        sessionStorage.setItem("aurevilux_user", JSON.stringify(user));
      }
    } catch {}
  },
};
