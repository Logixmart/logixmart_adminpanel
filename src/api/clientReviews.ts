import { createApiClient, wrapAction, wrapGet } from './http';

export interface ClientReview {
  id: string;
  clientName: string;
  companyName?: string | null;
  email: string;
  designation?: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientReviewsListResponse {
  success: boolean;
  data?: ClientReview[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ClientReviewResponse {
  success: boolean;
  data?: ClientReview;
  message?: string;
}

export interface ClientReviewActionResponse {
  success: boolean;
  message?: string;
  data?: ClientReview;
}

export interface ClientReviewPayload {
  clientName: string;
  email: string;
  message: string;
  companyName?: string;
  designation?: string;
}

const clientReviewsApi = createApiClient('/api/client-reviews');

export async function getClientReviews(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ClientReviewsListResponse> {
  return wrapGet(
    () =>
      clientReviewsApi.get<ClientReviewsListResponse>('/', {
        params,
      }),
    'Unable to connect to the backend server. Make sure it is running.',
    { success: false, data: [] }
  );
}

export async function getClientReviewById(
  id: string
): Promise<ClientReviewResponse> {
  return wrapGet(
    () => clientReviewsApi.get<ClientReviewResponse>(`/${id}`),
    'Failed to retrieve client review details.',
    { success: false }
  );
}

export async function createClientReview(
  payload: ClientReviewPayload
): Promise<ClientReviewActionResponse> {
  return wrapAction(
    () => clientReviewsApi.post<ClientReviewActionResponse>('/', payload),
    'Failed to create client review.',
    'Network error occurred while creating client review.'
  );
}

export async function updateClientReview(
  id: string,
  payload: Partial<ClientReviewPayload>
): Promise<ClientReviewActionResponse> {
  return wrapAction(
    () =>
      clientReviewsApi.patch<ClientReviewActionResponse>(`/${id}`, payload),
    'Failed to update client review.',
    'Network error occurred while updating client review.'
  );
}

export async function deleteClientReview(
  id: string
): Promise<ClientReviewActionResponse> {
  return wrapAction(
    () => clientReviewsApi.delete<ClientReviewActionResponse>(`/${id}`),
    'Failed to delete client review.',
    'Network error occurred while deleting client review.'
  );
}
