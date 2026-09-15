import { httpClient } from '../../services/httpClient.js';

export const workspaceService = {
  async uploadVideo({ file, layout_template, custom_vocabulary }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('layout_template', layout_template);
    if (custom_vocabulary && custom_vocabulary.trim()) {
      formData.append('custom_vocabulary', custom_vocabulary.trim());
    }

    return httpClient.upload('/api/v1/workspace/upload', formData, {
      requiresAuth: true,
    });
  },

  async getSessionStatus(sessionId) {
    return httpClient.get(`/api/v1/workspace/session/${sessionId}/status`, {
      requiresAuth: true,
    });
  },

  async getSessionClips(sessionId) {
    return httpClient.get(`/api/v1/workspace/session/${sessionId}/clips`, {
      requiresAuth: true,
    });
  },
};
