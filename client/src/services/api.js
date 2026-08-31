import axios from 'axios';

// Use environment variable if set, otherwise use relative path which is proxied by Vite
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Check backend connectivity
  async checkHealth() {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Get machine configuration (includes checks, tools, workpiece)
  async getMachine() {
    const res = await apiClient.get('/machine');
    return res.data;
  },

  // Get workflow state
  async getWorkflow() {
    const res = await apiClient.get('/workflow');
    return res.data;
  },

  // Machine Checks
  async confirmMachineCheck(id) {
    const res = await apiClient.post(`/checks/${id}/confirm`);
    return res.data;
  },

  // Tools
  async confirmTool(id) {
    const res = await apiClient.post(`/tools/${id}/confirm`);
    return res.data;
  },

  // Workpiece Setup
  async confirmWorkpiece(id) {
    const res = await apiClient.post(`/workpiece/${id}/confirm`);
    return res.data;
  },

  // Stage Advancement
  async advanceStage() {
    const res = await apiClient.post('/workflow/next');
    return res.data;
  },

  // Operation
  async startOperation() {
    const res = await apiClient.post('/operation/start');
    return res.data;
  },

  async stopOperation() {
    const res = await apiClient.post('/operation/stop');
    return res.data;
  },

  // Reset System Scenario
  async resetSystem() {
    const res = await apiClient.post('/workflow/reset');
    return res.data;
  }
};

export default api;
