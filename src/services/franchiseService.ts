import api from './api';
import { FranchiseDashboardData, Franchise, Location } from '@/types';

export const franchiseService = {
// ✅ FETCH DASHBOARD DATA
async getDashboardData(token: string, franchiseId?: string): Promise<FranchiseDashboardData> {
    const url = franchiseId
      ? `/franchise/dashboard?franchiseId=${franchiseId}`
      : `/franchise/dashboard`;

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  },

  // ✅ FETCH ORDERS
  async getFranchiseOrders(token: string, franchiseId: string): Promise<any[]> {
    try {
      const res = await api.get(`/franchises/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching franchise orders:', error);
      // throw error;
    }
  
  },

  // ✅ ASSIGN SERVICE AGENT
  async assignServiceAgent(orderId: number, serviceAgentId: number, token: string): Promise<void> {
    await api.patch(
      `/franchise/orders/${orderId}/assign-agent`,
      { service_agent_id: serviceAgentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // ✅ GET SERVICE AGENTS
  async getFranchiseAgents(token: string): Promise<any[]> {
    const res = await api.get('/franchises/service-agents', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // ✅ UPDATE ORDER STATUS
  async updateOrderStatus(orderId: number, status: string, token: string): Promise<void> {
    await api.patch(
      `/franchise/orders/${orderId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  // 💼 Admin-only APIs (no token needed unless protected)
  async deleteFranchise(id: number): Promise<void> {
    await api.delete(`/franchises/${id}`);
  },

  async toggleFranchiseStatus(id: number, newStatus: boolean): Promise<void> {
    await api.patch(`/admin/franchises/${id}/toggle-status`, {
      is_active: newStatus,
    });
  },

  async approveFranchise(id: number): Promise<void> {
    await api.post(`/franchises/${id}/approve`);
  },

  async rejectFranchise(id: number, reason: string): Promise<void> {
    await api.patch(`/franchises/${id}/reject`, { reason });
  },

  async updateFranchise(id: number, data: any): Promise<void> {
    return api.patch(`/franchises/${id}`, data);
  },

  async getAllFranchises(): Promise<Franchise[]> {
    const response = await api.get("/admin/franchises");
    return response.data;
  },

  async createFranchise(franchiseData: any): Promise<Franchise> {
    const response = await api.post("/franchises", franchiseData);
    return response.data;
  },

  async getFranchiseLocations(): Promise<Location[]> {
    const response = await api.get("/franchises/locations");
    return response.data;
  },

  async addFranchiseLocation(locationData: {
    name: string;
    zipCodes: string[];
  }): Promise<Location> {
    const response = await api.post("/franchises/locations", locationData);
    return response.data;
  },

  async updateFranchiseLocation(id: string, locationData: any): Promise<Location> {
    const response = await api.put(`/franchises/${id}/locations`, locationData);
    return response.data;
  },

  async deleteFranchiseLocation(id: string): Promise<void> {
    await api.delete(`/franchises/locations/${id}`);
  },
};
