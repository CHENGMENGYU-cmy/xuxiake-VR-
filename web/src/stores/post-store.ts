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
  error: null,
  isPublishing: false,
  publishError: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getPosts();
      set({ posts: result.posts ?? [], isLoading: false });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        '加载失败，请稍后重试';
      set({ error: message, isLoading: false });
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
