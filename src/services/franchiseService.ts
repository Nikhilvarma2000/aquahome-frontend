import api from './api';
import { FranchiseDashboardData, Franchise, Location } from '@/types';

export const franchiseService = {
async getDashboardData(franchiseId?: string): Promise<FranchiseDashboardData> {
    const url = franchiseId
      ? `/franchise/dashboard?franchiseId=${franchiseId}`
      : `/franchise/dashboard`;

    console.log('🌐 API CALL to:', url);

    const res = await api.get(url);
    console.log('📦 API Response:', res.data);

    return res.data;
  },

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
    try {
      const response = await api.get("/franchises/locations");
      return response.data;
    } catch (error) {
      console.error("Error fetching franchise locations:", error);
      throw error;
    }
  },
  async addFranchiseLocation(locationData: {
    name: string;
    zipCodes: string[];
  }): Promise<Location> {
    const response = await api.post("/franchises/locations", locationData);
    return response.data;
  },

  async updateFranchiseLocation(id: string, locationData: any): Promise<Location> {
    const response = await api.put(`/franchise/locations/${id}`, locationData);
    return response.data;
  },

  async deleteFranchiseLocation(id: string): Promise<void> {
    await api.delete(`/franchise/locations/${id}`);
  }


};
