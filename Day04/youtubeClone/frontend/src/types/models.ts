export interface User {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  avatar: string;
  coverImage?: string;
  createdAt?: string;
  subscribersCount?: number;
  isSubscribed?: boolean;
}
export interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoFile: string;
  duration: number;
  views: number;
  isPublished: boolean;
  createdAt: string;
  owner: User;
}
export interface Comment {
  _id: string;
  content: string;
  owner: User;
  createdAt: string;
}
export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  videos: Video[];
  totalVideos: number;
  owner: User;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
