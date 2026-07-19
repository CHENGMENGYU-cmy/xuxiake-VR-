import apiClient from './api-client';
import { Post, PostType, Visibility, Difficulty, RouteType, GuideCategory, BudgetLevel, Collection } from '@/types';

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
    sortOrder?: number;
  }[];
  routeDetail?: {
    distanceKm?: number;
    durationMinutes?: number;
    elevationGainM?: number;
    difficulty?: Difficulty;
    routeType?: RouteType;
    gpxData?: string;
    waypoints?: { lat: number; lng: number; name: string; description?: string }[];
  };
  journey?: {
    title: string;
    startDate?: string;
    endDate?: string;
    destination?: string;
    coverUrl?: string;
    stops?: {
      dayNumber?: number;
      locationName?: string;
      locationLat?: number;
      locationLng?: number;
      description?: string;
      mediaUrl?: string;
    }[];
  };
  guideDetail?: {
    destination?: string;
    category?: GuideCategory;
    bestSeason?: string;
    budgetLevel?: BudgetLevel;
    richContent?: string;
  };
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

export async function updatePost(postId: string, payload: { content: string }): Promise<Post> {
  const { data } = await apiClient.put(`/posts/${postId}`, payload);
  return data.data;
}

export async function likePost(postId: string): Promise<void> {
  await apiClient.post(`/posts/${postId}/like`);
}

export async function unlikePost(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}/like`);
}

// ===== 标签 API =====
import type { InterestTag, Topic } from '@/types';

export async function getTags(): Promise<InterestTag[]> {
  const { data } = await apiClient.get('/posts/tags');
  return data.data ?? [];
}

export async function getHotTopics(limit = 10): Promise<Topic[]> {
  const { data } = await apiClient.get('/posts/topics', { params: { limit } });
  return data.data ?? [];
}

export async function searchTopics(keyword: string): Promise<Topic[]> {
  const { data } = await apiClient.get('/posts/topics/search', { params: { q: keyword } });
  return data.data ?? [];
}

export async function getTopicById(id: string): Promise<Topic> {
  const { data } = await apiClient.get(`/posts/topics/${id}`);
  return data.data;
}

export async function getTopicPosts(id: string, params?: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<{ posts: Post[]; hasMore: boolean; page: number }> {
  const { data } = await apiClient.get(`/posts/topics/${id}/posts`, { params });
  return {
    posts: data.data ?? [],
    hasMore: data.hasMore ?? false,
    page: data.page ?? 1,
  };
}

export async function getAllTopics(): Promise<Topic[]> {
  const { data } = await apiClient.get('/posts/topics/all');
  return data.data ?? [];
}

// ===== 合集 API =====

export async function createCollection(params: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<Collection> {
  const { data } = await apiClient.post('/posts/collections', params);
  return data.data;
}

export async function getCollections(page = 1): Promise<{
  data: Collection[];
  total: number;
  page: number;
}> {
  const { data } = await apiClient.get('/posts/collections', { params: { page } });
  return data;
}

export async function getCollectionById(id: string): Promise<Collection> {
  const { data } = await apiClient.get(`/posts/collections/${id}`);
  return data.data;
}

export async function getCollectionPosts(id: string, page = 1): Promise<{
  posts: Post[];
  page: number;
}> {
  const { data } = await apiClient.get(`/posts/collections/${id}/posts`, { params: { page } });
  return { posts: data.data ?? [], page: data.page ?? 1 };
}

export async function addPostToCollection(collectionId: string, postId: string): Promise<void> {
  await apiClient.post(`/posts/collections/${collectionId}/posts/${postId}`);
}

export async function removePostFromCollection(collectionId: string, postId: string): Promise<void> {
  await apiClient.delete(`/posts/collections/${collectionId}/posts/${postId}`);
}
