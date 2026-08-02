import { api } from './apiClient.js';

export const videoApi = {
  list: () => api.get('/video/getAllVideos'),
  getById: (videoId) => api.get(`/video/${encodeURIComponent(videoId)}/getVideoById`),
  publish: (formData) => api.postForm('/video/publishAVideo', formData),
};
