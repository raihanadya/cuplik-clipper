import { httpClient } from '../../services/httpClient.js';

export const adminService = {
  async getTelemetry() {
    return httpClient.get('/api/v1/admin/telemetry', { requiresAuth: true });
  },

  async activateUser(userId) {
    return httpClient.patch(
      `/api/v1/auth/admin/users/${userId}/activate`,
      {},
      { requiresAuth: true }
    );
  },

  async deactivateUser(userId) {
    return httpClient.patch(
      `/api/v1/auth/admin/users/${userId}/deactivate`,
      {},
      { requiresAuth: true }
    );
  },
};
