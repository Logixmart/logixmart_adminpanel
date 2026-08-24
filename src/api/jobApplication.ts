import axios from 'axios';

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
  companyName: string;
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

jobApplicationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('logixmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
