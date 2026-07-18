import apiClient from './api-client';
import type {
  InterestTag, Community, RecommendedCommunity, RecommendedUser, User,
  CommunityAnnouncement, CommunityRole, CommunityChallenge,
} from '@/types';

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
  data: RecommendedCommunity[];
  page: number;
}> {
  const { data } = await apiClient.get('/social/recommended/communities', {
    params: { page, limit },
  });
  return data;
}

export async function submitCommunityFeedback(
  id: string,
  type: 'NOT_INTERESTED' | 'INTERESTED',
): Promise<void> {
  await apiClient.post(`/social/recommended/communities/${id}/feedback`, { type });
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

// ==================== 关注 ====================

export async function followUser(userId: string): Promise<void> {
  await apiClient.post(`/users/${userId}/follow`);
}

export async function unfollowUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}/follow`);
}

export async function getUserProfile(username: string): Promise<User> {
  const { data } = await apiClient.get(`/users/${username}`);
  return data.data;
}

export async function getFollowers(username: string): Promise<{ data: User[]; total: number }> {
  const { data } = await apiClient.get(`/users/${username}/followers`);
  return data;
}

export async function getFollowing(username: string): Promise<{ data: User[]; total: number }> {
  const { data } = await apiClient.get(`/users/${username}/following`);
  return data;
}

// ==================== 私聊 ====================

export async function getOrCreateDirectConversation(userId: string): Promise<{ id: string; isRequest?: boolean }> {
  const { data } = await apiClient.post(`/conversations/direct/${userId}`);
  return data;
}

// ==================== 社群编辑/解散 ====================

export async function updateCommunity(id: string, params: {
  name?: string;
  description?: string;
  coverUrl?: string;
  avatarUrl?: string;
  rules?: string;
  category?: string;
  locationName?: string;
  isPublic?: boolean;
  maxMembers?: number;
}): Promise<Community> {
  const { data } = await apiClient.put(`/social/communities/${id}`, params);
  return data.data;
}

export async function dissolveCommunity(id: string): Promise<void> {
  await apiClient.post(`/social/communities/${id}/dissolve`);
}

// ==================== 社群搜索 ====================

export async function searchCommunities(keyword: string, page = 1, limit = 20): Promise<{
  data: Community[];
  total: number;
  page: number;
}> {
  const { data } = await apiClient.get('/social/communities/search', {
    params: { q: keyword, page, limit },
  });
  return data;
}

// ==================== 社群公告 ====================

export async function getCommunityAnnouncements(communityId: string): Promise<CommunityAnnouncement[]> {
  const { data } = await apiClient.get(`/social/communities/${communityId}/announcements`);
  return data.data;
}

export async function createCommunityAnnouncement(communityId: string, params: {
  title: string;
  content: string;
  isPinned?: boolean;
}): Promise<CommunityAnnouncement> {
  const { data } = await apiClient.post(`/social/communities/${communityId}/announcements`, params);
  return data.data;
}

export async function deleteCommunityAnnouncement(communityId: string, announcementId: string): Promise<void> {
  await apiClient.delete(`/social/communities/${communityId}/announcements/${announcementId}`);
}

// ==================== 社群角色 ====================

export async function getCommunityRoles(communityId: string): Promise<CommunityRole[]> {
  const { data } = await apiClient.get(`/social/communities/${communityId}/roles`);
  return data.data;
}

export async function assignCommunityRole(communityId: string, userId: string, role: 'ADMIN' | 'MODERATOR'): Promise<void> {
  await apiClient.post(`/social/communities/${communityId}/roles`, { userId, role });
}

export async function removeCommunityRole(communityId: string, userId: string): Promise<void> {
  await apiClient.delete(`/social/communities/${communityId}/roles/${userId}`);
}

// ==================== 社群挑战 ====================

export async function getCommunityChallenges(communityId: string, status?: string): Promise<CommunityChallenge[]> {
  const { data } = await apiClient.get(`/social/communities/${communityId}/challenges`, {
    params: status ? { status } : {},
  });
  return data.data;
}

export async function createCommunityChallenge(communityId: string, params: {
  title: string;
  description?: string;
  type?: 'PHOTO' | 'ROUTE' | 'CHECKIN' | 'DISTANCE';
  startDate: string;
  endDate: string;
  maxParticipants?: number;
}): Promise<CommunityChallenge> {
  const { data } = await apiClient.post(`/social/communities/${communityId}/challenges`, params);
  return data.data;
}

// ==================== 社群动态 ====================

export async function getCommunityPosts(communityId: string, page = 1, limit = 20): Promise<{
  data: any[];
  total: number;
  page: number;
}> {
  const { data } = await apiClient.get(`/social/communities/${communityId}/posts`, {
    params: { page, limit },
  });
  return data;
}
