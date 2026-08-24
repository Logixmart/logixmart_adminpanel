import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const blogsApi = axios.create({
  baseURL: `${API_URL}/api/blogs`,
});

blogsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('logixmart_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let the browser set multipart boundary when sending FormData
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

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

/**
 * Fetch all blogs from the backend, sorted by newest first.
 */
export async function getAllBlogs(): Promise<BlogsResponse> {
  try {
    const response = await blogsApi.get<BlogsResponse>('/');
    return response.data;
  } catch {
    return {
      success: false,
      message: 'Unable to connect to the backend server. Make sure it is running.',
      data: [],
    };
  }
}

/**
 * Fetch details of a single blog by ID.
 */
export async function getBlogById(id: string): Promise<SingleBlogResponse> {
  try {
    const response = await blogsApi.get<SingleBlogResponse>(`/${id}`);
    return response.data;
  } catch {
    return {
      success: false,
      message: 'Failed to retrieve blog details.',
    };
  }
}

/**
 * Create a new blog post. Needs admin authorization (JWT).
 * @param formData - FormData with required title and description; image file is optional
 */
export async function createBlog(formData: FormData): Promise<ActionResponse> {
  try {
    const response = await blogsApi.post<ActionResponse>('/', formData);
    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Failed to create blog post.',
      };
    }

    return data;
  } catch {
    return {
      success: false,
      message: 'Network error occurred while creating blog post.',
    };
  }
}

/**
 * Update an existing blog post by ID. Needs admin authorization (JWT).
 * @param id - Blog ID to update
 * @param formData - FormData with optional title, description, or image file
 */
export async function updateBlog(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const response = await blogsApi.put<ActionResponse>(`/${id}`, formData);
    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Failed to update blog post.',
      };
    }

    return data;
  } catch {
    return {
      success: false,
      message: 'Network error occurred while updating blog post.',
    };
  }
}

/**
 * Delete a blog post by ID. Needs admin authorization (JWT).
 * @param id - Blog ID to delete
 */
export async function deleteBlog(id: string): Promise<ActionResponse> {
  try {
    const response = await blogsApi.delete<ActionResponse>(`/${id}`);
    const data = response.data;

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Failed to delete blog post.',
      };
    }

    return data;
  } catch {
    return {
      success: false,
      message: 'Network error occurred while deleting blog post.',
    };
  }
}
