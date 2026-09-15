import { authSession } from '../features/auth/authSession.js';

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function buildUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = true,
    isFormData = false,
  } = options;

  const finalHeaders = { ...headers };

  if (!isFormData && body && typeof body === 'object' && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const token = authSession.getToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    method,
    headers: finalHeaders,
  };

  if (body) {
    if (isFormData) {
      fetchOptions.body = body;
    } else if (typeof body === 'object') {
      fetchOptions.body = JSON.stringify(body);
    } else {
      fetchOptions.body = body;
    }
  }

  let response;
  try {
    response = await fetch(buildUrl(path), fetchOptions);
  } catch (networkError) {
    throw new ApiError(0, 'Tidak dapat terhubung ke server Cuplik. Periksa koneksi internet Anda atau pastikan server aktif.');
  }

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    let errorMsg = 'Sesi Anda telah kedaluwarsa atau kredensial salah.';
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) errorMsg = errJson.error;
      else if (errJson && errJson.message) errorMsg = errJson.message;
    } catch {
      // ignore
    }
    // Notify session invalidation only if this was an authenticated route
    if (requiresAuth) {
      authSession.notifyInvalidated(errorMsg);
    }
    throw new ApiError(401, errorMsg);
  }

  // Parse response
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.error || data.message)) ||
      `Permintaan gagal dengan status ${response.status} (${response.statusText})`;
    throw new ApiError(response.status, errorMessage, data);
  }

  return data;
}

// Specialized binary download method
async function downloadBlob(path, options = {}) {
  const { requiresAuth = true } = options;
  const headers = {};

  if (requiresAuth) {
    const token = authSession.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(buildUrl(path), {
      method: 'GET',
      headers,
    });
  } catch {
    throw new ApiError(0, 'Gagal mengunduh file karena kendala jaringan.');
  }

  if (response.status === 404) {
    throw new ApiError(404, 'File video tidak ditemukan atau telah kedaluwarsa setelah 24 jam kebijakan retensi.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, 'Gagal mengunduh file.');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  let filename = 'cuplik_download';
  const match = disposition.match(/filename=["']?([^"']+)["']?/);
  if (match && match[1]) {
    filename = match[1];
  }

  return { blob, filename };
}

export const httpClient = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, body, options = {}) => request(path, { ...options, method: 'DELETE', body }),
  upload: (path, formData, options = {}) =>
    request(path, { ...options, method: 'POST', body: formData, isFormData: true }),
  downloadBlob,
};
