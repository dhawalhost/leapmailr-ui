import axios from 'axios';
import { useAuthStore } from '@/lib/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: Enable sending cookies with requests
});

export const getAPIErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.error || fallback : error instanceof Error ? error.message : fallback;

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Request interceptor to add CSRF protection for cookie-backed sessions.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
        const csrfToken = getCookie('csrf_token');
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

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const user = response.data?.data?.user;
          if (user) {
            useAuthStore.getState().setAuth(user);
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          useAuthStore.getState().clearAuth();
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

  refresh: () =>
    api.post('/auth/refresh'),
};

// Template API
export const templateAPI = {
  list: (params?: { project_id?: string; limit?: number; offset?: number; is_active?: boolean }) =>
    api.get('/templates', { params }),
  
  get: (id: string) =>
    api.get(`/templates/${id}`),
  
  create: (data: unknown) =>
    api.post('/templates', data),
  
  update: (id: string, data: unknown) =>
    api.put(`/templates/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/templates/${id}`),
  
  test: (id: string, data: unknown) =>
    api.post(`/templates/${id}/test`, data),
  
  clone: (id: string, name: string) =>
    api.post(`/templates/${id}/clone`, { name }),

  defaults: (category?: string) =>
    api.get('/templates/defaults', { params: category ? { category } : undefined }),

  categories: () =>
    api.get('/templates/categories'),
};

// Email API
export const emailAPI = {
  send: (data: unknown) =>
    api.post('/email/send', data),
  
  sendBulk: (data: unknown) =>
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
    configuration: Record<string, unknown>;
    from_email: string;
    from_name?: string;
    reply_to_email?: string;
    is_default?: boolean;
  }) =>
    api.post('/email-services', data),
  
  update: (id: string, data: {
    name?: string;
    configuration?: Record<string, unknown>;
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

  providers: () =>
    api.get('/email-services/providers'),
};

export const contactsAPI = {
  list: (params?: {
    search?: string;
    source?: string;
    subscribed?: boolean;
    tags?: string;
    limit?: number;
    offset?: number;
  }) => api.get('/contacts', { params }),

  stats: () =>
    api.get('/contacts/stats'),

  create: (data: {
    email: string;
    name?: string;
    phone?: string;
    company?: string;
    source?: string;
    metadata?: Record<string, string>;
    tags?: string[];
  }) => api.post('/contacts', data),

  update: (id: string, data: {
    name?: string;
    phone?: string;
    company?: string;
    metadata?: Record<string, string>;
    tags?: string[];
    is_subscribed?: boolean;
  }) => api.put(`/contacts/${id}`, data),

  delete: (id: string) =>
    api.delete(`/contacts/${id}`),

  import: (data: {
    contacts: Array<{
      email: string;
      name?: string;
      phone?: string;
      company?: string;
      source?: string;
      metadata?: Record<string, string>;
      tags?: string[];
    }>;
    source?: string;
  }) => api.post('/contacts/import', data),

  export: (params?: {
    search?: string;
    source?: string;
    subscribed?: boolean;
    tags?: string;
  }) => api.get('/contacts/export', { params, responseType: 'blob' }),
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