'use client';

import { create } from 'zustand';
import type { DiaryStyle, GeneratedDiary, DiaryEntry } from '@/types/snap';
import { getUserSnaps, generateDiary, saveDiary, getDiarySquare } from '@/lib/snap-api';

interface SnapState {
  // 闪拍列表
  snaps: any[];
  snapsLoading: boolean;

  // 日记生成
  generatedDiary: GeneratedDiary | null;
  generating: boolean;
  currentStyle: DiaryStyle;
  memorySnap: { id: string; text: string | null; createdAt: string } | null;
  includeMemory: boolean;

  // 日记广场
  squareDiaries: DiaryEntry[];
  squareLoading: boolean;
  squareHasMore: boolean;
  squareCursor: string | null;

  // 我的日记
  myDiaries: DiaryEntry[];
  myDiariesLoading: boolean;

  // Actions
  fetchSnaps: () => Promise<void>;
  generateDiary: (snapId: string, style?: string, includeMemory?: boolean) => Promise<void>;
  setStyle: (style: DiaryStyle) => void;
  setIncludeMemory: (include: boolean) => void;
  editGeneratedDiary: (updates: Partial<GeneratedDiary>) => void;
  saveDiary: (dto: {
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
}

export const useSnapStore = create<SnapState>((set, get) => ({
  snaps: [],
  snapsLoading: false,

  generatedDiary: null,
  generating: false,
  currentStyle: '生活碎片风',
  memorySnap: null,
  includeMemory: false,

  squareDiaries: [],
  squareLoading: false,
  squareHasMore: true,
  squareCursor: null,

  myDiaries: [],
  myDiariesLoading: false,

  fetchSnaps: async () => {
    set({ snapsLoading: true });
    try {
      const snaps = await getUserSnaps();
      set({ snaps, snapsLoading: false });
    } catch {
      set({ snapsLoading: false });
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

  saveDiary: async (dto) => {
    const result = await saveDiary(dto);
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
      const { data } = await (await import('@/lib/snap-api')).getDiarySquare();
      // 这里后续可用专门的用户日记接口
      set({ myDiaries: [], myDiariesLoading: false });
    } catch {
      set({ myDiariesLoading: false });
    }
  },

  resetGeneration: () => set({
    generatedDiary: null,
    currentStyle: '生活碎片风',
    memorySnap: null,
    includeMemory: false,
  }),
}));
