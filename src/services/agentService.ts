import axios from './api';

export const agentService = {
getDashboard: () => axios.get('/agent/dashboard'),
  getTasks: () => axios.get('/agent/tasks'),
  getLogs: () => axios.get('/agent/logs'),
  getTaskById: (id: string) => axios.get(`/agent/tasks/${id}`),
  updateTaskStatus: (id: string, data: any) => axios.patch(`/agent/tasks/${id}`, data),
};
