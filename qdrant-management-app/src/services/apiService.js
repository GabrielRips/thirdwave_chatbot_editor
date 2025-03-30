import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const getAllVectors = async () => {
  const response = await apiClient.get('/entries');
  return response.data;
};

export const createVector = async (data) => {
  const response = await apiClient.post('/entry', data);
  return response.data;
};

export const updateVector = async (id, data) => {
  const response = await apiClient.put(`/entry/${id}`, data);
  return response.data;
};

export const deleteVector = async (id) => {
  await apiClient.delete(`/entry/${id}`);
  return true;
};

export const searchVectors = async (query, filter = {}) => {
  try {
    const response = await apiClient.get('/search', {
      params: { 
        q: query, 
        tags: filter.tags?.length ? filter.tags.join(',') : undefined 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getAllTags = async () => {
  const response = await apiClient.get('/tags');
  return response.data.tags;
};

export default {
  getAllVectors,
  createVector,
  updateVector,
  deleteVector,
  searchVectors,
  getAllTags,
};