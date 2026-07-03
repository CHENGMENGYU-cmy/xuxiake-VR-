-- ============================================================
-- XuXiaKe 种子数据
-- 所有用户密码: password123
-- Navicat: 右键 xuxiake → 运行 SQL 文件 → 选择此文件
-- ============================================================

USE xuxiake;

-- 强制连接使用 utf8mb4（emoji 等 4 字节字符需要）
SET NAMES utf8mb4;

-- 清除已有数据（按外键顺序删除）
DELETE FROM messages;
DELETE FROM conversation_participants;
DELETE FROM conversations;
DELETE FROM notifications;
DELETE FROM likes;
DELETE FROM comments;
DELETE FROM media_items;
DELETE FROM posts;
DELETE FROM user_follows;
DELETE FROM users;

-- ============================================================
-- 用户（密码均为 password123，bcrypt 哈希）
-- ============================================================
INSERT INTO users (id, email, username, password_hash, display_name, bio, avatar_url, website, vr_device_model, vr_device_version) VALUES
('u1', 'xuxiake@example.com', 'xuxiake', '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '徐霞客', '带着VR眼镜看世界 🌍 记录每一段旅程', 'https://api.dicebear.com/9.x/avataaars/svg?seed=xuxiake', 'https://xuxiake.com', 'Apple Vision Pro', '2.0'),
('u2', 'zhangshan@example.com', 'zhangshan', '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '张三', 'VR摄影师 | 旅行爱好者', 'https://api.dicebear.com/9.x/avataaars/svg?seed=zhangshan', NULL, NULL, NULL),
('u3', 'lisi@example.com', 'lisi', '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '李四', '科技评测 | VR内容创作者', 'https://api.dicebear.com/9.x/avataaars/svg?seed=lisi', NULL, NULL, NULL),
('u4', 'wangwu@example.com', 'wangwu', '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '王五', '环球旅行者 🌏 用VR记录世界', 'https://api.dicebear.com/9.x/avataaars/svg?seed=wangwu', NULL, NULL, NULL);

-- ============================================================
-- 关注关系
-- ============================================================
INSERT INTO user_follows (id, follower_id, following_id) VALUES
('f1', 'u1', 'u2'),
('f2', 'u1', 'u3'),
('f3', 'u2', 'u1'),
('f4', 'u3', 'u1'),
('f5', 'u4', 'u1'),
('f6', 'u2', 'u4');

-- ============================================================
-- 帖子
-- ============================================================
INSERT INTO posts (id, author_id, content, location_lat, location_lng, location_name, visibility, like_count, comment_count, view_count, created_at, updated_at) VALUES
('p1', 'u1', '今天在黄山用VR眼镜拍摄了360度全景视频！云海真的太壮观了，站在光明顶上的感觉就像在仙境一样 🏔️✨', 30.1297, 118.1649, '黄山风景区', 'PUBLIC', 128, 3, 1520, '2026-06-23 08:30:00', '2026-06-23 08:30:00'),
('p2', 'u1', '故宫博物院一游！用VR眼镜录了一段导游的中文讲解，还自动翻译成了英文版本，外国朋友也能看懂了 🏯', 39.9163, 116.3972, '故宫博物院', 'PUBLIC', 89, 2, 980, '2026-06-22 14:20:00', '2026-06-22 14:20:00'),
('p3', 'u3', '杭州西湖太美了！VR180度拍摄断桥残雪，还附上了百度百科链接，方便大家了解更多西湖的历史 🌊', 30.2590, 120.1449, '杭州西湖', 'PUBLIC', 56, 0, 720, '2026-06-21 16:45:00', '2026-06-21 16:45:00'),
('p4', 'u4', '张家界国家森林公园！用360度VR全景拍摄，仿佛置身阿凡达世界 🌿🌄', 29.3348, 110.4764, '张家界国家森林公园', 'PUBLIC', 203, 1, 2890, '2026-06-20 10:15:00', '2026-06-20 10:15:00'),
('p5', 'u2', '桂林山水甲天下！用空间视频记录漓江风光，配合中英文翻译，让全世界的朋友都能感受中国山水之美 🎥', 25.2736, 110.2902, '桂林漓江', 'PUBLIC', 167, 0, 2100, '2026-06-19 09:00:00', '2026-06-19 09:00:00'),
('p6', 'u1', '八达岭长城！用VR记录下这段伟大的历史遗迹 🏯🇨🇳', 40.3597, 116.0201, '八达岭长城', 'PUBLIC', 94, 2, 1350, '2026-06-18 11:30:00', '2026-06-18 11:30:00');

-- ============================================================
-- 媒体文件
-- ============================================================
-- 黄山帖子(p1): VR360视频 + 2张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m1', 'p1', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/huangshan1/800/450', 120, 1920, 1080, 'VR360', 0),
('m2', 'p1', 'IMAGE', 'https://picsum.photos/seed/huangshan2/800/600', 'https://picsum.photos/seed/huangshan2/400/300', NULL, 800, 600, NULL, 1),
('m3', 'p1', 'IMAGE', 'https://picsum.photos/seed/huangshan3/800/600', 'https://picsum.photos/seed/huangshan3/400/300', NULL, 800, 600, NULL, 2);

-- 故宫帖子(p2): 音频 + 翻译
INSERT INTO media_items (id, post_id, type, url, sort_order) VALUES
('m4', 'p2', 'AUDIO', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 0);
INSERT INTO media_items (id, post_id, type, language, translated_text, sort_order) VALUES
('m5', 'p2', 'TRANSLATION', 'zh-CN', '故宫，又称紫禁城，是中国明清两代的皇家宫殿，位于北京中轴线的中心。始建于明成祖永乐四年（1406年），到永乐十八年（1420年）建成。', 1);

-- 西湖帖子(p3): VR180视频 + 链接
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m6', 'p3', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4', 'https://picsum.photos/seed/westlake/800/450', 90, 1920, 1080, 'VR180', 0);
INSERT INTO media_items (id, post_id, type, link_url, link_title, link_description, link_favicon, sort_order) VALUES
('m7', 'p3', 'LINK', 'https://baike.baidu.com/item/西湖', '西湖 - 百度百科', '西湖，位于浙江省杭州市西面，是中国大陆首批国家重点风景名胜区之一', 'https://baidu.com/favicon.ico', 1);

-- 张家界帖子(p4): 3张VR360图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, vr_format, sort_order) VALUES
('m8',  'p4', 'IMAGE', 'https://picsum.photos/seed/zhangjiajie1/800/600', 'https://picsum.photos/seed/zhangjiajie1/400/300', 800, 600, 'VR360', 0),
('m9',  'p4', 'IMAGE', 'https://picsum.photos/seed/zhangjiajie2/800/600', 'https://picsum.photos/seed/zhangjiajie2/400/300', 800, 600, 'VR360', 1),
('m10', 'p4', 'IMAGE', 'https://picsum.photos/seed/zhangjiajie3/800/600', 'https://picsum.photos/seed/zhangjiajie3/400/300', 800, 600, 'VR360', 2);

-- 桂林帖子(p5): 空间视频 + 英文翻译
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m11', 'p5', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/guilin/800/450', 150, 3840, 2160, 'SPATIAL', 0);
INSERT INTO media_items (id, post_id, type, language, translated_text, sort_order) VALUES
('m12', 'p5', 'TRANSLATION', 'en', 'Guilin landscape is the best under heaven. The Li River winds through the karst mountains, creating a breathtaking natural scenery.', 1);

