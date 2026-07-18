import { v4 as uuidv4 } from 'uuid';
import {
  IUser,
  IPost,
  IMediaItem,
  INotification,
  IConversation,
  IMessage,
  IComment,
} from './interfaces.js';

// ===== 预定义用户 =====
export const mockUsers: IUser[] = [
  {
    id: 'u1',
    email: 'xuxiake@example.com',
    username: 'xuxiake',
    displayName: '徐霞客',
    passwordHash: 'hashed_password_123',
    bio: '带着VR眼镜看世界 🌍 记录每一段旅程',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=xuxiake',
    vrDeviceInfo: { model: 'Apple Vision Pro', version: '2.0' },
    website: 'https://xuxiake.com',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'u2',
    email: 'zhangshan@example.com',
    username: 'zhangshan',
    displayName: '张三',
    passwordHash: 'hashed_password_456',
    bio: 'VR摄影师 | 旅行爱好者',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=zhangshan',
    createdAt: '2025-02-20T10:30:00Z',
  },
  {
    id: 'u3',
    email: 'lisi@example.com',
    username: 'lisi',
    displayName: '李四',
    passwordHash: 'hashed_password_789',
    bio: '科技评测 | VR内容创作者',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=lisi',
    createdAt: '2025-03-10T14:00:00Z',
  },
  {
    id: 'u4',
    email: 'wangwu@example.com',
    username: 'wangwu',
    displayName: '王五',
    passwordHash: 'hashed_password_012',
    bio: '环球旅行者 🌏 用VR记录世界',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=wangwu',
    createdAt: '2025-04-05T09:15:00Z',
  },
];

