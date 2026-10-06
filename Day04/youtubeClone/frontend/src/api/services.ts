import { api } from "./apiClient.js";

// This file is a domain-driven service layer: each exported object groups the API calls relevant to one resource/feature (videos, comments, likes, playlists, subscriptions, tweets, dashboard, users). All of them funnel through the same low-level api client

const q = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(
    ([key, value]) => value !== undefined && query.set(key, String(value)),
  );
  return query.toString() ? `?${query}` : "";
};
export const videoService = {
  list: (params = {}) => api.get(`/video/getAllVideos${q(params)}`),
  byId: (id: string) => api.get(`/video/${id}/getVideoById`),
  publish: (body: FormData, onUploadProgress: (progress: number) => void) =>
    api.postFormWithProgress("/video/publishAVideo", body, onUploadProgress),
  update: (id: string, body: unknown) =>
    api.patchForm(`/video/${id}/updateVideo`, body),
  delete: (id: string) => api.delete(`/video/${id}/deleteVideo`),
  togglePublish: (id: string) =>
    api.patch(`/video/${id}/togglePublishStatus`, {}),
};
export const commentService = {
  list: (id: string, page = 1) =>
    api.get(`/comments/${id}/getComments?page=${page}`),
  create: (id: string, content: string) =>
    api.post(`/comments/${id}/addComment`, { content }),
  update: (id: string, content: string) =>
    api.patch(`/comments/${id}/editComment`, { content }),
  delete: (id: string) => api.delete(`/comments/${id}/deleteComment`),
};
export const likeService = {
  video: (id: string) => api.patch(`/likes/toggleVideoLike/${id}`, {}),
  videoDislike: (id: string) =>
    api.patch(`/likes/toggleVideoDislike/${id}`, {}),
  comment: (id: string) => api.patch(`/likes/toggleCommentLike/${id}`, {}),
  commentDislike: (id: string) =>
    api.patch(`/likes/toggleCommentDislike/${id}`, {}),
  tweet: (id: string) => api.patch(`/likes/toggleTweetLike/${id}`, {}),
  videos: () => api.get("/likes/getLikedVideos"),
};
export const playlistService = {
  list: (id: string) => api.get(`/playlists/${id}/getUserPlaylists`),
  byId: (id: string) => api.get(`/playlists/${id}/getPlaylistById`),
  create: (body: unknown) => api.post("/playlists/createPlaylist", body),
  update: (id: string, body: unknown) =>
    api.patch(`/playlists/${id}/updatePlaylist`, body),
  remove: (id: string, videoId: string) =>
    api.delete(`/playlists/${id}/removeVideoFromPlaylist/${videoId}`),
  add: (id: string, videoId: string) =>
    api.patch(`/playlists/${id}/addVideoToPlaylist/${videoId}`, {}),
  delete: (id: string) => api.delete(`/playlists/${id}/deletePlaylist`),
};
export const subscriptionService = {
  toggle: (id: string) => api.patch(`/subscription/${id}`, {}),
  subscribers: (id: string) => api.get(`/subscription/${id}/subscribers`),
  subscribed: (id: string) => api.get(`/subscription/${id}/subscriptions`),
};
export const tweetService = {
  list: (id: string) => api.get(`/tweets/getUserTweets/${id}`),
  create: (caption: string, imageContent?: File) => {
    const body = new FormData();
    body.append("caption", caption);
    if (imageContent) body.append("imageContent", imageContent);
    return api.postForm("/tweets/createTweet", body);
  },
  update: (id: string, caption: string) =>
    api.patch(`/tweets/updateTweet/${id}`, { caption }),
  delete: (id: string) => api.delete(`/tweets/deleteTweet/${id}`),
};
export const dashboardService = {
  stats: () => api.get("/dashboard/stats"),
  videos: () => api.get("/dashboard/videos"),
};
export const userService = {
  current: () => api.get("/users/current-user"),
  channel: (username: string) => api.get(`/users/c/${username}`),
  history: () => api.get("/users/history"),
  watchlist: () => api.get("/users/watchlist"),
  toggleWatchlist: (videoId: string) =>
    api.patch(`/users/watchlist/${videoId}`),
  forgotPassword: (email: string) =>
    api.post("/users/forgot-password", { email }),
  changePassword: (body: unknown) => api.post("/users/change-password", body),
  update: (body: unknown) => api.patch("/users/update-account-details", body),
  avatar: (body: FormData) => api.patchForm("/users/change-avatar", body),
  cover: (body: FormData) => api.patchForm("/users/change-cover-image", body),
  remove: () => api.delete("/users/delete-user"),
  clearHistory: () => api.delete("/users/clear-history"),
  removeFromHistory: (videoId: string) =>
    api.patch(`/users/history/${videoId}`),
};
