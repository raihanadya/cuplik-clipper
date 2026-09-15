import { httpClient } from '../../services/httpClient.js';

export const authService = {
  async register({ email, password }) {
    return httpClient.post(
      '/api/v1/auth/register',
      { email, password },
      { requiresAuth: false }
    );
  },

  async login({ email, password, role = 'user' }) {
    return httpClient.post(
      '/api/v1/auth/login',
      { email, password, role },
      { requiresAuth: false }
    );
  },

  async forgotPassword({ email }) {
    return httpClient.post(
      '/api/v1/auth/forgot-password',
      { email },
      { requiresAuth: false }
    );
  },

  async resetPassword({ token, new_password }) {
    return httpClient.post(
      '/api/v1/auth/reset-password',
      { token, new_password },
      { requiresAuth: false }
    );
  },

  async deleteAccount({ password, permanent = false }) {
    return httpClient.delete(
      '/api/v1/auth/account',
      { password, permanent },
      { requiresAuth: true }
    );
  },
};
