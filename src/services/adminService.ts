import {
  AdminDashboardData,
  Franchise,
  Order,
  ServiceRequest,
  Subscription,
  User,
} from "@/types";
import api from "./api";

export const adminService = {
  async getDashboardData(): Promise<AdminDashboardData> {
    // Simulated API call
    return {
      stats: {
        totalCustomers: (await this.getAllCustomers()).length,
        totalOrders: (await this.getAllOrders()).length,
        totalRevenue: await this.getTotalRevenue(),
        activeSubscriptions: (await this.getAllSubscriptions()).filter(
          (subscription) => subscription.status === "active"
        ).length,
        pendingServiceRequests: (await this.getAllServiceRequests()).filter(
          (request) => request.status === "pending"
        ).length,
        franchiseApplications: (await this.getAllFranchises()).filter(
          (franchise) => franchise.status === "pending"
        ).length,
      },
    };
  },

  async getTotalRevenue(): Promise<number> {
    const totalOrders = await this.getAllOrders();
    let totalRevenue = 0;
    totalOrders.forEach((order) => {
      if (order.status === "delivered" || order.status === "shipped") {
        totalRevenue += order.totalAmount;
      }
    });
    return totalRevenue;
  },

  async getAllFranchises(): Promise<Franchise[]> {
    try {
      const response = await api.get("/franchises");
      return response.data;
    } catch (error) {
      console.error("Get Franchises error:", error);
      throw error;
    }
  },

  async getAllServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await api.get("/services");
      return response.data;
    } catch (error) {
      console.error("Get Service Requests error:", error);
      throw error;
    }
  },

  async getAllCustomers(): Promise<User[]> {
    try {
      const response = await api.get("/admin/users/role/customer/v2");
      return response.data;
    } catch (error) {
      console.error("Get customers error:", error);
      throw error;
    }
  },

  async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await api.get("/admin/subscriptions");
      return response.data;
    } catch (error) {
      console.error("Get subscriptions error:", error);
      throw error;
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get("/admin/orders");
      return response.data;
    } catch (error) {
      console.error("Get Orders error:", error);
      throw error;
    }
  },
};
