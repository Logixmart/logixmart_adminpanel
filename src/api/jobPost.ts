import axios from 'axios';
import { attachAuthInterceptors } from './authInterceptor';

export interface JobPost {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  employmentType?: string | null;
  experience?: string | null;
  skills: string[];
  responsibilities: string[];
  qualifications: string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location?: string;
  employmentType?: string;
  experience?: string;
  skills?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  isActive?: boolean;
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

export interface JobListResponse {
  success: boolean;
  data: JobPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const jobPostApi = axios.create({
  baseURL: `${API_URL}/api/job-posts`,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(jobPostApi);

/**
 * Create Job
 */
export async function createJob(payload: CreateJobPayload): Promise<JobPost> {
  const response = await jobPostApi.post<{ success: boolean; data: JobPost }>('/', payload);
  return response.data.data;
}

/**
 * Get Jobs
 */
export async function getJobs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}): Promise<JobListResponse> {
  const response = await jobPostApi.get<JobListResponse>('/', { params });
  return response.data;
}

/**
 * Get Job By ID
 */
export async function getJobById(id: string): Promise<JobPost> {
  const response = await jobPostApi.get<{ success: boolean; data: JobPost }>(`/${id}`);
  return response.data.data;
}

/**
 * Update Job
 */
export async function updateJob(id: string, payload: UpdateJobPayload): Promise<JobPost> {
  const response = await jobPostApi.patch<{ success: boolean; data: JobPost }>(`/${id}`, payload);
  return response.data.data;
}

/**
 * Delete Job
 */
export async function deleteJob(id: string): Promise<void> {
  await jobPostApi.delete(`/${id}`);
}
