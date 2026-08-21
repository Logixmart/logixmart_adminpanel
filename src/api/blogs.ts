const API_BASE_URL = 'http://localhost:5000/api';

export interface Blog {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
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

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('logixmart_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Fetch all blogs from the backend, sorted by newest first.
 */
export async function getAllBlogs(): Promise<BlogsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Unable to connect to the backend server. Make sure it is running.',
    };
  }
}

/**
 * Fetch details of a single blog by ID.
 */
export async function getBlogById(id: string): Promise<SingleBlogResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Failed to retrieve blog details.',
    };
  }
}

/**
 * Create a new blog post. Needs admin authorization (JWT).
 * @param formData - FormData object containing title, description, and image file
 */
export async function createBlog(formData: FormData): Promise<ActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Note: Do not set Content-Type header when sending FormData; 
        // the browser will automatically set it along with the boundary string.
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to create blog post.',
      };
    }
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred while creating blog post.',
    };
  }
}

/**
 * Update an existing blog post by ID. Needs admin authorization (JWT).
 * @param id - Blog ID to update
 * @param formData - FormData object containing optional title, description, or image file
 */
export async function updateBlog(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update blog post.',
      };
    }
    return data;
  } catch (error) {
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
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to delete blog post.',
      };
    }
    return data;
  } catch (error) {
    return {
      success: false,
      message: 'Network error occurred while deleting blog post.',
    };
  }
}
