const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('campus_notes_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authService = {
  async googleLogin(credential) {
    return apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  async devLogin(email, name) {
    return apiRequest('/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  },

  async getMe() {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  async getProfile() {
    return apiRequest('/users/profile', {
      method: 'GET',
    });
  },

  async updateProfile(updates) {
    return apiRequest('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};
