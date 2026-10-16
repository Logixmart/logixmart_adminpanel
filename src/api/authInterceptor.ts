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
const REFRESH_BUFFER_MS = 60_000;

type RefreshResponse = {
  success: boolean;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  message?: string;
};

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

function expireSession(): void {
  clearAuthSession();
  onSessionExpired?.();
}

function isAuthEndpoint(config: InternalAxiosRequestConfig): boolean {
  const url = `${config.baseURL || ''}${config.url || ''}`;
  return url.includes('/admin/login') || url.includes('/admin/refresh');
}

function isAccessTokenValid(bufferMs = REFRESH_BUFFER_MS): boolean {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp !== 'number' || exp * 1000 - Date.now() > bufferMs;
  } catch {
    return true;
  }
}

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const { data } = await axios.post<RefreshResponse>(
      `${API_URL}/api/admin/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const accessToken = data.accessToken || data.token;
    if (!data.success || !accessToken) {
      throw new Error(data.message || 'Failed to refresh session');
    }

    setAuthTokens(accessToken, data.refreshToken);
    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function ensureValidSession(): Promise<boolean> {
  if (isAccessTokenValid()) return true;
  if (!getRefreshToken()) return Boolean(getAccessToken());

  try {
    await refreshAccessToken();
    return true;
  } catch {
    return isAccessTokenValid(0);
  }
}

export function attachAuthInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

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
      const request = error.config as RetryableConfig | undefined;
      if (!request || error.response?.status !== 401 || isAuthEndpoint(request)) {
        return Promise.reject(error);
      }

      if (request._retry) {
        expireSession();
        return Promise.reject(error);
      }

      request._retry = true;
      try {
        const token = await refreshAccessToken();
        request.headers.Authorization = `Bearer ${token}`;
        return instance(request);
      } catch (refreshError) {
        expireSession();
        return Promise.reject(refreshError);
      }
    }
  );
}
