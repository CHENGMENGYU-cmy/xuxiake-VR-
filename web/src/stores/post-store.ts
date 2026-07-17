'use client';

import { create } from 'zustand';
import { Post } from '@/types';
import { createPost, getPosts, CreatePostPayload } from '@/lib/post-api';

interface PostState {
  // 帖子列表
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // 分页状态
  nextCursor: string | null;
  hasMore: boolean;

  // 发布状态
  isPublishing: boolean;
  publishError: string | null;

  // Actions
  fetchPosts: () => Promise<void>;
  loadMore: () => Promise<void>;
  publishPost: (payload: CreatePostPayload) => Promise<Post>;
  prependPost: (post: Post) => void;
  clearPublishError: () => void;
  updateUserAvatar: (username: string, avatarUrl: string) => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  nextCursor: null,
  hasMore: true,
  isPublishing: false,
  publishError: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getPosts();
      const posts = result.posts ?? [];
      // 去重：确保没有重复的帖子ID
      const uniquePosts = posts.filter((post, index, self) =>
        index === self.findIndex(p => p.id === post.id)
      );
      set({
        posts: uniquePosts,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        isLoading: false,
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        '加载失败，请稍后重试';
      set({ error: message, isLoading: false });
    }
  },

  loadMore: async () => {
    const { nextCursor, hasMore, isLoadingMore, posts } = usePostStore.getState();
    if (!hasMore || isLoadingMore || !nextCursor) return;

    set({ isLoadingMore: true });
    try {
      const result = await getPosts({ cursor: nextCursor });
      const newPosts = result.posts ?? [];
      // 去重：过滤掉已存在的帖子
      const existingIds = new Set(posts.map(p => p.id));
      const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));

      set((state) => ({
        posts: [...state.posts, ...uniqueNewPosts],
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        isLoadingMore: false,
      }));
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        '加载失败，请稍后重试';
      set({ error: message, isLoadingMore: false });
    }
  },

  publishPost: async (payload: CreatePostPayload) => {
    set({ isPublishing: true, publishError: null });
    try {
      const newPost = await createPost(payload);
      set((state) => ({
        posts: [newPost, ...state.posts],
        isPublishing: false,
      }));
      return newPost;
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        '发布失败，请稍后重试';
      set({ publishError: message, isPublishing: false });
      throw err;
    }
  },

  prependPost: (post: Post) => {
    set((state) => ({ posts: [post, ...state.posts] }));
  },

  clearPublishError: () => {
    set({ publishError: null });
  },

  updateUserAvatar: (username: string, avatarUrl: string) => {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.author.username === username) {
          return {
            ...post,
            author: { ...post.author, avatarUrl },
          };
        }
        return post;
      }),
    }));
  },
}));
