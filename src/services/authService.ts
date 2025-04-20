import api from "./api";
import { User, LoginParams, RegisterParams, AuthResponse } from "../types";

export const authService = {
  // Login user
  async login(credentials: LoginParams): Promise<AuthResponse> {
    try {
      // console.log('Login credentials:', credentials);
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register a new user
  async register(userData: RegisterParams): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Get current user profile with token
  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await api.get("/profile/v2", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<User>, token: string): Promise<User> {
    try {
      const response = await api.put("/auth/profile", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  // Change user password
  async changePassword(
    currentPassword: string,
    newPassword: string,
    token: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post(
        "/auth/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Request password reset error:", error);
      throw error;
    }
  },

  // Reset password with token
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },
};
