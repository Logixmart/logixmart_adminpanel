import { createApiClient, wrapAction, wrapGet } from './http';

export interface Blog {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  success: boolean;
  count?: number;
  data?: Blog[];
  message?: string;
}

export interface SingleBlogResponse {
  success: boolean;
  data?: Blog;
  message?: string;
}

export interface ActionResponse {
  success: boolean;
  message?: string;
  data?: Blog;
}

const blogsApi = createApiClient('/api/blogs', { json: false });

export async function getAllBlogs(): Promise<BlogsResponse> {
  return wrapGet(
    () => blogsApi.get<BlogsResponse>('/'),
    'Unable to connect to the backend server. Make sure it is running.',
    { success: false, data: [] }
  );
}

export async function getBlogById(id: string): Promise<SingleBlogResponse> {
  return wrapGet(
    () => blogsApi.get<SingleBlogResponse>(`/${id}`),
    'Failed to retrieve blog details.',
    { success: false }
  );
}

export async function createBlog(formData: FormData): Promise<ActionResponse> {
  return wrapAction(
    () => blogsApi.post<ActionResponse>('/', formData),
    'Failed to create blog post.',
    'Network error occurred while creating blog post.'
  );
}

export async function updateBlog(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  return wrapAction(
    () => blogsApi.put<ActionResponse>(`/${id}`, formData),
    'Failed to update blog post.',
    'Network error occurred while updating blog post.'
  );
}

export async function deleteBlog(id: string): Promise<ActionResponse> {
  return wrapAction(
    () => blogsApi.delete<ActionResponse>(`/${id}`),
    'Failed to delete blog post.',
    'Network error occurred while deleting blog post.'
  );
}
