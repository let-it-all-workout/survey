const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const submitResponse = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit response');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting response:', error);
    throw error;
  }
};

export const getResponses = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.level) queryParams.append('level', filters.level);
    if (filters.gender) queryParams.append('gender', filters.gender);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const url = `${API_BASE_URL}/responses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch responses');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching responses:', error);
    throw error;
  }
};

export const getStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

export const deleteResponse = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/responses/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete response');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting response:', error);
    throw error;
  }
};
