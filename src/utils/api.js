const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let adminToken = null;

export const setAdminToken = (token) => {
  adminToken = token;
};

export const clearAdminToken = () => {
  adminToken = null;
};

const authHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }
  return headers;
};

export const adminLogin = async (password) => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  setAdminToken(result.token);
  return result;
};

export const submitResponse = async (data) => {
  const response = await fetch(`${API_BASE_URL}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to submit response');
  }

  return result;
};

export const getResponses = async (filters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.department) queryParams.append('department', filters.department);
  if (filters.level) queryParams.append('level', filters.level);
  if (filters.gender) queryParams.append('gender', filters.gender);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);

  const url = `${API_BASE_URL}/responses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await fetch(url, { headers: authHeaders() });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch responses');
  }

  return result;
};

export const getStatistics = async () => {
  const response = await fetch(`${API_BASE_URL}/statistics`, { headers: authHeaders() });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch statistics');
  }

  return result;
};

export const deleteResponse = async (id) => {
  const response = await fetch(`${API_BASE_URL}/responses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete response');
  }

  return result;
};
