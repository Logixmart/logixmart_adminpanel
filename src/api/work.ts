import {
  createApiClient,
  resolveMediaUrl,
  wrapAction,
  wrapGet,
} from './http';

export interface Work {
  id: string;
  title: string;
  description: string;
  projectUrl?: string | null;
  webAppUrl?: string | null;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkListResponse {
  success: boolean;
  count?: number;
  data?: Work[];
  message?: string;
}

export interface WorkResponse {
  success: boolean;
  data?: Work;
  message?: string;
}

export interface WorkActionResponse {
  success: boolean;
  message?: string;
  data?: Work;
}

export interface WorkImageItem {
  key: string;
  url: string;
  filename?: string;
}

const worksApi = createApiClient('/api/our-works', { json: false });

export function getWorkImageItems(work: Work): WorkImageItem[] {
  return (work.images || [])
    .map((img) => ({
      key: img,
      url: resolveMediaUrl(img),
      filename: img.split('/').pop(),
    }))
    .filter((item) => item.url);
}

function normalizeWork(work: Work & { _id?: string }): Work {
  return {
    ...work,
    id: work.id || work._id || '',
  };
}

export async function getWorks(): Promise<WorkListResponse> {
  const result = await wrapGet(
    () => worksApi.get<WorkListResponse>('/'),
    'Unable to connect to the backend server. Make sure it is running.',
    { success: false, data: [] }
  );

  return {
    ...result,
    data: (result.data || []).map((item) =>
      normalizeWork(item as Work & { _id?: string })
    ),
  };
}

export async function getWorkById(id: string): Promise<WorkResponse> {
  const result = await wrapGet(
    () => worksApi.get<WorkResponse>(`/${id}`),
    'Failed to retrieve work details.',
    { success: false }
  );

  return {
    ...result,
    data: result.data
      ? normalizeWork(result.data as Work & { _id?: string })
      : undefined,
  };
}

export async function createWork(
  formData: FormData
): Promise<WorkActionResponse> {
  return wrapAction(
    () => worksApi.post<WorkActionResponse>('/', formData),
    'Failed to create work item.',
    'Network error occurred while creating work item.'
  );
}

export async function updateWork(
  id: string,
  formData: FormData
): Promise<WorkActionResponse> {
  return wrapAction(
    () => worksApi.put<WorkActionResponse>(`/${id}`, formData),
    'Failed to update work item.',
    'Network error occurred while updating work item.'
  );
}

export async function deleteWork(id: string): Promise<WorkActionResponse> {
  return wrapAction(
    () => worksApi.delete<WorkActionResponse>(`/${id}`),
    'Failed to delete work item.',
    'Network error occurred while deleting work item.'
  );
}
