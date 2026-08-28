import { createApiClient, parseExportBlob, resolveMediaUrl } from './http';

export type JobApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

export interface JobApplicationJob {
  id: string;
  title: string;
  location?: string | null;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantName: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  coverLetter?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  status: JobApplicationStatus;
  createdAt: string;
  updatedAt: string;
  job?: JobApplicationJob;
}

export interface JobApplicationListResponse {
  success: boolean;
  data: JobApplication[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

const jobApplicationApi = createApiClient('/api/job-applications');

export async function getJobApplications(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobApplicationStatus | '';
  jobId?: string;
}): Promise<JobApplicationListResponse> {
  const response = await jobApplicationApi.get<JobApplicationListResponse>(
    '/',
    { params }
  );
  return response.data;
}

export async function getJobApplicationById(
  id: string
): Promise<JobApplication> {
  const response = await jobApplicationApi.get<{
    success: boolean;
    data: JobApplication;
  }>(`/${id}`);
  return response.data.data;
}

export async function updateJobApplicationStatus(
  id: string,
  status: JobApplicationStatus
): Promise<JobApplication> {
  const response = await jobApplicationApi.patch<{
    success: boolean;
    data: JobApplication;
  }>(`/${id}/status`, { status });
  return response.data.data;
}

export async function deleteJobApplication(id: string): Promise<void> {
  await jobApplicationApi.delete(`/${id}`);
}

export async function exportJobApplications(params?: {
  search?: string;
  status?: JobApplicationStatus | '';
  jobId?: string;
}): Promise<Blob> {
  const query: Record<string, string> = {
    _t: String(Date.now()),
  };
  if (params?.search?.trim()) {
    query.search = params.search.trim();
  }
  if (params?.status) {
    query.status = params.status;
  }
  if (params?.jobId?.trim()) {
    query.jobId = params.jobId.trim();
  }

  const response = await jobApplicationApi.get('/export', {
    params: query,
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  return parseExportBlob(response.data as Blob);
}

function filenameFromDisposition(header?: string): string | null {
  if (!header) return null;
  const match = header.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1].replace(/"/g, '').trim());
  } catch {
    return match[1].replace(/"/g, '').trim();
  }
}

export async function downloadJobApplicationResume(
  id: string
): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await jobApplicationApi.get(`/${id}/resume`, {
      responseType: 'blob',
    });
    const blob = await parseExportBlob(response.data as Blob);
    const filename =
      filenameFromDisposition(
        response.headers['content-disposition'] as string | undefined
      ) || 'resume';
    return { blob, filename };
  } catch (err: unknown) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data instanceof Blob) {
      try {
        const parsed = JSON.parse(await data.text()) as { message?: string };
        throw new Error(parsed.message || 'Failed to download resume.');
      } catch (inner) {
        if (!(inner instanceof SyntaxError)) {
          throw inner;
        }
      }
    }
    throw err;
  }
}

export function resolveResumeUrl(
  resumeUrl: string | null | undefined
): string | null {
  return resolveMediaUrl(resumeUrl) || null;
}
