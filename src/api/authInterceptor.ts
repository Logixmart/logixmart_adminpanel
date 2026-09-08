import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL;

type RefreshResponse = {
  success: boolean;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  message?: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

function isAuthEndpoint(config: InternalAxiosRequestConfig): boolean {
  const requestUrl = `${config.baseURL || ''}${config.url || ''}`;
  return (
    requestUrl.includes('/admin/login') ||
    requestUrl.includes('/admin/refresh')
  );
}

function processQueue(error: unknown | null, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error || new Error('Session expired'));
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
}

function handleSessionExpired(): void {
  clearAuthSession();
  onSessionExpired?.();
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post<RefreshResponse>(
    `${API_URL}/api/admin/refresh`,
    { refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const data = response.data;
  if (!data.success) {
    throw new Error(data.message || 'Failed to refresh session');
  }

  const accessToken = data.accessToken || data.token;
  if (!accessToken) {
    throw new Error('No access token returned from refresh');
  }

  setAuthTokens(accessToken, data.refreshToken);
  return accessToken;
}

export async function ensureValidSession(): Promise<boolean> {
  if (!getRefreshToken()) {
    return Boolean(getAccessToken());
  }

  try {
    await refreshAccessToken();
    return true;
  } catch {
    return false;
  }
}

export function attachAuthInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (!originalRequest || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      if (isAuthEndpoint(originalRequest)) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        handleSessionExpired();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}
