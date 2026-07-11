// ===== 用户接口 =====
export interface IUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  passwordHash: string;
  bio?: string | null;
  avatarUrl: string;
  website?: string | null;
  vrDeviceInfo?: { model: string; version: string } | null;
  createdAt: string;
}

// ===== 媒体类型 =====
export type MediaType = 'VIDEO' | 'IMAGE' | 'AUDIO' | 'LINK' | 'TRANSLATION';
export type VrFormat = 'STANDARD' | 'VR180' | 'VR360' | 'SPATIAL';
export type Visibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM' | 'MESSAGE';

export interface IMediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string | null;
  hlsUrl?: string | null;
  duration?: number | null;
  width?: number | null;
  height?: number | null;
  vrFormat?: VrFormat | null;
  language?: string | null;
  translatedText?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkFavicon?: string | null;
  sortOrder: number;
}

// ===== 帖子接口 =====
export interface IPost {
  id: string;
  content: string | null;
  mediaItems: IMediaItem[];
  authorId: string;
  location?: { lat: number; lng: number; name: string } | null;
  vrMetadata?: Record<string, unknown> | null;
  visibility: Visibility;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ===== 评论接口 =====
export interface IComment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string | null;
  createdAt: string;
}

// ===== 通知接口 =====
export interface INotification {
  id: string;
  type: NotificationType;
  message: string;
  recipientId: string;
  senderId?: string | null;
  postId?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ===== 聊天接口 =====
export type ConversationType = 'DIRECT' | 'GROUP';

export interface IConversation {
  id: string;
  type: ConversationType;
  title?: string | null;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: string;
}

// ===== 认证接口 =====
// 登录（邮箱/用户名 + 密码）
export interface LoginDto {
  account: string; // 邮箱或用户名
  password: string;
  captchaKey: string;
  captchaCode: string;
}

// 手机号验证码登录
export interface LoginSmsDto {
  phone: string;
  smsCode: string;
}

// 发送短信验证码
export interface SendSmsCodeDto {
  phone: string;
}

// 邮箱注册
export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

// 手机号注册
export interface RegisterPhoneDto {
  phone: string;
  smsCode: string;
  username: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface CreatePostDto {
  content?: string;
  mediaItems?: Omit<IMediaItem, 'id'>[];
  location?: { lat: number; lng: number; name: string };
  vrMetadata?: Record<string, unknown>;
  visibility?: Visibility;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

export interface SendMessageDto {
  conversationId: string;
  content?: string;
}

// ===== API 响应接口 =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  cursor?: string;
  hasMore: boolean;
  total?: number;
}