// ===== 预定义帖子 =====
export const mockPosts: IPost[] = [
  {
    id: 'p1',
    content: '今天在黄山用VR眼镜拍摄了360度全景视频！云海真的太壮观了，站在光明顶上的感觉就像在仙境一样 🏔️✨',
    mediaItems: [
      { id: 'm1', type: 'VIDEO', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', thumbnailUrl: 'https://picsum.photos/seed/huangshan1/800/450', duration: 120, vrFormat: 'VR360', sortOrder: 0 },
      { id: 'm2', type: 'IMAGE', url: 'https://picsum.photos/seed/huangshan2/800/600', thumbnailUrl: 'https://picsum.photos/seed/huangshan2/400/300', sortOrder: 1 },
      { id: 'm3', type: 'IMAGE', url: 'https://picsum.photos/seed/huangshan3/800/600', thumbnailUrl: 'https://picsum.photos/seed/huangshan3/400/300', sortOrder: 2 },
    ],
    authorId: 'u1',
    postType: 'VR_MEDIA',
    location: { lat: 30.1297, lng: 118.1649, name: '黄山风景区' },
    vrMetadata: { device: 'Apple Vision Pro', resolution: '4K' },
    visibility: 'PUBLIC',
    likeCount: 128,
    commentCount: 32,
    viewCount: 1520,
    createdAt: '2026-06-23T08:30:00Z',
    updatedAt: '2026-06-23T08:30:00Z',
  },
  {
    id: 'p2',
    content: '故宫博物院一游！用VR眼镜录了一段导游的中文讲解，还自动翻译成了英文版本，外国朋友也能看懂了 🏯',
    mediaItems: [
      { id: 'm4', type: 'AUDIO', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 180, sortOrder: 0 },
      { id: 'm5', type: 'TRANSLATION', url: '', language: 'zh-CN', translatedText: '故宫，又称紫禁城，是中国明清两代的皇家宫殿...', sortOrder: 1 },
    ],
    authorId: 'u1',
    postType: 'NOTE',
    location: { lat: 39.9163, lng: 116.3972, name: '故宫博物院' },
    visibility: 'PUBLIC',
    likeCount: 89,
    commentCount: 15,
    viewCount: 980,
    createdAt: '2026-06-22T14:20:00Z',
    updatedAt: '2026-06-22T14:20:00Z',
  },
  {
    id: 'p3',
    content: '杭州西湖太美了！VR180度拍摄断桥残雪，还附上了百科链接 🌊',
    mediaItems: [
      { id: 'm6', type: 'VIDEO', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4', thumbnailUrl: 'https://picsum.photos/seed/westlake/800/450', duration: 90, vrFormat: 'VR180', sortOrder: 0 },
      { id: 'm7', type: 'LINK', url: '', linkUrl: 'https://baike.baidu.com/item/西湖', linkTitle: '西湖 - 百度百科', linkDescription: '西湖位于浙江省杭州市...', sortOrder: 1 },
    ],
    authorId: 'u3',
    postType: 'NOTE',
    location: { lat: 30.259, lng: 120.1449, name: '杭州西湖' },
    visibility: 'PUBLIC',
    likeCount: 56,
    commentCount: 8,
    viewCount: 720,
    createdAt: '2026-06-21T16:45:00Z',
    updatedAt: '2026-06-21T16:45:00Z',
  },
  {
    id: 'p4',
    content: '张家界国家森林公园！用360度VR全景拍摄，仿佛置身阿凡达世界 🌿🌄',
    mediaItems: [
      { id: 'm8', type: 'IMAGE', url: 'https://picsum.photos/seed/zhangjiajie1/800/600', vrFormat: 'VR360', sortOrder: 0 },
      { id: 'm9', type: 'IMAGE', url: 'https://picsum.photos/seed/zhangjiajie2/800/600', vrFormat: 'VR360', sortOrder: 1 },
      { id: 'm10', type: 'IMAGE', url: 'https://picsum.photos/seed/zhangjiajie3/800/600', vrFormat: 'VR360', sortOrder: 2 },
    ],
    authorId: 'u4',
    postType: 'VR_MEDIA',
    location: { lat: 29.3348, lng: 110.4764, name: '张家界国家森林公园' },
    vrMetadata: { device: 'Meta Quest 4', resolution: '8K' },
    visibility: 'PUBLIC',
    likeCount: 203,
    commentCount: 45,
    viewCount: 2890,
    createdAt: '2026-06-20T10:15:00Z',
    updatedAt: '2026-06-20T10:15:00Z',
  },
  {
    id: 'p5',
    content: '桂林山水甲天下！用空间视频记录漓江风光，配合中英文翻译 🎥',
    mediaItems: [
      { id: 'm11', type: 'VIDEO', url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', thumbnailUrl: 'https://picsum.photos/seed/guilin/800/450', duration: 150, vrFormat: 'SPATIAL', sortOrder: 0 },
      { id: 'm12', type: 'TRANSLATION', url: '', language: 'en', translatedText: 'Guilin landscape is the best under heaven...', sortOrder: 1 },
    ],
    authorId: 'u2',
    postType: 'VR_MEDIA',
    location: { lat: 25.2736, lng: 110.2902, name: '桂林漓江' },
    vrMetadata: { device: 'Apple Vision Pro', resolution: '4K' },
    visibility: 'PUBLIC',
    likeCount: 167,
    commentCount: 28,
    viewCount: 2100,
    createdAt: '2026-06-19T09:00:00Z',
    updatedAt: '2026-06-19T09:00:00Z',
  },
  {
    id: 'p6',
    content: '八达岭长城！用VR记录下这段伟大的历史遗迹，并附上了详细的百科介绍 🏯🇨🇳',
    mediaItems: [
      { id: 'm13', type: 'IMAGE', url: 'https://picsum.photos/seed/greatwall/800/600', sortOrder: 0 },
      { id: 'm14', type: 'LINK', url: '', linkUrl: 'https://baike.baidu.com/item/长城', linkTitle: '长城 - 世界文化遗产', linkDescription: '长城是中国古代的军事防御工程...', sortOrder: 1 },
    ],
    authorId: 'u1',
    postType: 'NOTE',
    location: { lat: 40.3597, lng: 116.0201, name: '八达岭长城' },
    visibility: 'PUBLIC',
    likeCount: 94,
    commentCount: 19,
    viewCount: 1350,
    createdAt: '2026-06-18T11:30:00Z',
    updatedAt: '2026-06-18T11:30:00Z',
  },
];

// ===== 预定义评论 =====
export const mockComments: IComment[] = [
  { id: 'c1', content: '太美了！黄山的云海真的像仙境一样！', authorId: 'u2', postId: 'p1', createdAt: '2026-06-23T09:00:00Z' },
  { id: 'c2', content: '这个翻译功能太实用了！外国友人也能看懂故宫的历史', authorId: 'u3', postId: 'p2', createdAt: '2026-06-22T15:00:00Z' },
  { id: 'c3', content: '下次我也要去西湖拍VR', authorId: 'u1', postId: 'p3', createdAt: '2026-06-21T18:00:00Z' },
];

// ===== 预定义通知 =====
export const mockNotifications: INotification[] = [
  { id: 'n1', type: 'LIKE', message: '张三 赞了你在黄山的VR视频', recipientId: 'u1', senderId: 'u2', postId: 'p1', isRead: false, createdAt: '2026-06-23T09:15:00Z' },
  { id: 'n2', type: 'COMMENT', message: '李四 评论了你在故宫的内容', recipientId: 'u1', senderId: 'u3', postId: 'p2', isRead: false, createdAt: '2026-06-22T18:30:00Z' },
  { id: 'n3', type: 'FOLLOW', message: '王五 关注了你', recipientId: 'u1', senderId: 'u4', isRead: true, createdAt: '2026-06-22T12:00:00Z' },
  { id: 'n4', type: 'MESSAGE', message: '张三 给你发了一条消息', recipientId: 'u1', senderId: 'u2', isRead: false, createdAt: '2026-06-23T10:00:00Z' },
  { id: 'n5', type: 'SYSTEM', message: '欢迎来到徐霞客系统！', recipientId: 'u1', isRead: true, createdAt: '2026-06-15T08:00:00Z' },
];

// ===== 预定义会话和消息 =====
export const mockConversations: IConversation[] = [
  { id: 'conv1', type: 'DIRECT', memberIds: ['u1', 'u2'], createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-06-23T10:30:00Z' },
  { id: 'conv2', type: 'DIRECT', memberIds: ['u1', 'u3'], createdAt: '2026-06-21T14:00:00Z', updatedAt: '2026-06-22T15:00:00Z' },
  { id: 'conv3', type: 'GROUP', title: 'VR旅行爱好者群', memberIds: ['u1', 'u2', 'u3', 'u4'], createdAt: '2026-06-15T08:00:00Z', updatedAt: '2026-06-21T20:00:00Z' },
];

export const mockMessages: IMessage[] = [
  { id: 'msg1', conversationId: 'conv1', senderId: 'u2', content: '你拍的黄山VR视频太震撼了！是用什么设备拍的？', createdAt: '2026-06-23T10:30:00Z' },
  { id: 'msg2', conversationId: 'conv1', senderId: 'u1', content: '用的Apple Vision Pro，空间视频效果特别好！', createdAt: '2026-06-23T10:32:00Z' },
  { id: 'msg3', conversationId: 'conv2', senderId: 'u3', content: '下次一起去桂林拍VR！', createdAt: '2026-06-22T14:30:00Z' },
  { id: 'msg4', conversationId: 'conv2', senderId: 'u1', content: '好的！一言为定 ✋', createdAt: '2026-06-22T15:00:00Z' },
  { id: 'msg5', conversationId: 'conv3', senderId: 'u4', content: '推荐一个拍360全景的好地方——九寨沟！', createdAt: '2026-06-21T20:00:00Z' },
];

// ===== 辅助函数 =====
export function generateId(): string {
  return uuidv4();
}

export function getUserPublic(user: IUser): Omit<IUser, 'passwordHash'> {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export function getPostWithAuthor(post: IPost): any {
  const author = mockUsers.find((u) => u.id === post.authorId);
  return {
    ...post,
    author: author ? getUserPublic(author) : null,
    isLiked: false,
  };
}
