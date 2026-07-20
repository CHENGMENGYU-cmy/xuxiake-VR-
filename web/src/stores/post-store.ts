'use client';

import { create } from 'zustand';
import { Post } from '@/types';
import { createPost, getPosts, deletePost, updatePost, CreatePostPayload, PostSortType } from '@/lib/post-api';

interface PostFilters {
  postType?: string;
  tagId?: string;
  followingOnly?: boolean;
}

interface PostState {
  // 帖子列表
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // 分页状态
  nextCursor: string | null;
  hasMore: boolean;
  currentPage: number;
  currentSort: PostSortType;
  filters: PostFilters;

  // 发布状态
  isPublishing: boolean;
  publishError: string | null;

  // Actions
  fetchPosts: (sort?: PostSortType, filters?: PostFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  publishPost: (payload: CreatePostPayload) => Promise<Post>;
  prependPost: (post: Post) => void;
  clearPublishError: () => void;
  updateUserAvatar: (username: string, avatarUrl: string) => void;
  removePost: (postId: string) => Promise<void>;
  updatePostInList: (postId: string, updatedPost: Post) => void;
  updatePostLike: (postId: string, isLiked: boolean, likeCount: number) => void;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  nextCursor: null,
  hasMore: true,
  currentPage: 1,
  currentSort: 'latest',
  filters: {},
  isPublishing: false,
  publishError: null,

  fetchPosts: async (sort?: PostSortType, filters?: PostFilters) => {
    const sortType = sort || get().currentSort;
    const newFilters = filters !== undefined ? filters : get().filters;
    set({ isLoading: true, error: null, currentSort: sortType, filters: newFilters, currentPage: 1 });
    try {
      const params: any = { sort: sortType, ...newFilters };
      if (sortType === 'latest') {
        // cursor 分页
      } else {
        params.page = 1;
      }
      const result = await getPosts(params);
      const posts = result.posts ?? [];
      const uniquePosts = posts.filter((post, index, self) =>
        index === self.findIndex(p => p.id === post.id)
      );
      set({
        posts: uniquePosts,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        currentPage: 1,
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
    const { nextCursor, hasMore, isLoadingMore, posts, currentSort, currentPage, filters } = get();
    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });
    try {
      const params: any = { sort: currentSort, ...filters };
      if (currentSort === 'latest') {
        if (!nextCursor) return;
        params.cursor = nextCursor;
      } else {
        params.page = currentPage + 1;
      }

      const result = await getPosts(params);
      const newPosts = result.posts ?? [];
      const existingIds = new Set(posts.map(p => p.id));
      const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));

      set((state) => ({
        posts: [...state.posts, ...uniqueNewPosts],
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        currentPage: currentSort === 'latest' ? state.currentPage : state.currentPage + 1,
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

  removePost: async (postId: string) => {
    await deletePost(postId);
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    }));
  },

  updatePostInList: (postId: string, updatedPost: Post) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
    }));
  },

  updatePostLike: (postId: string, isLiked: boolean, likeCount: number) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, isLiked, likeCount } : p
      ),
    }));
  },
}));
