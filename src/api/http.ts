import axios, { type AxiosInstance } from 'axios';
import { attachAuthInterceptors } from './authInterceptor';

const API_URL = import.meta.env.VITE_API_URL as string;

export function createApiClient(
  path: string,
  options?: { json?: boolean }
): AxiosInstance {
  const instance = axios.create({
    baseURL: `${API_URL}${path}`,
    ...(options?.json === false
      ? {}
      : { headers: { 'Content-Type': 'application/json' } }),
  });
  attachAuthInterceptors(instance);
  return instance;
}

export function axiosMessage(err: unknown, fallback: string): string {
  const axiosErr = err as {
    response?: { data?: { message?: string } };
  };
  return axiosErr.response?.data?.message || fallback;
}

type ActionLike = { success: boolean; message?: string };

export async function wrapAction<T extends ActionLike>(
  request: () => Promise<{ data: T }>,
  fallback: string,
  networkFallback = fallback
): Promise<T | { success: false; message: string }> {
  try {
    const { data } = await request();
    if (!data.success) {
      return { success: false, message: data.message || fallback };
    }
    return data;
  } catch (err: unknown) {
    return { success: false, message: axiosMessage(err, networkFallback) };
  }
}

export async function wrapGet<T>(
  request: () => Promise<{ data: T }>,
  fallback: string,
  empty: T
): Promise<T> {
  try {
    return (await request()).data;
  } catch (err: unknown) {
    return { ...empty, message: axiosMessage(err, fallback) };
  }
}

export function resolveMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const origin = String(API_URL || '').replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function parseExportBlob(blob: Blob): Promise<Blob> {
  if (blob.type && blob.type.includes('application/json')) {
    const text = await blob.text();
    let message = 'Export failed';
    try {
      message = JSON.parse(text).message || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
  return blob;
}
