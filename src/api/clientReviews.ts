import axios from 'axios';
import { getAccessToken } from '../utils/auth';

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

const API_URL = import.meta.env.VITE_API_URL;

const clientReviewsApi = axios.create({
  baseURL: `${API_URL}/api/client-reviews`,
  headers: {
    'Content-Type': 'application/json',
  },
});

clientReviewsApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getClientReviews(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ClientReviewsListResponse> {
  try {
    const response = await clientReviewsApi.get<ClientReviewsListResponse>('/', {
      params,
    });
    return response.data;
  } catch {
    return {
      success: false,
      message:
        'Unable to connect to the backend server. Make sure it is running.',
      data: [],
    };
  }
}

export async function getClientReviewById(
  id: string
): Promise<ClientReviewResponse> {
  try {
    const response = await clientReviewsApi.get<ClientReviewResponse>(`/${id}`);
    return response.data;
  } catch {
    return {
      success: false,
      message: 'Failed to retrieve client review details.',
    };
  }
}

export async function createClientReview(
  payload: ClientReviewPayload
): Promise<ClientReviewActionResponse> {
  try {
    const response = await clientReviewsApi.post<ClientReviewActionResponse>(
      '/',
      payload
    );
    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Failed to create client review.',
      };
    }

    return data;
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { data?: { message?: string } };
    };
    return {
      success: false,
      message:
        axiosErr.response?.data?.message ||
        'Network error occurred while creating client review.',
    };
  }
}

export async function updateClientReview(
  id: string,
  payload: Partial<ClientReviewPayload>
): Promise<ClientReviewActionResponse> {
  try {
    const response = await clientReviewsApi.patch<ClientReviewActionResponse>(
      `/${id}`,
      payload
    );
    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Failed to update client review.',
      };
    }

    return data;
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { data?: { message?: string } };
    };
    return {
      success: false,
      message:
        axiosErr.response?.data?.message ||
        'Network error occurred while updating client review.',
    };
  }
}

export async function deleteClientReview(
  id: string
): Promise<ClientReviewActionResponse> {
  try {
    const response =
      await clientReviewsApi.delete<ClientReviewActionResponse>(`/${id}`);
    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Failed to delete client review.',
      };
    }

    return data;
  } catch (err: unknown) {
    const axiosErr = err as {
      response?: { data?: { message?: string } };
    };
    return {
      success: false,
      message:
        axiosErr.response?.data?.message ||
        'Network error occurred while deleting client review.',
    };
  }
}
