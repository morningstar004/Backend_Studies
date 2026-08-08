import { api } from './apiClient.js';

export const authApi = {
  register: (formData) => api.postForm('/users/register', formData),
  login: (credentials) => api.post('/users/login', credentials),
  logout: () => api.post('/users/logout', {}),
  currentUser: () => api.get('/users/current-user'),
};
//This is a common pattern: rather than calling api.post('/users/login', ...) scattered throughout the codebase, you centralize the actual URL paths here and expose clean, semantic function names elsewhere. 