-- 长城帖子(p6): 图片 + 链接
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m13', 'p6', 'IMAGE', 'https://picsum.photos/seed/greatwall/800/600', 'https://picsum.photos/seed/greatwall/400/300', 800, 600, 0);
INSERT INTO media_items (id, post_id, type, link_url, link_title, link_description, link_favicon, sort_order) VALUES
('m14', 'p6', 'LINK', 'https://baike.baidu.com/item/长城', '长城 - 世界文化遗产', '长城是中国古代的军事防御工程，是世界文化遗产，也是世界新七大奇迹之一', 'https://baidu.com/favicon.ico', 1);

-- ============================================================
-- 评论
-- ============================================================
INSERT INTO comments (id, post_id, author_id, parent_id, content, created_at) VALUES
('c1', 'p1', 'u2', NULL, '黄山云海真的太美了！用VR看肯定超级震撼 😍', '2026-06-23 09:15:00'),
('c2', 'p1', 'u3', NULL, '你用的是什么设备拍的？画质看起来很好', '2026-06-23 10:30:00'),
('c3', 'p1', 'u1', 'c2', 'Apple Vision Pro，空间视频模式拍的', '2026-06-23 10:45:00'),
('c4', 'p2', 'u4', NULL, '故宫的历史感在VR里一定很特别', '2026-06-22 18:30:00'),
('c5', 'p2', 'u2', NULL, '翻译功能太实用了！外国朋友也能看懂', '2026-06-22 19:00:00'),
('c6', 'p4', 'u1', NULL, '张家界真的太壮观了，下次一起去！', '2026-06-20 14:00:00'),
('c7', 'p6', 'u3', NULL, '长城是每个中国人的骄傲 🇨🇳', '2026-06-18 15:00:00'),
('c8', 'p6', 'u2', NULL, '用VR看长城，身临其境的感觉！', '2026-06-18 16:30:00');

