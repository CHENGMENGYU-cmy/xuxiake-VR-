import apiClient from './api-client';
import { Post, PostType, Visibility } from '@/types';

export interface CreatePostPayload {
  content: string;
  visibility?: Visibility;
  communityId?: string;
  postType?: PostType;
  tagIds?: string[];
  topicNames?: string[];
  location?: { lat: number; lng: number; name: string };
  mediaItems?: {
    type: string;
    url: string;
    thumbnailUrl?: string;
    hlsUrl?: string;
    duration?: number;
    width?: number;
    height?: number;
    vrFormat?: string;
    language?: string;
    translatedText?: string;
    linkUrl?: string;
    linkTitle?: string;
    linkDescription?: string;
    linkFavicon?: string;
  }[];
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const { data } = await apiClient.post('/posts', payload);
  return data.data;
}

export type PostSortType = 'latest' | 'trending' | 'hot';

export async function getPosts(params?: {
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: PostSortType;
  postType?: string;
  tagId?: string;
}): Promise<{ posts: Post[]; nextCursor: string | null; hasMore: boolean; page?: number }> {
  const { data } = await apiClient.get('/posts', { params });
  return {
    posts: data.data ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: data.hasMore ?? false,
    page: data.page,
  };
}

export async function getPostById(postId: string): Promise<Post> {
  const { data } = await apiClient.get(`/posts/${postId}`);
  return data.data;
}

export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}`);
}

export async function likePost(postId: string): Promise<void> {
  await apiClient.post(`/posts/${postId}/like`);
}

export async function unlikePost(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}/like`);
}
