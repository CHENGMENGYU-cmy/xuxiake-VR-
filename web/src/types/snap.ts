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

// ===== 游记生成相关类型 =====

export interface TravelogueGenerateInput {
  logIds: string[];
  diaryIds: string[];
  prompt?: string;
  style?: string;
  tone?: string;
  length?: string;
}

export interface TravelogueJob {
  id: string;
  status: 'QUEUED' | 'ANALYZING' | 'GENERATING' | 'DONE' | 'ERROR';
  progress: number;
  result?: string;
  postId?: string;
  error?: string;
  createdAt: string;
}

export const TravelogueStyleOptions = [
  { value: '游记', label: '游记' },
  { value: '日记', label: '日记' },
];

export const TravelogueToneOptions = [
  { value: '纪实', label: '纪实' },
  { value: '温暖', label: '温暖' },
  { value: '轻松', label: '轻松' },
];

export const TravelogueLengthOptions = [
  { value: '简短', label: '简短' },
  { value: '标准', label: '标准' },
  { value: '详细', label: '详细' },
];
