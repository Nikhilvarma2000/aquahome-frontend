import {
  AdminDashboardData,
Order,
User,
} from "@/types";
import api from "./api";

export const adminService = {

async getDashboardData(): Promise<AdminDashboardData> {
  try {
    const [customers, orders] = await Promise.all([
      this.getAllCustomers(),
      this.getAllOrders(),
    ]);

    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status === "delivered" || order.status === "shipped") {
        return sum + order.totalAmount;
      }
      return sum;
    }, 0);

    return {
      stats: {
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalRevenue,
        activeSubscriptions: 0,
        pendingServiceRequests: 0,
        franchiseApplications: 0,
      },
      recentOrders: orders.slice(0, 3), //
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
},


  async getTotalRevenue(): Promise<number> {
    const totalOrders = await this.getAllOrders();
    return totalOrders.reduce((sum, order) => {
      if (order.status === "delivered" || order.status === "shipped") {
        return sum + order.totalAmount;
      }
      return sum;
    }, 0);
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

  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get("/admin/orders");
    console.log("📦 Orders Response from backend: ", response.data); // 👈 Add this line
      return response.data;
    } catch (error) {
      console.error("Get Orders error:", error);
      throw error;
    }
  },
async updateOrderStatus(orderId: number | string, status: string): Promise<Order> {
  try {
    const response = await api.patch(`/orders/${orderId}`, { status });
    return response.data;
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
},
async assignOrder(orderId: number | string, franchiseId: number | string): Promise<Order> {
  try {
    const response = await api.patch(`/orders/${orderId}/assign`, {
      franchise_id: franchiseId,
    });
    return response.data;
  } catch (error) {
    console.error("Assign order error:", error);
    throw error;
  }
},
};
