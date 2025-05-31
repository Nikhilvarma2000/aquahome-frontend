import api from "./api";
import axios from "./api";

export const agentService = {
  getDashboard: () => axios.get("/agent/dashboard"),
  getTasks: () => axios.get("/agent/tasks"),
  getLogs: () => axios.get("/agent/tasks"), // 🔥 FIXED HERE
  getOrders: () => axios.get("/agent/orders"),
  getTaskById: (id: string) => axios.get(`/agent/tasks/${id}`),
  updateOrderStatus: (id: string, data: any) =>
    axios.put(`/orders/${id}/status`, data),

  updateTaskStatus: (id: string, data: any): Promise<any> => {
    try {
      const response = api.put(`/services/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Update task status error:", error);
      throw error;
    }
  },
};
