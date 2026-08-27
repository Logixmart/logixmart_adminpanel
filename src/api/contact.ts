import axios from 'axios';
import { attachAuthInterceptors } from './authInterceptor';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListResponse {
  success: boolean;
  data: ContactSubmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const contactApi = axios.create({
  baseURL: `${API_URL}/api/contact`,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(contactApi);

export async function getContactSubmissions(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ContactListResponse> {
  const response = await contactApi.get<ContactListResponse>('/', { params });
  return response.data;
}

export async function deleteContactSubmission(id: string): Promise<void> {
  await contactApi.delete(`/${id}`);
}

export async function exportContactSubmissions(params?: {
  search?: string;
}): Promise<Blob> {
  const query: Record<string, string> = {
    _t: String(Date.now()),
  };
  if (params?.search?.trim()) {
    query.search = params.search.trim();
  }

  const response = await contactApi.get('/export', {
    params: query,
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  const blob = response.data as Blob;
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
