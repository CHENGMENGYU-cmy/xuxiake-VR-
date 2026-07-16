// ===== 用户类型 =====
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  xxkNumber: string;
  bio?: string | null;
  avatarUrl: string;
  website?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PRIVATE' | null;
  birthday?: string | null;
  region?: string | null;
  occupation?: string | null;
  vrDeviceInfo?: {
    model: string;
    version: string;
  };
  createdAt: string;
  interests?: InterestTag[];
}

// ===== 媒体类型 =====
export type MediaType = 'VIDEO' | 'IMAGE' | 'AUDIO' | 'LINK' | 'TRANSLATION';
export type VrFormat = 'STANDARD' | 'VR180' | 'VR360' | 'SPATIAL';
export type Visibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string | null;
  hlsUrl?: string | null;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  vrFormat?: VrFormat | null;
  // 翻译类型
  language?: string | null;
  translatedText?: string | null;
  // 链接类型
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkFavicon?: string | null;
  sortOrder: number;
}

// ===== 内容帖子 =====
export interface Post {
  id: string;
  content: string | null;
  mediaItems: MediaItem[];
  author: User;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  vrMetadata?: Record<string, unknown>;
  visibility: Visibility;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== 评论 =====
export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
}

// ===== 通知 =====
export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM' | 'MESSAGE';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  sender?: User;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

// ===== 聊天 =====
export type ConversationType = 'DIRECT' | 'GROUP';

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  members: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'FILE';
  createdAt: string;
}

// ===== 兴趣标签 =====
export type TagCategory = 'TRAVEL' | 'VR' | 'ACTIVITY' | 'CULTURE' | 'OTHER';

export interface InterestTag {
  id: string;
  name: string;
  category: TagCategory;
  icon?: string | null;
  sortOrder: number;
  isHot: boolean;
}

// ===== 社群 =====
export interface Community {
  id: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  conversationId: string;
  creator?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  tags?: InterestTag[];
  isMember?: boolean;
  isCreator?: boolean;
  createdAt: string;
}

// ===== 推荐用户 =====
export interface RecommendedUser extends User {
  matchReasons?: string[];
  matchScore?: number;
  isFollowing?: boolean;
}
