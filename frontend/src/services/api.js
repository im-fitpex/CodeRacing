import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Apps API
export const appsAPI = {
  getAll: () => api.get('/apps'),
  getById: (id, userId) => api.get(`/apps/${id}`, { params: { userId } }),
  getByCategory: (categoryId) => api.get(`/apps/category/${categoryId}`),
  getFree: () => api.get('/apps/free'),
  getPaid: () => api.get('/apps/paid'),
  getEditorChoice: () => api.get('/apps/editor-choice'),
  getNew: () => api.get('/apps/new'),
  getPopular: () => api.get('/apps/popular'),
  search: (query) => api.get('/apps/search', { params: { q: query } }),
  getRecommendations: (userId, limit = 10) => 
    api.get('/apps/recommendations', { params: { userId, limit } }),
  trackInstall: (appId, userId) => api.post(`/apps/${appId}/install`, null, { params: { userId } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  getByType: (type) => api.get(`/categories/type/${type}`),
};

// Reviews API
export const reviewsAPI = {
  getByAppId: (appId, limit = 10) => api.get(`/reviews/app/${appId}`, { params: { limit } }),
  create: (review) => api.post('/reviews', review),
  like: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
};

// ML Search API
export const mlSearchAPI = {
  search: (query, filters = {}) => 
    axios.post('http://localhost:8000/search', {
      query,
      top_k: filters.limit || 10,
      semantic_weight: filters.semanticWeight || 0.6,
      category_filter: filters.category,
      free_only: filters.freeOnly,
    }),
};


export default api;
