import apiClient from './api-client';
import type { GeneratedDiary, DiaryEntry } from '@/types/snap';

/** 获取用户闪拍记录列表 */
export async function getUserSnaps(): Promise<any[]> {
  const { data } = await apiClient.get('/posts/snaps');
  return data.data ?? [];
}

/** 获取用户日志列表（私人素材） */
export async function getUserLogs(): Promise<any[]> {
  const { data } = await apiClient.get('/posts/logs');
  return data.data ?? [];
}

/** 获取用户日记列表 */
export async function getUserDiaries(userId?: string): Promise<any[]> {
  const { data } = await apiClient.get('/posts/diaries', { params: userId ? { userId } : {} });
  return data.data ?? [];
}

/** 获取用户游记列表 */
export async function getUserTravelogues(userId?: string): Promise<any[]> {
  const { data } = await apiClient.get('/posts/travelogues', { params: userId ? { userId } : {} });
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

// ===== 游记生成 =====

/** 提交游记生成任务（LOG + DIARY + prompt → TRAVELOGUE） */
export async function generateTravelogue(input: {
  logIds: string[];
  diaryIds: string[];
  prompt?: string;
  style?: string;
  tone?: string;
  length?: string;
}): Promise<{ jobId: string }> {
  const { data } = await apiClient.post('/posts/travelogue/generate', input);
  return data.data;
}

/** 查询游记生成任务状态 */
export async function getTravelogueJob(jobId: string): Promise<{
  id: string;
  status: string;
  progress: number;
  result?: string;
  postId?: string;
  error?: string;
  createdAt: string;
}> {
  const { data } = await apiClient.get(`/posts/travelogue/job/${jobId}`);
  return data.data;
}
