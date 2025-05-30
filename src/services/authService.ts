import api from "./api";
import { User, LoginParams, RegisterParams, AuthResponse } from "../types";
import AsyncStorage from '@react-native-async-storage/async-storage';


export const authService = {
// 🔥 Corrected Login user
async login(credentials: LoginParams): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login/v2", credentials);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // 🔥 Corrected Register user
  async register(userData: RegisterParams): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/register/v2", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Get current user profile
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

  async changePassword(currentPassword: string, newPassword: string, token: string): Promise<{ message: string }> {
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

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("Request password reset error:", error);
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
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
updateLocation: async (latitude: number, longitude: number): Promise<any> => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.post(
        "/profile/location",
        { latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update location error:", error);
      throw error;
    }
  },
};
