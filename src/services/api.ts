import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your backend API URL
const API_URL = "http://192.168.25.58:5000/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await AsyncStorage.removeItem("token");
      // Here you could trigger a logout or token refresh if needed
    }

    return Promise.reject(error);
  }
);

export default api;
