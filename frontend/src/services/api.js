const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('campus_notes_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

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

export function uploadWithProgress(endpoint, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem('campus_notes_token');

    xhr.open('POST', `${API_BASE_URL}${endpoint}`);

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        onProgress(percentCompleted);
      }
    };

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { message: xhr.statusText };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const error = new Error(data.message || `Upload failed with status ${xhr.status}`);
        error.status = xhr.status;
        error.data = data;
        reject(error);
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during file upload. Please check your connection.'));
    };

    xhr.send(formData);
  });
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

  async getLeaderboard(params = {}) {
    const query = new URLSearchParams();
    if (params.branch) query.append('branch', params.branch);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/users/leaderboard${queryString}`, {
      method: 'GET',
    });
  },
};

export const userService = {
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

  async getLeaderboard(params = {}) {
    const query = new URLSearchParams();
    if (params.branch) query.append('branch', params.branch);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/users/leaderboard${queryString}`, {
      method: 'GET',
    });
  },
};

export const academicService = {
  async getBranches() {
    return apiRequest('/academic/branches', {
      method: 'GET',
    });
  },

  async getSubjects(params = {}) {
    const query = new URLSearchParams();
    if (params.branch) query.append('branch', params.branch);
    if (params.semester) query.append('semester', params.semester);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/academic/subjects${queryString}`, {
      method: 'GET',
    });
  },

  async getSubjectById(id) {
    return apiRequest(`/academic/subjects/${id}`, {
      method: 'GET',
    });
  },
};

export const resourceService = {
  async getResources(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/resources${queryString}`, {
      method: 'GET',
    });
  },

  async getResourceById(id) {
    return apiRequest(`/resources/${id}`, {
      method: 'GET',
    });
  },

  async uploadResource(formData, onProgress) {
    return uploadWithProgress('/resources/upload', formData, onProgress);
  },

  async downloadResource(id) {
    return apiRequest(`/resources/${id}/download`, {
      method: 'GET',
    });
  },

  async getMyUploads(status) {
    const queryString = status ? `?status=${status}` : '';
    return apiRequest(`/resources/my-uploads${queryString}`, {
      method: 'GET',
    });
  },
};

export const bookmarkService = {
  async toggleBookmark(resourceId) {
    return apiRequest(`/bookmarks/${resourceId}`, {
      method: 'POST',
    });
  },

  async getBookmarks() {
    return apiRequest('/bookmarks', {
      method: 'GET',
    });
  },

  async getBookmarkIds() {
    return apiRequest('/bookmarks/ids', {
      method: 'GET',
    });
  },
};

export const reportService = {
  async createReport(data) {
    return apiRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getReports(status) {
    const queryString = status ? `?status=${status}` : '';
    return apiRequest(`/reports${queryString}`, {
      method: 'GET',
    });
  },

  async updateReport(id, data) {
    return apiRequest(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const adminService = {
  async getMetrics() {
    return apiRequest('/admin/metrics', {
      method: 'GET',
    });
  },

  async getQueue(params = {}) {
    const query = new URLSearchParams();
    if (params.branch) query.append('branch', params.branch);
    if (params.semester) query.append('semester', params.semester);
    if (params.resourceType) query.append('resourceType', params.resourceType);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/queue${queryString}`, {
      method: 'GET',
    });
  },

  async verifyResource(id, action, rejectionReason = '') {
    return apiRequest(`/admin/resources/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ action, rejectionReason }),
    });
  },

  async deleteResource(id) {
    return apiRequest(`/admin/resources/${id}`, {
      method: 'DELETE',
    });
  },
};

export const ratingService = {
  async submitRating(resourceId, { rating, review }) {
    return apiRequest(`/resources/${resourceId}/ratings`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  },

  async getResourceRatings(resourceId, params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/resources/${resourceId}/ratings${queryString}`, {
      method: 'GET',
    });
  },

  async getUserRating(resourceId) {
    return apiRequest(`/resources/${resourceId}/ratings/my-rating`, {
      method: 'GET',
    });
  },

  async deleteRating(resourceId) {
    return apiRequest(`/resources/${resourceId}/ratings`, {
      method: 'DELETE',
    });
  },

  async getMyReviews() {
    return apiRequest('/ratings/my-reviews', {
      method: 'GET',
    });
  },
};



