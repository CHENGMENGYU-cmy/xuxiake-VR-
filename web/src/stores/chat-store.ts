'use client';

import { create } from 'zustand';

interface ChatState {
  totalUnread: number;
  setTotalUnread: (count: number) => void;
  addUnread: (delta: number) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  totalUnread: 0,
  setTotalUnread: (count) => set({ totalUnread: count }),
  addUnread: (delta) => set((state) => ({ totalUnread: Math.max(0, state.totalUnread + delta) })),
}));
