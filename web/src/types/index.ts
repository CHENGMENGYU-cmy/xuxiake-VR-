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
export type PostType = 'NOTE' | 'VR_MEDIA' | 'ROUTE' | 'JOURNEY' | 'GUIDE' | 'MOMENT';

export interface Post {
  id: string;
  content: string | null;
  mediaItems: MediaItem[];
  author: User;
  postType: PostType;
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
  tags?: InterestTag[];
  topics?: Topic[];
  createdAt: string;
  updatedAt: string;
}

// ===== 话题 =====
export interface Topic {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  coverUrl?: string | null;
  postCount: number;
  isHot: boolean;
  createdAt: string;
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
  coverUrl?: string | null;
  rules?: string | null;
  category?: string | null;
  locationName?: string | null;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  status?: 'ACTIVE' | 'DISSOLVED';
  conversationId: string;
  creator?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  tags?: InterestTag[];
  members?: User[];
  isMember?: boolean;
  isCreator?: boolean;
  isAdmin?: boolean;
  createdAt: string;
}

// ===== 推荐社群 =====
export interface RecommendedCommunity extends Community {
  matchScore: number;
  matchReasons: { type: string; text: string }[];
  friendsInCommunity?: { id: string; displayName: string; avatarUrl?: string | null }[];
  recentPostCount?: number;
}

// ===== 社群公告 =====
export interface CommunityAnnouncement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// ===== 社群角色 =====
export type CommunityRoleType = 'ADMIN' | 'MODERATOR';

export interface CommunityRole {
  id: string;
  userId: string;
  role: CommunityRoleType;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

// ===== 社群挑战 =====
export type ChallengeType = 'PHOTO' | 'ROUTE' | 'CHECKIN' | 'DISTANCE';
export type ChallengeStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';

export interface CommunityChallenge {
  id: string;
  title: string;
  description?: string | null;
  type: ChallengeType;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  participantCount: number;
  status: ChallengeStatus;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  createdAt: string;
}

// ===== 挑战排行榜 =====
export interface ChallengeLeaderboardEntry {
  rank: number;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  } | null;
  note?: string | null;
  score: number;
  postId?: string | null;
  joinedAt: string;
}

// ===== 推荐用户 =====
export interface RecommendedUser extends User {
  matchReasons?: string[];
  matchScore?: number;
  isFollowing?: boolean;
  postCount?: number;
  totalLikes?: number;
  representativePosts?: {
    id: string;
    content: string | null;
    thumbnailUrl: string | null;
    locationName: string | null;
  }[];
  mutualFriends?: {
    count: number;
    names: string[];
  };
}
