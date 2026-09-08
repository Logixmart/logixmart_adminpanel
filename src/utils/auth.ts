export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export const ADMIN_ROLE_STORAGE_KEY = 'logixmart_admin_role';
export const ADMIN_NAME_STORAGE_KEY = 'logixmart_admin_name';
export const ACCESS_TOKEN_KEY = 'logixmart_token';
export const REFRESH_TOKEN_KEY = 'logixmart_refresh_token';

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === 'SUPER_ADMIN';
}

export function roleLabel(role: string | null | undefined): string {
  if (role === 'SUPER_ADMIN') {
    return 'Super Admin';
  }
  if (role === 'ADMIN') {
    return 'Admin';
  }
  return role || 'Admin';
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(
  accessToken: string,
  refreshToken?: string | null
): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('logixmart_admin_email');
  localStorage.removeItem('logixmart_admin_last_login');
  localStorage.removeItem(ADMIN_ROLE_STORAGE_KEY);
  localStorage.removeItem(ADMIN_NAME_STORAGE_KEY);
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
