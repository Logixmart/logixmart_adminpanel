import { createApiClient } from './http';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface ManagedAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListResponse {
  success: boolean;
  count: number;
  data: ManagedAdmin[];
  message?: string;
}

export interface AdminMutationResponse {
  success: boolean;
  message?: string;
  data?: ManagedAdmin;
}

const adminsApi = createApiClient('/api/admin/users');

export async function listAdmins(): Promise<ManagedAdmin[]> {
  const response = await adminsApi.get<AdminListResponse>('/');
  return response.data.data || [];
}

export async function createAdmin(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<ManagedAdmin> {
  const response = await adminsApi.post<AdminMutationResponse>('/', payload);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to create admin');
  }
  return response.data.data;
}

export async function updateAdmin(
  id: string,
  payload: {
    name: string;
    email: string;
    password?: string;
  }
): Promise<ManagedAdmin> {
  const response = await adminsApi.put<AdminMutationResponse>(`/${id}`, payload);
  if (!response.data.data) {
    throw new Error(response.data.message || 'Failed to update admin');
  }
  return response.data.data;
}

export async function deleteAdmin(id: string): Promise<void> {
  await adminsApi.delete(`/${id}`);
}
