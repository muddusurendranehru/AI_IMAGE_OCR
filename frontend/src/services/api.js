// frontend/src/services/api.js
// ✅ Safe, production-ready API client
// ✅ Fixes localhost PDF loading issue (getFileUrl)
// ✅ Won't break your working backend/auth

import axios from 'axios';

// 🔐 Safe API URL configuration
// Uses env var if set, otherwise falls back to production URL
// NEVER uses localhost in production builds
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || "/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// 🔐 Request Interceptor: Add JWT token to protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const publicRoutes = ['/auth/login', '/auth/signup', '/health', '/api/health'];
    const isPublic = publicRoutes.some((route) => config.url?.includes(route));

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 🔐 Response Interceptor: Handle auth errors globally
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Auth error: Token invalid or expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      console.warn('⚠️ Access forbidden: Insufficient permissions');
    }

    if (error.response?.status === 404) {
      console.warn(`⚠️ Endpoint not found: ${error.config?.url}`);
    }

    if (!error.response) {
      console.error('🌐 Network error: Check connection or CORS settings');
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

// =====================================================
// AUTH API (same signatures & return .data for Login/Signup/Dashboard)
// =====================================================

export const authAPI = {
  signup: async (email, password, confirmPassword, fullName) => {
    const response = await api.post('/auth/signup', {
      email,
      password,
      confirmPassword,
      fullName,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// =====================================================
// LAB REPORTS API
// =====================================================

export const reportsAPI = {
  uploadReport: async (formData) => {
    const response = await api.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAllReports: async (page = 1, limit = 20, filters = {}) => {
    const params = { page, limit, ...filters };
    const response = await api.get('/reports', { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  updateReport: async (id, data) => {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  searchReports: async (query) => {
    const response = await api.get('/reports/search', { params: { query } });
    return response.data;
  },

  batchUpload: async (formData) => {
    const response = await api.post('/reports/batch-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 5 * 60 * 1000,
    });
    return response.data;
  },

  finalizeReport: async (id, confirmedData) => {
    const response = await api.post(`/reports/${id}/finalize`, confirmedData);
    return response.data;
  },
};

// =====================================================
// STATUS / HEALTH API
// =====================================================

export const statusAPI = {
  getStatus: async () => {
    const base = getApiBaseUrl().replace('/api', '');
    const response = await axios.get(`${base}/api/status`);
    return response.data;
  },
};

export const healthAPI = {
  checkHealth: () =>
    api.get('/health', { baseURL: getApiBaseUrl().replace('/api', '') }),
  checkApiHealth: () =>
    api.get('/api/health', { baseURL: getApiBaseUrl().replace('/api', '') }),
};

// =====================================================
// HELPERS (fixes localhost PDF loading)
// =====================================================

export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  if (filePath.startsWith('/uploads/') || filePath.includes('uploads/')) {
    const baseUrl = getApiBaseUrl().replace('/api', '');
    return `${baseUrl.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`;
  }
  return filePath;
};

export const downloadFile = async (url, filename) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(url, {
    responseType: 'blob',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  });
  const blob = new Blob([response.data]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'download';
  link.click();
  URL.revokeObjectURL(link.href);
};

export default api;
