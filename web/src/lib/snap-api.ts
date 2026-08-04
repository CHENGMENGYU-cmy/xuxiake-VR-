import apiClient from './api-client';
import type { GeneratedDiary, DiaryEntry } from '@/types/snap';

/** 获取用户闪拍记录列表 */
export async function getUserSnaps(): Promise<any[]> {
  const { data } = await apiClient.get('/posts/snaps');
  return data.data ?? [];
}

/** 获取日记广场 */
export async function getDiarySquare(cursor?: string, limit = 20): Promise<{
  data: any[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const { data } = await apiClient.get('/posts/diary-square', { params: { cursor, limit } });
  return {
    data: data.data ?? [],
    nextCursor: data.nextCursor ?? null,
    hasMore: data.hasMore ?? false,
  };
}

/** 生成日记 */
export async function generateDiary(snapId: string, style?: string, includeMemory = false): Promise<GeneratedDiary> {
  const { data } = await apiClient.post('/posts/diary/generate', { snapId, style, includeMemory });
  return data.data;
}

/** 保存/发布日记 */
export async function saveDiary(dto: {
  snapId?: string;
  title: string;
  content: string;
  insight?: string;
  style?: string;
  tags?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
  status?: 'draft' | 'private' | 'public';
  image?: string;
}): Promise<any> {
  const { data } = await apiClient.post('/posts/diary/save', dto);
  return data.data;
}

/** 获取帖子详情 */
export async function getPostDetail(postId: string): Promise<any> {
  const { data } = await apiClient.get(`/posts/${postId}`);
  return data.data;
}
