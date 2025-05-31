import api from "./api";
import {
  Location,
  AdminDashboardData,
  Order,
  Product,
  ServiceRequest,
  User,
} from "@/types";

export const adminService = {
  // Existing methods remain unchanged...

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
        recentOrders: orders.slice(0, 3),
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },

  async getAllFranchises() {
    try {
      const response = await api.get("/admin/franchises");
      return response.data;
    } catch (error) {
      console.error("Get all franchises error:", error);
      throw error;
    }
  },

  async createFranchise(data: any) {
    try {
      const response = await api.post("/admin/franchises", data);
      return response.data;
    } catch (error) {
      console.error("Create franchise error:", error);
      throw error;
    }
  },

  async updateFranchise(id: number, data: any) {
    try {
      const response = await api.patch(`/admin/franchises/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update franchise error:", error);
      throw error;
    }
  },

  async toggleFranchiseStatus(id: number, status: boolean) {
    try {
      const response = await api.patch(
        `/admin/franchises/${id}/toggle-status`,
        {
          is_active: status,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Toggle franchise status error:", error);
      throw error;
    }
  },

  async approveFranchise(id: number) {
    try {
      const response = await api.post(`/franchises/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Approve franchise error:", error);
      throw error;
    }
  },

  async deleteFranchise(id: number) {
    try {
      const response = await api.delete(`/admin/franchises/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete franchise error:", error);
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
      console.log("📦 Orders Response from backend: ", response.data);
      return response.data;
    } catch (error) {
      console.error("Get Orders error:", error);
      throw error;
    }
  },

  async updateOrderStatus(
    orderId: number | string,
    status: string
  ): Promise<Order> {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Update order status error:", error);
      throw error;
    }
  },

  async assignOrder(
    orderId: number | string,
    franchiseId: number | string
  ): Promise<Order> {
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

  async getSubscriptionsByCustomer(customerId: string): Promise<any[]> {
    try {
      const response = await api.get(
        `/admin/customers/${customerId}/subscriptions`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subscriptions by customer:", error);
      throw error;
    }
  },

  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await api.get("/services");
      return response.data;
    } catch (error) {
      console.error("Get service requests error:", error);
      throw error;
    }
  },

  async updateServiceRequest(
    id: number,
    service_agent_id: number
  ): Promise<ServiceRequest> {
    try {
      console.log("🚀 Updating service request:", id, service_agent_id);
      const response = await api.patch(`/servicerequests/${id}/assign-agent`, {
        service_agent_id: service_agent_id,
      });
      return response.data;
    } catch (error) {
      console.error("Update service request error:", error);
      throw error;
    }
  },

  async updateServiceRequestStatus(
    id: number,
    status: string
  ): Promise<ServiceRequest> {
    try {
      console.log("🚀 Updating service request status:", id, status);
      const response = await api.put(`/services/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error("Update service request status error:", error);
      throw error;
    }
  },

  async getServiceRequestById(id: number): Promise<ServiceRequest> {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get service request by ID error:", error);
      throw error;
    }
  },

  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Admin get order by ID error:", error);
      throw error;
    }
  },

  async assignOrderToAgent(orderId: number, serviceAgentId: number) {
    try {
      const response = await api.patch(`/orders/${orderId}/assign-agent`, {
        service_agent_id: serviceAgentId,
      });
      return response.data;
    } catch (error) {
      console.error("Error assigning service agent:", error);
      throw error;
    }
  },

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get("/admin/products");
      return response.data;
    } catch (error) {
      console.error("Admin get all products error:", error);
      throw error;
    }
  },

  async addProduct(data: any): Promise<Product> {
    try {
      const response = await api.post("/admin/products", data);
      return response.data;
    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },

  async updateProduct(id: number, data: any): Promise<Product> {
    try {
      const response = await api.put(`/admin/products/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },

  async deleteProduct(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  },

  async toggleProductStatus(id: number, isActive: boolean): Promise<Product> {
    try {
      const response = await api.patch(`/admin/products/${id}/toggle-status`, {
        isActive,
      });
      return response.data;
    } catch (error) {
      console.error("Toggle product status error:", error);
      throw error;
    }
  },

  async getAllLocations(): Promise<Location[]> {
    try {
      const response = await api.get("/admin/locations");
      return response.data;
    } catch (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
  },
};
