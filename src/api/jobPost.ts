import axios from 'axios';

export interface JobPost {
  id: string;
  title: string;
  description: string;
  companyName: string;
  location?: string | null;
  employmentType?: string | null;
  salary?: string | null;
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
  companyName: string;
  location?: string;
  employmentType?: string;
  salary?: string;
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

jobPostApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('logixmart_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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
