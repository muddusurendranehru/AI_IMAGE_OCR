// API Service for Backend Communication
import axios from 'axios';

// Base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =====================================================
// AUTH API
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
    const response = await api.post('/auth/login', {
      email,
      password,
    });
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
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllReports: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await api.get(`/reports?${params}`);
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
    const response = await api.get(`/reports/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  batchUpload: async (formData) => {
    const response = await api.post('/reports/batch-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  finalizeReport: async (id, confirmedData) => {
    const response = await api.post(`/reports/${id}/finalize`, confirmedData);
    return response.data;
  },
};

// =====================================================
// STATUS API
// =====================================================

export const statusAPI = {
  getStatus: async () => {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/status`);
    return response.data;
  },
};

export default api;

