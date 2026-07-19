import apiClient from './api-client';

export interface Draft {
  id: string;
  content: string;
  postType: string;
  formData: Record<string, any>;
  autoSavedAt: string;
  createdAt: string;
}

// 本地草稿存储键
const DRAFT_KEY = 'xuxiake_draft';
const DRAFT_LIST_KEY = 'xuxiake_draft_list';

// 自动保存草稿到本地存储
export function saveDraftToLocal(draft: {
  content: string;
  postType: string;
  formData: Record<string, any>;
}): void {
  try {
    const draftData = {
      ...draft,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  } catch (error) {
    console.error('保存草稿失败:', error);
  }
}

// 从本地存储加载草稿
export function loadDraftFromLocal(): {
  content: string;
  postType: string;
  formData: Record<string, any>;
  savedAt: string;
} | null {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('加载草稿失败:', error);
    return null;
  }
}

// 清除本地草稿
export function clearLocalDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.error('清除草稿失败:', error);
  }
}

// 保存草稿到草稿列表
export function saveDraftToList(draft: {
  id: string;
  title: string;
  content: string;
  postType: string;
  preview?: string;
}): void {
  try {
    const existingList = getDraftList();
    const newDraft = {
      ...draft,
      savedAt: new Date().toISOString(),
    };

    // 更新或添加
    const index = existingList.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      existingList[index] = newDraft;
    } else {
      existingList.unshift(newDraft);
    }

    // 最多保存20个草稿
    const trimmedList = existingList.slice(0, 20);
    localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(trimmedList));
  } catch (error) {
    console.error('保存草稿列表失败:', error);
  }
}

// 获取草稿列表
export function getDraftList(): Array<{
  id: string;
  title: string;
  content: string;
  postType: string;
  preview?: string;
  savedAt: string;
}> {
  try {
    const data = localStorage.getItem(DRAFT_LIST_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('获取草稿列表失败:', error);
    return [];
  }
}

// 从草稿列表删除
export function deleteDraftFromList(draftId: string): void {
  try {
    const existingList = getDraftList();
    const newList = existingList.filter((d) => d.id !== draftId);
    localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(newList));
  } catch (error) {
    console.error('删除草稿失败:', error);
  }
}

// 服务端草稿API（可选，用于跨设备同步）
export async function saveDraftToServer(draft: {
  content: string;
  postType: string;
  formData: Record<string, any>;
}): Promise<Draft> {
  const { data } = await apiClient.post('/posts/drafts', draft);
  return data.data;
}

export async function getServerDrafts(): Promise<Draft[]> {
  const { data } = await apiClient.get('/posts/drafts');
  return data.data ?? [];
}

export async function deleteServerDraft(draftId: string): Promise<void> {
  await apiClient.delete(`/posts/drafts/${draftId}`);
}
