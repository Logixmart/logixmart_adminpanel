import axios from 'axios';
import { attachAuthInterceptors } from './authInterceptor';

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

const API_URL = import.meta.env.VITE_API_URL;

const jobApplicationApi = axios.create({
  baseURL: `${API_URL}/api/job-applications`,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(jobApplicationApi);

export async function getJobApplications(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobApplicationStatus | '';
  jobId?: string;
}): Promise<JobApplicationListResponse> {
  const response = await jobApplicationApi.get<JobApplicationListResponse>('/', { params });
  return response.data;
}

export async function getJobApplicationById(id: string): Promise<JobApplication> {
  const response = await jobApplicationApi.get<{ success: boolean; data: JobApplication }>(
    `/${id}`
  );
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

export function resolveResumeUrl(resumeUrl: string | null | undefined): string | null {
  if (!resumeUrl) {
    return null;
  }
  if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
    return resumeUrl;
  }
  const origin = String(API_URL || '').replace(/\/api\/?$/, '');
  return `${origin}${resumeUrl.startsWith('/') ? resumeUrl : `/${resumeUrl}`}`;
}
