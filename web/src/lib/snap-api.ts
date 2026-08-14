import apiClient from './api-client';
import type { GeneratedDiary, DiaryEntry } from '@/types/snap';

/** 获取用户闪拍记录列表 */
export async function getUserSnaps(): Promise<any[]> {
  const { data } = await apiClient.get('/posts/snaps');
  return data.data ?? [];
}

/** 获取当前用户的行程列表（按 tripId 分组） */
export async function getUserTrips(): Promise<any[]> {
  const { data } = await apiClient.get('/posts/trips');
  return data.data ?? [];
}

/** 按行程一键生成游记 */
export async function generateTravelogueByTrip(input: {
  tripId: string;
  prompt?: string;
  style?: string;
  tone?: string;
  length?: string;
}): Promise<{ jobId: string }> {
  const { data } = await apiClient.post('/posts/travelogue/generate-by-trip', input);
  return data.data;
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

/** 多张闪拍 → AI 生成一篇日记（异步 job） */
export async function generateDiaryBatch(input: {
  snapIds: string[];
  style?: string;
  tone?: string;
  length?: string;
}): Promise<{ jobId: string }> {
  const { data } = await apiClient.post('/posts/diary/generate-batch', input);
  return data.data;
}

/** 查询 AI 生成任务状态（travelogue / multi-diary 通用） */
export async function getAiJob(jobId: string): Promise<{
  id: string;
  status: string;
  progress: number;
  result?: string;
  postId?: string;
  error?: string;
  createdAt: string;
}> {
  const { data } = await apiClient.get(`/posts/ai/jobs/${jobId}`);
  return data.data;
}

/** 查询指定素材的已有日记草稿 */
export async function getDiaryDraft(snapId: string): Promise<any | null> {
  const { data } = await apiClient.get(`/posts/diary/draft/${snapId}`);
  return data.data ?? null;
}

/** 保存/发布日记（支持更新已有草稿） */
export async function saveDiary(dto: {
  diaryId?: string;
  snapId?: string;
  title: string;
  content: string;
  insight?: string;
  style?: string;
  tags?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
  status?: 'draft' | 'private' | 'public';
  image?: string;
  mood?: string;
  weather?: string;
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

/** 提交游记生成任务（SNAPSHOT + DIARY + prompt → TRAVELOGUE） */
export async function generateTravelogue(input: {
  snapIds: string[];
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

// ===== 闪拍数据同步 =====

/** 同步闪拍 App 数据（幂等，按 originalId 去重） */
export async function syncSnapshots(input: {
  trips?: any[];
  moments?: any[];
  reflections?: any[];
  activityCategories?: any[];
}): Promise<{ imported: number; skipped: number }> {
  const { data } = await apiClient.post('/sync/snapshots', input);
  return data.data;
}