-- ============================================================
-- 点赞
-- ============================================================
INSERT INTO likes (id, user_id, post_id, created_at) VALUES
('lk1', 'u1', 'p2', '2026-06-22 20:00:00'),
('lk2', 'u2', 'p1', '2026-06-23 09:00:00'),
('lk3', 'u2', 'p5', '2026-06-19 12:00:00'),
('lk4', 'u3', 'p1', '2026-06-23 10:00:00'),
('lk5', 'u3', 'p4', '2026-06-21 08:00:00'),
('lk6', 'u4', 'p1', '2026-06-23 11:00:00'),
('lk7', 'u1', 'p4', '2026-06-20 15:00:00'),
('lk8', 'u1', 'p5', '2026-06-19 18:00:00');

-- ============================================================
-- 通知
-- ============================================================
INSERT INTO notifications (id, recipient_id, sender_id, type, message, post_id, is_read, created_at) VALUES
('n1', 'u1', 'u2', 'LIKE', '张三 赞了你在黄山的VR视频', 'p1', 0, '2026-06-23 09:15:00'),
('n2', 'u1', 'u3', 'COMMENT', '李四 评论了你在故宫的内容', 'p2', 0, '2026-06-22 18:30:00'),
('n3', 'u1', 'u4', 'COMMENT', '王五 评论了你的帖子', 'p4', 1, '2026-06-20 14:00:00'),
('n4', 'u1', 'u4', 'FOLLOW', '王五 关注了你', NULL, 1, '2026-06-22 12:00:00'),
('n5', 'u1', NULL, 'SYSTEM', '欢迎来到徐霞客！开始你的VR旅程吧 🎉', NULL, 0, '2026-06-15 08:00:00'),
('n6', 'u1', 'u2', 'COMMENT', '张三 评论了你的帖子', 'p6', 0, '2026-06-18 16:30:00');

-- ============================================================
-- 会话
-- ============================================================
INSERT INTO conversations (id, type, title, created_at, updated_at) VALUES
('conv1', 'DIRECT', NULL, '2026-06-23 10:30:00', '2026-06-23 10:30:00'),
('conv2', 'DIRECT', NULL, '2026-06-22 15:00:00', '2026-06-22 15:00:00'),
('conv3', 'GROUP', 'VR旅行爱好者群', '2026-06-21 20:00:00', '2026-06-21 20:00:00');

INSERT INTO conversation_participants (id, conversation_id, user_id, joined_at) VALUES
('cp1', 'conv1', 'u1', '2026-06-23 10:30:00'),
('cp2', 'conv1', 'u2', '2026-06-23 10:30:00'),
('cp3', 'conv2', 'u1', '2026-06-22 15:00:00'),
('cp4', 'conv2', 'u3', '2026-06-22 15:00:00'),
('cp5', 'conv3', 'u1', '2026-06-21 20:00:00'),
('cp6', 'conv3', 'u2', '2026-06-21 20:00:00'),
('cp7', 'conv3', 'u3', '2026-06-21 20:00:00'),
('cp8', 'conv3', 'u4', '2026-06-21 20:00:00');

INSERT INTO messages (id, conversation_id, sender_id, content, created_at) VALUES
('msg1', 'conv1', 'u2', '你拍的黄山VR视频太震撼了！是用什么设备拍的？', '2026-06-23 10:30:00'),
('msg2', 'conv2', 'u1', '好的，下次一起去桂林拍VR！', '2026-06-22 15:00:00'),
('msg3', 'conv3', 'u4', '推荐一个拍360全景的好地方——九寨沟！', '2026-06-21 20:00:00');
