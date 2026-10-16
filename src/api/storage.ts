import { createApiClient, wrapAction } from './http';
import type { UploadFolder } from '../config/supabase';

export interface SignedUploadData {
  bucket: string;
  path: string;
  token: string;
}

export interface SignedUploadResponse {
  success: boolean;
  data?: SignedUploadData;
  message?: string;
}

export interface UploadUrlRequest {
  folder: UploadFolder;
  filename: string;
  contentType: string;
  size: number;
}

const storageApi = createApiClient('/api/storage');

/**
 * Request a Supabase signed upload URL from the backend.
 * POST /api/storage/upload-url
 */
export async function getSignedUploadUrl(
  payload: UploadUrlRequest
): Promise<SignedUploadResponse> {
  return wrapAction(
    () => storageApi.post<SignedUploadResponse>('/upload-url', payload),
    'Failed to prepare image upload. Please try again.',
    'Unable to connect to the backend server. Make sure it is running.'
  );
}
