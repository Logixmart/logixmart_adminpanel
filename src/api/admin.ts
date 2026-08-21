const API_BASE_URL = 'http://localhost:5000/api';

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: {
    email: string;
  };
}

export interface HealthResponse {
  success: boolean;
  status: string;
  timestamp?: string;
}

/**
 * Perform login request to the Logixmart backend.
 */
export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Authentication failed',
      };
    }

    return {
      success: true,
      token: data.token,
      admin: data.admin,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unable to connect to the backend server. Make sure it is running.',
    };
  }
}

/**
 * Query backend health status to verify if the server is UP.
 */
export async function checkServerHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false, status: 'DOWN' };
    }

    const data = await response.json();
    return {
      success: true,
      status: data.status || 'UP',
      timestamp: data.timestamp,
    };
  } catch (error) {
    return {
      success: false,
      status: 'DOWN',
    };
  }
}

/**
 * Perform logout request to the Logixmart backend.
 */
export async function logoutAdmin(): Promise<LoginResponse> {
  try {
    const token = localStorage.getItem('logixmart_token');
    const response = await fetch(`${API_BASE_URL}/admin/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Logout failed',
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unable to connect to the backend server.',
    };
  }
}
