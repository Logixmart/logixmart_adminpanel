import axios from 'axios';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export interface AdminUser {
  id?: string;
  email: string;
  name?: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  admin?: AdminUser;
}

export interface LoginSession {
  email: string;
  password: string;
  name?: string;
  role?: string;
  id?: string;
}

export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() || 'Admin';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export interface HealthResponse {
  success: boolean;
  status: string;
  timestamp?: string;
}

/**
 * Perform login request to the Logixmart backend.
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await adminApi.post<LoginResponse>('/login', {
      email,
      password,
    });

    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Authentication failed',
      };
    }

    return {
      success: true,
      token: data.accessToken || data.token,
      accessToken: data.accessToken || data.token,
      refreshToken: data.refreshToken,
      admin: data.admin,
      message: data.message,
    };
  } catch {
    return {
      success: false,
      message:
        'Unable to connect to the backend server. Make sure it is running.',
    };
  }
}

/**
 * Exchange refresh token for a new access + refresh token pair.
 * POST /api/admin/refresh
 */
export async function refreshAdminSession(): Promise<LoginResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return {
      success: false,
      message: 'No refresh token available',
    };
  }

  try {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/api/admin/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data;
    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Failed to refresh session',
      };
    }

    const accessToken = data.accessToken || data.token;
    if (accessToken) {
      setAuthTokens(accessToken, data.refreshToken);
    }

    return {
      success: true,
      token: accessToken,
      accessToken,
      refreshToken: data.refreshToken,
      admin: data.admin,
      message: data.message,
    };
  } catch {
    return {
      success: false,
      message: 'Unable to refresh session. Please log in again.',
    };
  }
}

/**
 * Query backend health status to verify if the server is UP.
 * Hits /api/health (not under /admin).
 */
export async function checkServerHealth(): Promise<HealthResponse> {
  try {
    const response = await axios.get<HealthResponse>(`${API_URL}/api/health`, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = response.data;

    if (!data.success) {
      return { success: false, status: 'DOWN' };
    }

    return {
      success: true,
      status: data.status || 'UP',
      timestamp: data.timestamp,
    };
  } catch {
    return {
      success: false,
      status: 'DOWN',
    };
  }
}

/**
 * Perform logout request to the Logixmart backend.
 */
export async function logoutAdmin(): Promise<LoginResponse> {
  try {
    const refreshToken = getRefreshToken();
    const response = await adminApi.post<LoginResponse>('/logout', {
      refreshToken: refreshToken || undefined,
    });
    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Logout failed',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch {
    return {
      success: false,
      message: 'Unable to connect to the backend server.',
    };
  } finally {
    clearAuthSession();
  }
}
