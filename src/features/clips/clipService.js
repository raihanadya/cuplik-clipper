import { httpClient } from '../../services/httpClient.js';

export const clipService = {
  async rerenderClip(clipId, payload) {
    const {
      start_time_seconds,
      end_time_seconds,
      modified_title,
      modified_subtitles,
    } = payload;

    return httpClient.post(
      `/api/v1/clips/${clipId}/rerender`,
      {
        start_time_seconds: Number(start_time_seconds),
        end_time_seconds: Number(end_time_seconds),
        modified_title,
        modified_subtitles,
      },
      { requiresAuth: true }
    );
  },

  async downloadMp4(clipId, fallbackTitle = 'clip') {
    const { blob, filename } = await httpClient.downloadBlob(
      `/api/v1/clips/${clipId}/download/mp4`,
      { requiresAuth: true }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `cuplik_${fallbackTitle}_${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async downloadSrt(clipId, fallbackTitle = 'clip') {
    const { blob, filename } = await httpClient.downloadBlob(
      `/api/v1/clips/${clipId}/download/srt`,
      { requiresAuth: true }
    );

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `cuplik_${fallbackTitle}_${Date.now()}.srt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
