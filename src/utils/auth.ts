export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export const ADMIN_ROLE_STORAGE_KEY = 'logixmart_admin_role';
export const ADMIN_NAME_STORAGE_KEY = 'logixmart_admin_name';

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
