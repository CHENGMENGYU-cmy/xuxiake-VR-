'use client';

import { create } from 'zustand';
import type { DiaryStyle, GeneratedDiary, DiaryEntry, TravelogueJob } from '@/types/snap';
import {
  getUserSnaps, getUserLogs, getUserDiaries, getUserTravelogues,
  generateDiary, saveDiary, getDiaryDraft, getDiarySquare,
  generateTravelogue, getTravelogueJob,
} from '@/lib/snap-api';

interface SnapState {
  // 闪拍列表
  snaps: any[];
  snapsLoading: boolean;

  // 素材列表（日志 + 日记）
  logs: any[];
  logsLoading: boolean;
  diaries: any[];
  diariesLoading: boolean;
  travelogues: any[];
  traveloguesLoading: boolean;

  // 日记生成
  generatedDiary: GeneratedDiary | null;
  generating: boolean;
  currentStyle: DiaryStyle;
  memorySnap: { id: string; text: string | null; createdAt: string } | null;
  includeMemory: boolean;
  existingDraftId: string | null; // 已有草稿的帖子 ID

  // 日记广场
  squareDiaries: DiaryEntry[];
  squareLoading: boolean;
  squareHasMore: boolean;
  squareCursor: string | null;

  // 我的日记
  myDiaries: DiaryEntry[];
  myDiariesLoading: boolean;

  // 游记生成任务
  travelogueJobId: string | null;
  travelogueJob: TravelogueJob | null;
  travelogueGenerating: boolean;

  // Actions
  fetchSnaps: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchDiaries: (userId?: string) => Promise<void>;
  fetchTravelogues: (userId?: string) => Promise<void>;
  generateDiary: (snapId: string, style?: string, includeMemory?: boolean) => Promise<void>;
  setStyle: (style: DiaryStyle) => void;
  setIncludeMemory: (include: boolean) => void;
  editGeneratedDiary: (updates: Partial<GeneratedDiary>) => void;
  fetchDiaryDraft: (snapId: string) => Promise<boolean>;
  saveDiary: (dto: {
    diaryId?: string;
    snapId?: string;
    title: string;
    content: string;
    insight?: string;
    style?: string;
    tags?: string[];
    status?: 'draft' | 'private' | 'public';
    image?: string;
  }) => Promise<any>;
  fetchSquareDiaries: (reset?: boolean) => Promise<void>;
  fetchMyDiaries: () => Promise<void>;
  resetGeneration: () => void;

  // 游记生成
  startTravelogueGeneration: (input: {
    snapIds: string[]; diaryIds: string[]; prompt?: string;
    style?: string; tone?: string; length?: string;
  }) => Promise<string>;
  pollTravelogueJob: (jobId: string) => Promise<TravelogueJob | null>;
  clearTravelogueJob: () => void;
}

