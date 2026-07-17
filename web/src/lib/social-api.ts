import apiClient from './api-client';
import type { InterestTag, Community, RecommendedUser, User } from '@/types';

// ==================== 兴趣标签 ====================

export async function getAllTags(): Promise<Record<string, InterestTag[]>> {
  const { data } = await apiClient.get('/social/tags');
  return data.data;
}

export async function getHotTags(): Promise<InterestTag[]> {
  const { data } = await apiClient.get('/social/tags/hot');
  return data.data;
}

export async function getHotTopics(): Promise<{ tag: string; count: number }[]> {
  const { data } = await apiClient.get('/social/hot-topics');
  return data.data;
}

export async function getUserInterests(): Promise<InterestTag[]> {
  const { data } = await apiClient.get('/social/user/interests');
  return data.data;
}

export async function setUserInterests(tagIds: string[]): Promise<void> {
  await apiClient.post('/social/user/interests', { tagIds });
}

// ==================== 智能推荐 ====================

export async function getRecommendedUsers(page = 1, limit = 20): Promise<{
  data: RecommendedUser[];
  page: number;
}> {
  const { data } = await apiClient.get('/social/recommended/users', {
    params: { page, limit },
  });
  return data;
}

export async function getRecommendedCommunities(page = 1, limit = 20): Promise<{
  data: Community[];
  page: number;
}> {
  const { data } = await apiClient.get('/social/recommended/communities', {
    params: { page, limit },
  });
  return data;
}

// ==================== 社群 ====================

export async function createCommunity(params: {
  name: string;
  description?: string;
  tagIds?: string[];
  isPublic?: boolean;
}): Promise<Community> {
  const { data } = await apiClient.post('/social/communities', params);
  return data.data;
}

export async function getCommunity(id: string): Promise<Community> {
  const { data } = await apiClient.get(`/social/communities/${id}`);
  return data.data;
}

export async function joinCommunity(id: string): Promise<void> {
  await apiClient.post(`/social/communities/${id}/join`);
}

export async function leaveCommunity(id: string): Promise<void> {
  await apiClient.post(`/social/communities/${id}/leave`);
}

export async function listCommunities(params?: {
  page?: number;
  limit?: number;
  tagId?: string;
}): Promise<{
  data: Community[];
  total: number;
  page: number;
}> {
  const { data } = await apiClient.get('/social/communities', { params });
  return data;
}

export async function getUserCommunities(): Promise<Community[]> {
  const { data } = await apiClient.get('/social/user/communities');
  return data.data;
}
