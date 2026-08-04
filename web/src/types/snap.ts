// ===== 闪拍/日记 类型定义 =====

export type DiaryStyle =
  | '温柔治愈风'
  | '生活碎片风'
  | '成长复盘风'
  | '诗意散文风'
  | '轻松口语风';

export const DiaryStyleLabel: Record<DiaryStyle, string> = {
  '温柔治愈风': '温柔治愈风',
  '生活碎片风': '生活碎片风',
  '成长复盘风': '成长复盘风',
  '诗意散文风': '诗意散文风',
  '轻松口语风': '轻松口语风',
};

export const ALL_DIARY_STYLES: DiaryStyle[] = [
  '温柔治愈风',
  '生活碎片风',
  '成长复盘风',
  '诗意散文风',
  '轻松口语风',
];

export interface SnapRecord {
  id: string;
  content: string | null;
  image?: string;
  mediaItems?: { url: string; thumbnailUrl?: string | null; type: string }[];
  keywords: string[];
  location: string;
  mood: string;
  scene: string;
  createdAt: string;
}

export interface GeneratedDiary {
  title: string;
  content: string;
  insight: string;
  tags: string[];
  style: DiaryStyle;
  snapId?: string;
  memorySnap?: { id: string; text: string | null; createdAt: string } | null;
}

export interface DiaryEntry {
  id: string;
  snapId?: string;
  title: string;
  content: string;
  insight: string;
  style: string;
  tags: string[];
  image?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
  status: 'draft' | 'private' | 'public';
  author?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  location?: { lat: number; lng: number; name: string } | null;
  mediaItems?: { url: string; thumbnailUrl?: string | null; type: string }[];
  createdAt: string;
  updatedAt: string;
}

export type DiaryStatus = 'draft' | 'private' | 'public';

export const DiaryStatusLabel: Record<DiaryStatus, string> = {
  draft: '草稿',
  private: '私密',
  public: '已发布',
};
