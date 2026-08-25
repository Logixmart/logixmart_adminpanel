import axios from 'axios';

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

const API_URL = import.meta.env.VITE_API_URL;

const adminsApi = axios.create({
  baseURL: `${API_URL}/api/admin/users`,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('logixmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
