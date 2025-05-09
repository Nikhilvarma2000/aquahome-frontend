import api from './api';
import { FranchiseDashboardData, Franchise } from '@/types';

export const franchiseService = {
  async getDashboardData(franchiseId?: string): Promise<FranchiseDashboardData> {
    const url = franchiseId
      ? `/franchise/dashboard?franchiseId=${franchiseId}`
      : `/franchise/dashboard`;
    const res = await api.get(url);
    return res.data;
  },

  async deleteFranchise(id: number): Promise<void> {
    await api.delete(`/franchises/${id}`);
  },

  async toggleFranchiseStatus(id: number, newStatus: boolean): Promise<void> {
    await api.patch(`/franchises/${id}/toggle`, { isActive: newStatus });
  },

  async approveFranchise(id: number): Promise<void> {
    await api.patch(`/franchises/${id}/approve`);
  },

  async rejectFranchise(id: number, reason: string): Promise<void> {
    await api.patch(`/franchises/${id}/reject`, { reason });
  },

  // ✅ PATCH instead of PUT
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
  }
};
