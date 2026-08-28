import { createApiClient, parseExportBlob } from './http';

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

const contactApi = createApiClient('/api/contact');

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

  return parseExportBlob(response.data as Blob);
}
