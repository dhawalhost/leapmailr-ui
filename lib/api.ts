import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Enable sending cookies with requests
});

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add CSRF token for non-GET requests
      // Try to get from cookie first, then fallback to localStorage
      if (config.method && config.method.toLowerCase() !== 'get') {
        const csrfToken = getCookie('csrf_token') || localStorage.getItem('csrf_token');
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  loginMFA: (data: { email: string; password: string; code: string; backup_code?: boolean }) =>
    api.post('/auth/login-mfa', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/profile'),
};

// Template API
export const templateAPI = {
  list: (params?: { project_id?: string; limit?: number; offset?: number; is_active?: boolean }) =>
    api.get('/templates', { params }),
  
  get: (id: string) =>
    api.get(`/templates/${id}`),
  
  create: (data: any) =>
    api.post('/templates', data),
  
  update: (id: string, data: any) =>
    api.put(`/templates/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/templates/${id}`),
  
  test: (id: string, data: any) =>
    api.post(`/templates/${id}/test`, data),
  
  clone: (id: string, name: string) =>
    api.post(`/templates/${id}/clone`, { name }),
};

// Email API
export const emailAPI = {
  send: (data: any) =>
    api.post('/email/send', data),
  
  sendBulk: (data: any) =>
    api.post('/email/send-bulk', data),
  
  history: (params?: { limit?: number; offset?: number }) =>
    api.get('/emails', { params }),
  
  getStatus: (id: string) =>
    api.get(`/emails/${id}`),
};

// Email Service API
export const emailServiceAPI = {
  list: (params?: { provider?: string; status?: string; limit?: number; offset?: number; project_id?: string }) =>
    api.get('/email-services', { params }),
  
  get: (id: string) =>
    api.get(`/email-services/${id}`),
  
  create: (data: {
    project_id?: string;
    name: string;
    provider: string;
    configuration: Record<string, any>;
    from_email: string;
    from_name?: string;
    reply_to_email?: string;
    is_default?: boolean;
  }) =>
    api.post('/email-services', data),
  
  update: (id: string, data: {
    name?: string;
    configuration?: Record<string, any>;
    from_email?: string;
    from_name?: string;
    reply_to_email?: string;
    is_default?: boolean;
    status?: string;
  }) =>
    api.put(`/email-services/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/email-services/${id}`),
  
  test: (id: string, data: { to_email: string }) =>
    api.post(`/email-services/${id}/test`, data),
  
  setDefault: (id: string) =>
    api.post(`/email-services/${id}/default`),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () =>
    api.get('/analytics/overview'),
  
  getEmailStats: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics/emails', { params }),
  
  // Email tracking analytics
  getEmailAnalytics: (emailId: string) =>
    api.get(`/analytics/email/${emailId}`),
  
  getEmailTrackingEvents: (emailId: string) =>
    api.get(`/analytics/email/${emailId}/events`),
  
  getCampaignAnalytics: (campaignId: string) =>
    api.get(`/analytics/campaign/${campaignId}`),
};

// Project API
export const projectAPI = {
  list: () =>
    api.get('/projects'),
  
  get: (id: string) =>
    api.get(`/projects/${id}`),
  
  getDefault: () =>
    api.get('/projects/default'),
  
  create: (data: {
    name: string;
    description?: string;
    color?: string;
    is_default?: boolean;
  }) =>
    api.post('/projects', data),
  
  update: (id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    is_default?: boolean;
  }) =>
    api.put(`/projects/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/projects/${id}`),
  
  setDefault: (id: string) =>
    api.post(`/projects/${id}/default`),
};

// MFA API
export const mfaAPI = {
  setup: (data: { password: string }) =>
    api.post('/mfa/setup', data),
  
  verifySetup: (data: { code: string }) =>
    api.post('/mfa/verify-setup', data),
  
  disable: (data: { password: string; code: string }) =>
    api.post('/mfa/disable', data),
  
  getStatus: () =>
    api.get('/mfa/status'),
  
  regenerateBackupCodes: (data: { password: string }) =>
    api.post('/mfa/regenerate-backup-codes', data),
};