export const useSnapStore = create<SnapState>((set, get) => ({
  snaps: [],
  snapsLoading: false,

  logs: [],
  logsLoading: false,
  diaries: [],
  diariesLoading: false,
  travelogues: [],
  traveloguesLoading: false,

  generatedDiary: null,
  generating: false,
  currentStyle: '生活碎片风',
  memorySnap: null,
  includeMemory: false,
  existingDraftId: null,

  squareDiaries: [],
  squareLoading: false,
  squareHasMore: true,
  squareCursor: null,

  myDiaries: [],
  myDiariesLoading: false,

  travelogueJobId: null,
  travelogueJob: null,
  travelogueGenerating: false,

  fetchSnaps: async () => {
    set({ snapsLoading: true });
    try {
      const snaps = await getUserSnaps();
      set({ snaps, snapsLoading: false });
    } catch {
      set({ snapsLoading: false });
    }
  },

  fetchLogs: async () => {
    set({ logsLoading: true });
    try {
      const logs = await getUserLogs();
      set({ logs, logsLoading: false });
    } catch {
      set({ logsLoading: false });
    }
  },

  fetchDiaries: async (userId) => {
    set({ diariesLoading: true });
    try {
      const diaries = await getUserDiaries(userId);
      set({ diaries, diariesLoading: false });
    } catch {
      set({ diariesLoading: false });
    }
  },

  fetchTravelogues: async (userId) => {
    set({ traveloguesLoading: true });
    try {
      const travelogues = await getUserTravelogues(userId);
      set({ travelogues, traveloguesLoading: false });
    } catch {
      set({ traveloguesLoading: false });
    }
  },

  generateDiary: async (snapId, style, includeMemory) => {
    set({ generating: true });
    try {
      const result = await generateDiary(snapId, style, includeMemory);
      set({
        generatedDiary: result,
        currentStyle: result.style,
        memorySnap: result.memorySnap || null,
        includeMemory: includeMemory || false,
        generating: false,
      });
    } catch {
      set({ generating: false });
    }
  },

  setStyle: (style) => set({ currentStyle: style }),
  setIncludeMemory: (include) => set({ includeMemory: include }),

  editGeneratedDiary: (updates) => {
    const current = get().generatedDiary;
    if (current) {
      set({ generatedDiary: { ...current, ...updates } });
    }
  },

  fetchDiaryDraft: async (snapId) => {
    try {
      const draft = await getDiaryDraft(snapId);
      if (draft) {
        // 解析草稿内容恢复到编辑器
        const meta = typeof draft.vrMetadata === 'string'
          ? JSON.parse(draft.vrMetadata) : (draft.vrMetadata || {});
        set({
          existingDraftId: draft.id,
          generatedDiary: {
            title: draft.title || '',
            content: draft.content || '',
            insight: meta.insight || '',
            tags: meta.generatorTags || [],
            style: meta.style || '生活碎片风',
          },
          currentStyle: (meta.style as DiaryStyle) || '生活碎片风',
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  saveDiary: async (dto) => {
    // 如果有已有草稿 ID，传入以更新而非新建
    const draftId = dto.diaryId || get().existingDraftId;
    const result = await saveDiary({ ...dto, diaryId: draftId || undefined });
    // 保存后记录帖子 ID
    if (result?.id) {
      set({ existingDraftId: result.id });
    }
    return result;
  },

  fetchSquareDiaries: async (reset = false) => {
    if (!reset && get().squareLoading) return;
    const cursor = reset ? undefined : get().squareCursor ?? undefined;
    set({ squareLoading: true });
    try {
      const result = await getDiarySquare(cursor);
      set((s) => ({
        squareDiaries: reset ? result.data : [...s.squareDiaries, ...result.data],
        squareCursor: result.nextCursor,
        squareHasMore: result.hasMore,
        squareLoading: false,
      }));
    } catch {
      set({ squareLoading: false });
    }
  },

  fetchMyDiaries: async () => {
    set({ myDiariesLoading: true });
    try {
      const result = await getUserDiaries();
      set({ myDiaries: result, myDiariesLoading: false });
    } catch {
      set({ myDiariesLoading: false });
    }
  },

  resetGeneration: () => set({
    generatedDiary: null,
    currentStyle: '生活碎片风',
    memorySnap: null,
    includeMemory: false,
    existingDraftId: null,
  }),

  // ===== 游记生成 =====

  startTravelogueGeneration: async (input) => {
    set({ travelogueGenerating: true, travelogueJob: null });
    try {
      const { jobId } = await generateTravelogue(input);
      set({ travelogueJobId: jobId });

      // 轮询任务状态
      const poll = async () => {
        const job = await getTravelogueJob(jobId);
        set({ travelogueJob: job });
        if (job.status === 'DONE' || job.status === 'ERROR') {
          set({ travelogueGenerating: false });
          // 生成完成后刷新游记列表
          if (job.status === 'DONE') {
            get().fetchTravelogues();
          }
          return job;
        }
        // 继续轮询
        await new Promise(r => setTimeout(r, 2000));
        return poll();
      };

      poll().catch(() => set({ travelogueGenerating: false }));
      return jobId;
    } catch {
      set({ travelogueGenerating: false });
      return '';
    }
  },

  pollTravelogueJob: async (jobId) => {
    try {
      const job = await getTravelogueJob(jobId);
      set({ travelogueJob: job });
      if (job.status === 'DONE' || job.status === 'ERROR') {
        set({ travelogueGenerating: false });
      }
      return job;
    } catch {
      return null;
    }
  },

  clearTravelogueJob: () => set({
    travelogueJobId: null,
    travelogueJob: null,
    travelogueGenerating: false,
  }),
}));
