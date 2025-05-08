import { getToken, clearAuth } from '@/utils/auth';
import { TaskData, TaskStats } from '@/types/auth';

// Get API URL with validation
function getApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  try {
    new URL(url);
    return url;
  } catch (error) {
    console.error('Invalid API_URL format:', url);
    throw new Error('API configuration error: Invalid API URL format');
  }
}

// Configure fetch timeout
const FETCH_TIMEOUT = 10000; // 10 seconds
const RETRY_DELAY = 1000; // 1 second
const API_URL = getApiUrl();

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

interface ApiError extends Error {
  status?: number;
  response?: {
    data: any;
    status: number;
  };
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

async function fetchWithRetry<T>(url: string, config: RequestInit, retries = 2): Promise<Response> {
  try {
    const response = await fetchWithTimeout(url, config);
    if (!response.ok && retries > 0 && [502, 503, 504].includes(response.status)) {
      console.log(`Retrying request to ${url}. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, config, retries - 1);
    }
    return response;
  } catch (error: any) {
    if (retries > 0 && (error.message === 'Failed to fetch' || error.message === 'Request timed out')) {
      console.log(`Retrying request to ${url}. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, config, retries - 1);
    }
    throw error;
  }
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const publicEndpoints = ['/auth/login', '/auth/register'];
  const token = getToken();
  const isPublicEndpoint = publicEndpoints.includes(endpoint);

  const headers = {
    'Content-Type': 'application/json',
    ...(!isPublicEndpoint && token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Only check for token on protected endpoints
  if (!isPublicEndpoint && !token) {
    console.error('No auth token available for protected endpoint:', endpoint);
    clearAuth();
    window.location.href = '/auth/login';
    throw new Error('Authentication required');
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    mode: 'cors',
    ...(options.body && { body: JSON.stringify(options.body) }),
  };

  try {
    console.log(`Making ${config.method} request to ${endpoint}`, {
      headers: config.headers,
      hasToken: !!token
    });

    const response = await fetchWithRetry(`${API_URL}${endpoint}`, config);
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      responseData = null;
    }

    if (!response.ok) {
      const error: ApiError = new Error(
        responseData?.message || response.statusText || 'API request failed'
      );
      error.status = response.status;
      error.response = responseData ? {
        data: responseData,
        status: response.status
      } : undefined;

      // Log detailed error information
      console.error('API Error:', {
        status: response.status,
        endpoint,
        message: error.message,
        data: responseData,
        headers: response.headers
      });

      // Special handling for connection issues
      if (response.status === 0 || response.status === 504) {
        error.message = 'Unable to connect to server. Please check your connection.';
      }

      throw error;
    }

    return responseData as T;
  } catch (error: any) {
    // Handle network-level errors
    if (error.message === 'Failed to fetch') {
      console.error('Network error:', {
        endpoint,
        error
      });
      const networkError: ApiError = new Error('Unable to connect to server. Please check your connection.');
      networkError.status = 0;
      throw networkError;
    }

    if (error.status === 401) {
      clearAuth();
      window.location.href = '/auth/login';
    }
    throw error;
  }
}

// Task-specific API functions
export const tasksApi = {
  getAll: (filters?: Record<string, any>) => {
    const queryString = filters
      ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
      : '';
    return api<TaskData[]>(`/tasks${queryString}`);
  },
  
  getById: async (id: string) => {
    try {
      return await api<TaskData>(`/tasks/${id}`);
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  },
  
  create: (data: any) => api<TaskData>('/tasks', { method: 'POST', body: data }),
  
  update: async (id: string, data: any) => {
    try {
      const result = await api<TaskData>(`/tasks/${id}`, {
        method: 'PATCH',
        body: data
      });
      return result;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },
  
  delete: (id: string) => api<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
  
  getMyTasks: (type: 'assigned' | 'created') =>
    api<TaskData[]>(`/tasks/my-tasks?type=${type}`),
  
  getStats: () => api<TaskStats>('/tasks/stats'),
  
  getOverdue: () => api<TaskData[]>('/tasks/overdue'),
};

// Auth-specific API functions
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api('/auth/login', { method: 'POST', body: credentials }),
  
  register: (data: { name: string; email: string; password: string }) =>
    api('/auth/register', { method: 'POST', body: data }),
  
  getProfile: () => api('/auth/profile'),
};

// User-specific API functions
export const usersApi = {
  getAll: () => api('/users'),
  
  getProfile: () => api('/users/profile'),
  
  update: (id: string, data: any) => 
    api(`/users/${id}`, { method: 'PATCH', body: data }),
};

// Export types for better type checking
export type TasksApi = typeof tasksApi;
export type AuthApi = typeof authApi;
export type UsersApi = typeof usersApi;