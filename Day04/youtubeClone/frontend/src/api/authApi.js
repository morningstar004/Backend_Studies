import { api } from './apiClient.js';

export const authApi = {
  register: (formData) => api.postForm('/users/register', formData),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout', {}),
  currentUser: () => api.get('/users/current-user'),
};
