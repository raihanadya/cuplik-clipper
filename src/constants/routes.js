export const ROUTES = {
  HOME: '/',
  REGISTER: '/register',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  PROCESSING: '/session/:sessionId',
  CLIPS: '/session/:sessionId/clips',
  CLIP_EDIT: '/session/:sessionId/clips/:clipId/edit',
  ACCOUNT: '/account',
  ADMIN: '/admin',
};

export const getProcessingRoute = (sessionId) => `/session/${sessionId}`;
export const getClipsRoute = (sessionId) => `/session/${sessionId}/clips`;
export const getClipEditRoute = (sessionId, clipId) => `/session/${sessionId}/clips/${clipId}/edit`;
