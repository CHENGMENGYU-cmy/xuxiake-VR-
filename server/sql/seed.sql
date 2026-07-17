-- ============================================================
-- XuXiaKe 种子数据（扩充版）
-- 所有用户密码: password123
-- Navicat: 右键 xuxiake → 运行 SQL 文件 → 选择此文件
-- ============================================================

USE xuxiake;

-- 强制连接使用 utf8mb4（emoji 等 4 字节字符需要）
SET NAMES utf8mb4;

-- 清除已有数据（按外键顺序删除）
DELETE FROM community_tags;
DELETE FROM communities;
DELETE FROM user_interests;
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
INSERT INTO users (id, email, username, password_hash, display_name, xxk_number, bio, avatar_url, website, gender, birthday, region, occupation, vr_device_model, vr_device_version) VALUES
('u1',  'xuxiake@example.com',    'xuxiake',   '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '徐霞客',   '10000000001', '带着VR眼镜看世界 🌍 记录每一段旅程',      'https://api.dicebear.com/9.x/avataaars/svg?seed=xuxiake',   'https://xuxiake.com',       'MALE',   '1990-03-15', '江苏',  '旅行博主',       'Apple Vision Pro', '2.0'),
('u2',  'zhangshan@example.com',   'zhangshan', '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '张三',     '10000000002', 'VR摄影师 | 旅行爱好者',                   'https://api.dicebear.com/9.x/avataaars/svg?seed=zhangshan',  NULL,                        'MALE',   '1992-07-22', '北京',  '摄影师',         'Insta360 X4',      '3.1'),
('u3',  'lisi@example.com',        'lisi',      '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '李四',     '10000000003', '科技评测 | VR内容创作者',                 'https://api.dicebear.com/9.x/avataaars/svg?seed=lisi',       'https://techblog.example.com', 'MALE',   '1988-11-05', '广东',  '科技博主',       'Meta Quest 3',     'v67'),
('u4',  'wangwu@example.com',      'wangwu',    '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '王五',     '10000000004', '环球旅行者 🌏 用VR记录世界',              'https://api.dicebear.com/9.x/avataaars/svg?seed=wangwu',     NULL,                        'MALE',   '1995-01-30', '四川',  '自由职业',       'Apple Vision Pro', '2.0'),
('u5',  'zhaoliu@example.com',     'zhaoliu',   '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '赵六',     '10000000005', '户外探险家 | 登山爱好者 🏔️',             'https://api.dicebear.com/9.x/avataaars/svg?seed=zhaoliu',    NULL,                        'MALE',   '1985-09-12', '云南',  '户外教练',       'GoPro Max',        '2.0'),
('u6',  'sunqi@example.com',       'sunqi',     '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '孙七',     '10000000006', '美食旅行家 🍜 用味蕾丈量世界',            'https://api.dicebear.com/9.x/avataaars/svg?seed=sunqi',      NULL,                        'FEMALE', '1993-05-18', '湖南',  '美食博主',       NULL,               NULL),
('u7',  'zhouba@example.com',      'zhouba',    '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '周八',     '10000000007', '建筑设计师 | 城市漫步者 🏛️',             'https://api.dicebear.com/9.x/avataaars/svg?seed=zhouba',     'https://arch-design.com',    'FEMALE', '1991-12-08', '上海',  '建筑师',         'Samsung Gear VR',  '3.0'),
('u8',  'wujiu@example.com',       'wujiu',     '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '吴九',     '10000000008', '潜水教练 🤿 探索海底世界',               'https://api.dicebear.com/9.x/avataaars/svg?seed=wujiu',      NULL,                        'MALE',   '1987-04-25', '海南',  '潜水教练',       'Insta360 X4',      '3.1'),
('u9',  'zhengshi@example.com',    'zhengshi',  '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '郑十',     '10000000009', '历史教师 | 文化遗产守护者 📜',            'https://api.dicebear.com/9.x/avataaars/svg?seed=zhengshi',   NULL,                        'FEMALE', '1986-08-03', '陕西',  '历史教师',       NULL,               NULL),
('u10', 'qianyi@example.com',      'qianyi',    '$2b$10$EF2qoFpwK6CnqrcHcySFv.2WT7mpqkIS1kbjXpDPgERX16htd3QQe', '钱一',     '10000000010', '滑雪爱好者 ⛷️ 冬天在雪山上',             'https://api.dicebear.com/9.x/avataaars/svg?seed=qianyi',     NULL,                        'MALE',   '1994-02-14', '黑龙江', '体育教练',      'Apple Vision Pro', '2.0');

-- ============================================================
-- 关注关系
-- ============================================================
INSERT INTO user_follows (id, follower_id, following_id) VALUES
('f1',  'u1', 'u2'),
('f2',  'u1', 'u3'),
('f3',  'u2', 'u1'),
('f4',  'u3', 'u1'),
('f5',  'u4', 'u1'),
('f6',  'u2', 'u4'),
('f7',  'u1', 'u5'),
('f8',  'u1', 'u6'),
('f9',  'u5', 'u1'),
('f10', 'u6', 'u1'),
('f11', 'u7', 'u1'),
('f12', 'u8', 'u1'),
('f13', 'u9', 'u1'),
('f14', 'u10','u1'),
('f15', 'u2', 'u3'),
('f16', 'u3', 'u2'),
('f17', 'u4', 'u5'),
('f18', 'u5', 'u4'),
('f19', 'u6', 'u7'),
('f20', 'u7', 'u6'),
('f21', 'u8', 'u9'),
('f22', 'u9', 'u8'),
('f23', 'u10','u2'),
('f24', 'u2', 'u10'),
('f25', 'u3', 'u5'),
('f26', 'u4', 'u6'),
('f27', 'u5', 'u7'),
('f28', 'u6', 'u8'),
('f29', 'u7', 'u9'),
('f30', 'u8', 'u10');

-- ============================================================
-- 帖子
-- ============================================================
INSERT INTO posts (id, author_id, content, location_lat, location_lng, location_name, visibility, like_count, comment_count, view_count, created_at, updated_at) VALUES
-- u1 徐霞客的帖子
('p1',  'u1', '今天在黄山用VR眼镜拍摄了360度全景视频！云海真的太壮观了，站在光明顶上的感觉就像在仙境一样 🏔️✨', 30.1297, 118.1649, '黄山风景区', 'PUBLIC', 128, 3, 1520, '2026-06-23 08:30:00', '2026-06-23 08:30:00'),
('p2',  'u1', '故宫博物院一游！用VR眼镜录了一段导游的中文讲解，还自动翻译成了英文版本，外国朋友也能看懂了 🏯', 39.9163, 116.3972, '故宫博物院', 'PUBLIC', 89, 2, 980, '2026-06-22 14:20:00', '2026-06-22 14:20:00'),
('p6',  'u1', '八达岭长城！用VR记录下这段伟大的历史遗迹 🏯🇨🇳', 40.3597, 116.0201, '八达岭长城', 'PUBLIC', 94, 2, 1350, '2026-06-18 11:30:00', '2026-06-18 11:30:00'),
('p11', 'u1', '九寨沟的水真的是五彩斑斓！用VR360拍摄了整个五花海，戴上眼镜就像漂浮在水面上一样 🌈💧', 33.2600, 103.9200, '九寨沟风景区', 'PUBLIC', 215, 4, 3200, '2026-06-15 09:00:00', '2026-06-15 09:00:00'),
('p12', 'u1', '布达拉宫的日出太震撼了！凌晨四点爬起来用VR记录下了整个日出过程，金光洒在宫殿上的那一刻，感觉心灵都被洗涤了 🌅🏯', 29.6577, 91.1172, '布达拉宫', 'PUBLIC', 342, 5, 4500, '2026-06-10 06:00:00', '2026-06-10 06:00:00'),

-- u2 张三的帖子
('p5',  'u2', '桂林山水甲天下！用空间视频记录漓江风光，配合中英文翻译，让全世界的朋友都能感受中国山水之美 🎥', 25.2736, 110.2902, '桂林漓江', 'PUBLIC', 167, 0, 2100, '2026-06-19 09:00:00', '2026-06-19 09:00:00'),
('p13', 'u2', '敦煌莫高窟的壁画太精美了！用微距VR拍摄了几个经典洞窟，每一幅壁画都值得细细品味 🎨', 40.0422, 94.8097, '敦煌莫高窟', 'PUBLIC', 178, 3, 2800, '2026-06-08 10:30:00', '2026-06-08 10:30:00'),
('p14', 'u2', '在鼓浪屿的小巷里迷路了，但意外发现了一家超棒的咖啡馆！用VR拍下了这条充满文艺气息的小巷 ☕🏝️', 24.4489, 118.0677, '厦门鼓浪屿', 'PUBLIC', 95, 1, 1200, '2026-06-05 15:20:00', '2026-06-05 15:20:00'),

-- u3 李四的帖子
('p3',  'u3', '杭州西湖太美了！VR180度拍摄断桥残雪，还附上了百度百科链接，方便大家了解更多西湖的历史 🌊', 30.2590, 120.1449, '杭州西湖', 'PUBLIC', 56, 0, 720, '2026-06-21 16:45:00', '2026-06-21 16:45:00'),
('p15', 'u3', '测评了一下最新款的VR相机，画质提升太明显了！4K 360度拍摄，细节保留得非常好，推荐给所有VR创作者 📷✨', NULL, NULL, NULL, 'PUBLIC', 234, 6, 5600, '2026-06-03 14:00:00', '2026-06-03 14:00:00'),
('p16', 'u3', '乌镇的夜景用VR拍摄效果太棒了！灯火阑珊的水乡古镇，配上评弹的背景音乐，太有感觉了 🏮', 30.7427, 120.4937, '乌镇', 'PUBLIC', 112, 2, 1800, '2026-05-28 20:30:00', '2026-05-28 20:30:00'),

-- u4 王五的帖子
('p4',  'u4', '张家界国家森林公园！用360度VR全景拍摄，仿佛置身阿凡达世界 🌿🌄', 29.3348, 110.4764, '张家界国家森林公园', 'PUBLIC', 203, 1, 2890, '2026-06-20 10:15:00', '2026-06-20 10:15:00'),
('p17', 'u4', '稻城亚丁的秋天简直就是上帝打翻的调色盘！三神山在云雾中若隐若现，用VR360记录下了这绝美的一刻 🎨🏔️', 29.0377, 100.2983, '稻城亚丁', 'PUBLIC', 289, 4, 3800, '2026-05-25 11:00:00', '2026-05-25 11:00:00'),
('p18', 'u4', '在成都宽窄巷子品尝了正宗的川菜！辣得过瘾！用VR记录了整个美食之旅 🌶️🍜', 30.6700, 104.0500, '成都宽窄巷子', 'PUBLIC', 145, 2, 2100, '2026-05-20 12:30:00', '2026-05-20 12:30:00'),

-- u5 赵六的帖子
('p7',  'u5', '今天成功登顶了哈巴雪山！5396米的海拔，用VR记录下了从大本营到登顶的全过程，太不容易了 🏔️💪', 27.3200, 100.0800, '哈巴雪山', 'PUBLIC', 312, 5, 4200, '2026-06-17 07:00:00', '2026-06-17 07:00:00'),
('p8',  'u5', '虎跳峡的徒步路线太震撼了！用第一人称视角VR拍摄，走在悬崖边上的感觉让人心跳加速 🌊⛰️', 27.1800, 100.1500, '虎跳峡', 'PUBLIC', 198, 3, 2600, '2026-06-12 13:45:00', '2026-06-12 13:45:00'),
('p19', 'u5', '在雨崩村徒步了三天！这里真的是世外桃源，用VR全景记录下了梅里雪山脚下的这个小村庄 🏡🏔️', 28.3700, 98.8500, '雨崩村', 'PUBLIC', 267, 4, 3500, '2026-05-18 16:00:00', '2026-05-18 16:00:00'),

-- u6 孙七的帖子
('p9',  'u6', '在长沙火宫殿吃了一顿正宗的湘菜！臭豆腐、糖油粑粑、口味虾，每一样都让人回味无穷 🍜🌶️', 28.1900, 112.9700, '长沙火宫殿', 'PUBLIC', 156, 3, 1900, '2026-06-16 18:30:00', '2026-06-16 18:30:00'),
('p20', 'u6', '西安回民街的美食太多了！肉夹馍、凉皮、羊肉泡馍，用VR拍下了整个美食探索之旅 🥘', 34.2600, 108.9400, '西安回民街', 'PUBLIC', 187, 2, 2400, '2026-05-22 19:00:00', '2026-05-22 19:00:00'),

-- u7 周八的帖子
('p10', 'u7', '苏州园林的设计真的太精妙了！用VR拍摄了拙政园的每一个角落，移步换景，处处是画 🏯🌿', 31.3200, 120.6300, '苏州拙政园', 'PUBLIC', 145, 2, 1800, '2026-06-14 10:00:00', '2026-06-14 10:00:00'),
('p21', 'u7', '参观了扎哈·哈迪德设计的北京大兴机场！流线型的屋顶设计太美了，用VR全景记录下了这个建筑奇迹 ✈️🏛️', 39.5100, 116.4100, '北京大兴机场', 'PUBLIC', 201, 3, 3100, '2026-05-15 14:00:00', '2026-05-15 14:00:00'),

-- u8 吴九的帖子
('p22', 'u8', '在三亚蜈支洲岛潜水！水下能见度超过20米，珊瑚礁和热带鱼群太美了 🐠🪸', 18.3100, 109.7500, '三亚蜈支洲岛', 'PUBLIC', 234, 4, 3000, '2026-05-10 09:30:00', '2026-05-10 09:30:00'),

-- u9 郑十的帖子
('p23', 'u9', '带学生们参观了秦始皇兵马俑！用VR记录下了每一个俑的表情细节，两千年前的工匠技艺令人叹为观止 🏛️⚔️', 34.3800, 109.2800, '秦始皇兵马俑', 'PUBLIC', 278, 5, 3600, '2026-05-08 10:00:00', '2026-05-08 10:00:00'),

-- u10 钱一的帖子
('p24', 'u10', '在亚布力滑雪场完成了高级道！用360度VR拍摄了整个下滑过程，速度感太刺激了 ⛷️❄️', 44.7800, 128.5000, '亚布力滑雪场', 'PUBLIC', 189, 3, 2500, '2026-05-05 11:00:00', '2026-05-05 11:00:00');

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

-- 哈巴雪山帖子(p7): VR360视频
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m15', 'p7', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/habashan/800/450', 300, 3840, 2160, 'VR360', 0);

-- 虎跳峡帖子(p8): 2张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, vr_format, sort_order) VALUES
('m16', 'p8', 'IMAGE', 'https://picsum.photos/seed/hutiaoxia1/800/600', 'https://picsum.photos/seed/hutiaoxia1/400/300', 800, 600, 'VR180', 0),
('m17', 'p8', 'IMAGE', 'https://picsum.photos/seed/hutiaoxia2/800/600', 'https://picsum.photos/seed/hutiaoxia2/400/300', 800, 600, 'VR180', 1);

-- 长沙美食帖子(p9): 3张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m18', 'p9', 'IMAGE', 'https://picsum.photos/seed/changsha1/800/600', 'https://picsum.photos/seed/changsha1/400/300', 800, 600, 0),
('m19', 'p9', 'IMAGE', 'https://picsum.photos/seed/changsha2/800/600', 'https://picsum.photos/seed/changsha2/400/300', 800, 600, 1),
('m20', 'p9', 'IMAGE', 'https://picsum.photos/seed/changsha3/800/600', 'https://picsum.photos/seed/changsha3/400/300', 800, 600, 2);

-- 苏州园林帖子(p10): VR360图片 + 链接
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, vr_format, sort_order) VALUES
('m21', 'p10', 'IMAGE', 'https://picsum.photos/seed/suzhou1/800/600', 'https://picsum.photos/seed/suzhou1/400/300', 800, 600, 'VR360', 0);
INSERT INTO media_items (id, post_id, type, link_url, link_title, link_description, link_favicon, sort_order) VALUES
('m22', 'p10', 'LINK', 'https://baike.baidu.com/item/拙政园', '拙政园 - 中国四大名园', '拙政园位于苏州市，是江南古典园林的代表作品', 'https://baidu.com/favicon.ico', 1);

-- 九寨沟帖子(p11): VR360视频 + 2张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m23', 'p11', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/jiuzhaigou/800/450', 180, 3840, 2160, 'VR360', 0);
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m24', 'p11', 'IMAGE', 'https://picsum.photos/seed/jiuzhaigou2/800/600', 'https://picsum.photos/seed/jiuzhaigou2/400/300', 800, 600, 1),
('m25', 'p11', 'IMAGE', 'https://picsum.photos/seed/jiuzhaigou3/800/600', 'https://picsum.photos/seed/jiuzhaigou3/400/300', 800, 600, 2);

-- 布达拉宫帖子(p12): VR360视频 + 翻译
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m26', 'p12', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/potala/800/450', 240, 3840, 2160, 'VR360', 0);
INSERT INTO media_items (id, post_id, type, language, translated_text, sort_order) VALUES
('m27', 'p12', 'TRANSLATION', 'en', 'The Potala Palace in Lhasa, Tibet, is a UNESCO World Heritage Site and was the winter palace of the Dalai Lamas.', 1);

-- 敦煌帖子(p13): 3张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, vr_format, sort_order) VALUES
('m28', 'p13', 'IMAGE', 'https://picsum.photos/seed/dunhuang1/800/600', 'https://picsum.photos/seed/dunhuang1/400/300', 800, 600, 'VR360', 0),
('m29', 'p13', 'IMAGE', 'https://picsum.photos/seed/dunhuang2/800/600', 'https://picsum.photos/seed/dunhuang2/400/300', 800, 600, 'VR360', 1),
('m30', 'p13', 'IMAGE', 'https://picsum.photos/seed/dunhuang3/800/600', 'https://picsum.photos/seed/dunhuang3/400/300', 800, 600, 'VR360', 2);

-- 鼓浪屿帖子(p14): 图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m31', 'p14', 'IMAGE', 'https://picsum.photos/seed/gulangyu/800/600', 'https://picsum.photos/seed/gulangyu/400/300', 800, 600, 0);

-- VR评测帖子(p15): 视频
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, sort_order) VALUES
('m32', 'p15', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/vrreview/800/450', 600, 1920, 1080, 0);

-- 乌镇帖子(p16): VR180视频 + 图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m33', 'p16', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4', 'https://picsum.photos/seed/wuzhen/800/450', 120, 1920, 1080, 'VR180', 0);
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m34', 'p16', 'IMAGE', 'https://picsum.photos/seed/wuzhen2/800/600', 'https://picsum.photos/seed/wuzhen2/400/300', 800, 600, 1);

-- 稻城亚丁帖子(p17): VR360视频 + 2张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m35', 'p17', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/daocheng/800/450', 200, 3840, 2160, 'VR360', 0);
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m36', 'p17', 'IMAGE', 'https://picsum.photos/seed/daocheng2/800/600', 'https://picsum.photos/seed/daocheng2/400/300', 800, 600, 1),
('m37', 'p17', 'IMAGE', 'https://picsum.photos/seed/daocheng3/800/600', 'https://picsum.photos/seed/daocheng3/400/300', 800, 600, 2);

-- 成都美食帖子(p18): 2张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m38', 'p18', 'IMAGE', 'https://picsum.photos/seed/chengdu1/800/600', 'https://picsum.photos/seed/chengdu1/400/300', 800, 600, 0),
('m39', 'p18', 'IMAGE', 'https://picsum.photos/seed/chengdu2/800/600', 'https://picsum.photos/seed/chengdu2/400/300', 800, 600, 1);

-- 雨崩村帖子(p19): VR360视频
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m40', 'p19', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/yubeng/800/450', 280, 3840, 2160, 'VR360', 0);

-- 西安美食帖子(p20): 3张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m41', 'p20', 'IMAGE', 'https://picsum.photos/seed/xian1/800/600', 'https://picsum.photos/seed/xian1/400/300', 800, 600, 0),
('m42', 'p20', 'IMAGE', 'https://picsum.photos/seed/xian2/800/600', 'https://picsum.photos/seed/xian2/400/300', 800, 600, 1),
('m43', 'p20', 'IMAGE', 'https://picsum.photos/seed/xian3/800/600', 'https://picsum.photos/seed/xian3/400/300', 800, 600, 2);

-- 大兴机场帖子(p21): VR360图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, vr_format, sort_order) VALUES
('m44', 'p21', 'IMAGE', 'https://picsum.photos/seed/daxing/800/600', 'https://picsum.photos/seed/daxing/400/300', 800, 600, 'VR360', 0);

-- 三亚潜水帖子(p22): 水下视频 + 2张图片
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m45', 'p22', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/sanya/800/450', 180, 3840, 2160, 'VR360', 0);
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, sort_order) VALUES
('m46', 'p22', 'IMAGE', 'https://picsum.photos/seed/sanya2/800/600', 'https://picsum.photos/seed/sanya2/400/300', 800, 600, 1),
('m47', 'p22', 'IMAGE', 'https://picsum.photos/seed/sanya3/800/600', 'https://picsum.photos/seed/sanya3/400/300', 800, 600, 2);

-- 兵马俑帖子(p23): VR360图片 + 链接
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, vr_format, sort_order) VALUES
('m48', 'p23', 'IMAGE', 'https://picsum.photos/seed/bingmayong/800/600', 'https://picsum.photos/seed/bingmayong/400/300', 800, 600, 'VR360', 0);
INSERT INTO media_items (id, post_id, type, link_url, link_title, link_description, link_favicon, sort_order) VALUES
('m49', 'p23', 'LINK', 'https://baike.baidu.com/item/秦始皇兵马俑', '秦始皇兵马俑 - 世界文化遗产', '兵马俑是第一批全国重点文物保护单位、第一批中国世界遗产', 'https://baidu.com/favicon.ico', 1);

-- 滑雪帖子(p24): VR360视频
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order) VALUES
('m50', 'p24', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/skiing/800/450', 150, 3840, 2160, 'VR360', 0);

-- ============================================================
-- 评论
-- ============================================================
INSERT INTO comments (id, post_id, author_id, parent_id, content, created_at) VALUES
-- 黄山帖子(p1)评论
('c1', 'p1', 'u2', NULL, '黄山云海真的太美了！用VR看肯定超级震撼 😍', '2026-06-23 09:15:00'),
('c2', 'p1', 'u3', NULL, '你用的是什么设备拍的？画质看起来很好', '2026-06-23 10:30:00'),
('c3', 'p1', 'u1', 'c2', 'Apple Vision Pro，空间视频模式拍的', '2026-06-23 10:45:00'),

-- 故宫帖子(p2)评论
('c4', 'p2', 'u4', NULL, '故宫的历史感在VR里一定很特别', '2026-06-22 18:30:00'),
('c5', 'p2', 'u2', NULL, '翻译功能太实用了！外国朋友也能看懂', '2026-06-22 19:00:00'),

-- 张家界帖子(p4)评论
('c6', 'p4', 'u1', NULL, '张家界真的太壮观了，下次一起去！', '2026-06-20 14:00:00'),

-- 长城帖子(p6)评论
('c7', 'p6', 'u3', NULL, '长城是每个中国人的骄傲 🇨🇳', '2026-06-18 15:00:00'),
('c8', 'p6', 'u2', NULL, '用VR看长城，身临其境的感觉！', '2026-06-18 16:30:00'),

-- 哈巴雪山帖子(p7)评论
('c9',  'p7', 'u1',  NULL, '太厉害了！登顶5396米，我光看视频就腿软了 😱', '2026-06-17 08:30:00'),
('c10', 'p7', 'u4',  NULL, '赵六哥太强了！带我一起爬吧 💪', '2026-06-17 09:00:00'),
('c11', 'p7', 'u5',  'c10', '随时欢迎！下次哈巴雪山走起', '2026-06-17 09:15:00'),
('c12', 'p7', 'u3',  NULL, 'VR拍摄登山过程这个创意太棒了', '2026-06-17 10:00:00'),
('c13', 'p7', 'u10', NULL, '冬天来亚布力滑雪也不错哦 ⛷️', '2026-06-17 11:00:00'),

-- 虎跳峡帖子(p8)评论
('c14', 'p8', 'u1', NULL, '虎跳峡一直是我想去的地方！VR视频看起来太刺激了', '2026-06-12 14:30:00'),
('c15', 'p8', 'u6', NULL, '走完虎跳峡记得去附近的纳西族村寨尝尝当地美食', '2026-06-12 15:00:00'),
('c16', 'p8', 'u5', 'c15', '好建议！下次一定去', '2026-06-12 15:30:00'),

-- 长沙美食帖子(p9)评论
('c17', 'p9', 'u1', NULL, '长沙的臭豆腐是真的好吃！看完视频口水直流 🤤', '2026-06-16 19:00:00'),
('c18', 'p9', 'u4', NULL, '下次去长沙一定要打卡火宫殿', '2026-06-16 19:30:00'),
('c19', 'p9', 'u6', 'c18', '推荐你试试文和友的小龙虾，绝了！', '2026-06-16 20:00:00'),

-- 苏州园林帖子(p10)评论
('c20', 'p10', 'u9', NULL, '苏州园林的设计理念真的太精妙了，移步换景', '2026-06-14 11:00:00'),
('c21', 'p10', 'u7', 'c20', '对！每一扇窗都是一幅画', '2026-06-14 11:30:00'),

-- 九寨沟帖子(p11)评论
('c22', 'p11', 'u2', NULL, '九寨沟的水真的是五彩缤纷！太美了', '2026-06-15 10:00:00'),
('c23', 'p11', 'u5', NULL, '用VR看九寨沟的水，比照片震撼多了', '2026-06-15 10:30:00'),
('c24', 'p11', 'u8', NULL, '水下的世界也很精彩哦 🐠', '2026-06-15 11:00:00'),
('c25', 'p11', 'u1', 'c24', '下次试试水下VR拍摄！', '2026-06-15 11:30:00'),

-- 布达拉宫帖子(p12)评论
('c26', 'p12', 'u3',  NULL, '凌晨四点的日出，这个时间点选得太好了', '2026-06-10 07:00:00'),
('c27', 'p12', 'u5',  NULL, '布达拉宫一直是我的梦想目的地 🙏', '2026-06-10 07:30:00'),
('c28', 'p12', 'u9',  NULL, '用VR记录文化遗产，这就是科技的意义', '2026-06-10 08:00:00'),
('c29', 'p12', 'u7',  NULL, '宫殿建筑在金光下太壮观了', '2026-06-10 08:30:00'),
('c30', 'p12', 'u1',  'c28', '谢谢郑老师！希望能为文化传承做点贡献', '2026-06-10 09:00:00'),

-- 敦煌帖子(p13)评论
('c31', 'p13', 'u9', NULL, '莫高窟的壁画是中华文化的瑰宝！VR记录太有意义了', '2026-06-08 11:00:00'),
('c32', 'p13', 'u1', NULL, '每一幅壁画都值得细细品味', '2026-06-08 11:30:00'),
('c33', 'p13', 'u3', NULL, '微距VR拍摄这个技术方案不错，细节保留得很好', '2026-06-08 12:00:00'),

-- 鼓浪屿帖子(p14)评论
('c34', 'p14', 'u6', NULL, '鼓浪屿的咖啡馆真的很多，每家都有特色', '2026-06-05 16:00:00'),

-- VR评测帖子(p15)评论
('c35', 'p15', 'u1',  NULL, '这个评测太详细了！正好想买新设备', '2026-06-03 14:30:00'),
('c36', 'p15', 'u2',  NULL, '4K 360度拍摄，画质提升确实明显', '2026-06-03 15:00:00'),
('c37', 'p15', 'u5',  NULL, '这个设备适合户外拍摄吗？', '2026-06-03 15:30:00'),
('c38', 'p15', 'u3',  'c37', '完全可以！防水防尘，户外拍摄首选', '2026-06-03 16:00:00'),
('c39', 'p15', 'u10', NULL, '想看看滑雪场景的拍摄效果 ⛷️', '2026-06-03 16:30:00'),
('c40', 'p15', 'u3',  'c39', '下期就做滑雪场景测试！', '2026-06-03 17:00:00'),

-- 乌镇帖子(p16)评论
('c41', 'p16', 'u7', NULL, '乌镇的夜景配上评弹，太有江南韵味了', '2026-05-28 21:00:00'),
('c42', 'p16', 'u1', NULL, '用VR180拍摄水乡古镇，角度选得好', '2026-05-28 21:30:00'),

-- 稻城亚丁帖子(p17)评论
('c43', 'p17', 'u5',  NULL, '稻城亚丁的秋天确实美得不像话！', '2026-05-25 12:00:00'),
('c44', 'p17', 'u1',  NULL, '三神山在云雾中的画面太仙了', '2026-05-25 12:30:00'),
('c45', 'p17', 'u2',  NULL, '调色盘这个比喻太贴切了 🎨', '2026-05-25 13:00:00'),
('c46', 'p17', 'u10', NULL, '冬天去应该也很美，雪山更壮观', '2026-05-25 13:30:00'),

-- 成都美食帖子(p18)评论
('c47', 'p18', 'u6', NULL, '成都的美食太多了！宽窄巷子只是冰山一角', '2026-05-20 13:00:00'),
('c48', 'p18', 'u1', NULL, '看着视频都流口水了 🌶️', '2026-05-20 13:30:00'),

-- 雨崩村帖子(p19)评论
('c49', 'p19', 'u1',  NULL, '雨崩村真的是徒步者的天堂！', '2026-05-18 17:00:00'),
('c50', 'p19', 'u4',  NULL, '世外桃源这个形容太准确了', '2026-05-18 17:30:00'),
('c51', 'p19', 'u10', NULL, '梅里雪山脚下的村庄，光想想就觉得美', '2026-05-18 18:00:00'),
('c52', 'p19', 'u5',  'c49', '下次一起去！路线我已经很熟了', '2026-05-18 18:30:00'),

-- 西安美食帖子(p20)评论
('c53', 'p20', 'u9', NULL, '回民街的肉夹馍是一绝！', '2026-05-22 19:30:00'),
('c54', 'p20', 'u6', 'c53', '对！一定要吃老孙家的', '2026-05-22 20:00:00'),

-- 大兴机场帖子(p21)评论
('c55', 'p21', 'u9', NULL, '扎哈的设计真的太前卫了', '2026-05-15 14:30:00'),
('c56', 'p21', 'u3', NULL, '用VR全景拍摄建筑，效果一定很棒', '2026-05-15 15:00:00'),
('c57', 'p21', 'u7', 'c56', '是的！建筑摄影和VR结合是很好的方向', '2026-05-15 15:30:00'),

-- 三亚潜水帖子(p22)评论
('c58', 'p22', 'u1', NULL, '水下VR拍摄！太酷了！设备防水吗？', '2026-05-10 10:00:00'),
('c59', 'p22', 'u8', 'c58', '用的防水壳，能下潜到30米', '2026-05-10 10:30:00'),
('c60', 'p22', 'u5', NULL, '珊瑚礁太美了，好想去潜水', '2026-05-10 11:00:00'),
('c61', 'p22', 'u4', NULL, '热带鱼群好漂亮 🐠', '2026-05-10 11:30:00'),

-- 兵马俑帖子(p23)评论
('c62', 'p23', 'u1',  NULL, '两千年前的工匠技艺，令人敬佩', '2026-05-08 11:00:00'),
('c63', 'p23', 'u3',  NULL, '用VR记录文化遗产，太有教育意义了', '2026-05-08 11:30:00'),
('c64', 'p23', 'u7',  NULL, '每一个俑的表情都不一样，太神奇了', '2026-05-08 12:00:00'),
('c65', 'p23', 'u10', NULL, '带孩子去看看，让他感受历史', '2026-05-08 12:30:00'),
('c66', 'p23', 'u9',  'c65', '欢迎！我可以当导游 😊', '2026-05-08 13:00:00'),

-- 滑雪帖子(p24)评论
('c67', 'p24', 'u1',  NULL, '高级道！太厉害了！VR拍摄滑雪一定很刺激', '2026-05-05 11:30:00'),
('c68', 'p24', 'u5',  NULL, '360度拍摄滑雪过程，速度感十足', '2026-05-05 12:00:00'),
('c69', 'p24', 'u10', 'c67', '欢迎来亚布力！我教你滑雪 ⛷️', '2026-05-05 12:30:00');

-- ============================================================
-- 点赞
-- ============================================================
INSERT INTO likes (id, user_id, post_id, created_at) VALUES
-- 黄山帖子(p1)的点赞
('lk1',  'u2',  'p1',  '2026-06-23 09:00:00'),
('lk2',  'u3',  'p1',  '2026-06-23 10:00:00'),
('lk3',  'u4',  'p1',  '2026-06-23 11:00:00'),
('lk4',  'u5',  'p1',  '2026-06-23 12:00:00'),
('lk5',  'u6',  'p1',  '2026-06-23 13:00:00'),
-- 故宫帖子(p2)的点赞
('lk6',  'u1',  'p2',  '2026-06-22 20:00:00'),
('lk7',  'u4',  'p2',  '2026-06-22 20:30:00'),
('lk8',  'u7',  'p2',  '2026-06-22 21:00:00'),
-- 西湖帖子(p3)的点赞
('lk9',  'u1',  'p3',  '2026-06-21 17:00:00'),
('lk10', 'u2',  'p3',  '2026-06-21 17:30:00'),
-- 张家界帖子(p4)的点赞
('lk11', 'u1',  'p4',  '2026-06-20 15:00:00'),
('lk12', 'u2',  'p4',  '2026-06-20 15:30:00'),
('lk13', 'u3',  'p4',  '2026-06-20 16:00:00'),
('lk14', 'u5',  'p4',  '2026-06-20 16:30:00'),
-- 桂林帖子(p5)的点赞
('lk15', 'u1',  'p5',  '2026-06-19 18:00:00'),
('lk16', 'u3',  'p5',  '2026-06-19 18:30:00'),
('lk17', 'u4',  'p5',  '2026-06-19 19:00:00'),
-- 长城帖子(p6)的点赞
('lk18', 'u2',  'p6',  '2026-06-18 12:00:00'),
('lk19', 'u4',  'p6',  '2026-06-18 12:30:00'),
('lk20', 'u5',  'p6',  '2026-06-18 13:00:00'),
-- 哈巴雪山帖子(p7)的点赞
('lk21', 'u1',  'p7',  '2026-06-17 08:00:00'),
('lk22', 'u2',  'p7',  '2026-06-17 08:30:00'),
('lk23', 'u3',  'p7',  '2026-06-17 09:00:00'),
('lk24', 'u4',  'p7',  '2026-06-17 09:30:00'),
('lk25', 'u10', 'p7',  '2026-06-17 10:00:00'),
-- 虎跳峡帖子(p8)的点赞
('lk26', 'u1',  'p8',  '2026-06-12 14:00:00'),
('lk27', 'u6',  'p8',  '2026-06-12 14:30:00'),
('lk28', 'u7',  'p8',  '2026-06-12 15:00:00'),
-- 长沙美食帖子(p9)的点赞
('lk29', 'u1',  'p9',  '2026-06-16 19:00:00'),
('lk30', 'u4',  'p9',  '2026-06-16 19:30:00'),
('lk31', 'u7',  'p9',  '2026-06-16 20:00:00'),
-- 苏州园林帖子(p10)的点赞
('lk32', 'u1',  'p10', '2026-06-14 11:00:00'),
('lk33', 'u9',  'p10', '2026-06-14 11:30:00'),
-- 九寨沟帖子(p11)的点赞
('lk34', 'u2',  'p11', '2026-06-15 10:00:00'),
('lk35', 'u3',  'p11', '2026-06-15 10:30:00'),
('lk36', 'u5',  'p11', '2026-06-15 11:00:00'),
('lk37', 'u8',  'p11', '2026-06-15 11:30:00'),
-- 布达拉宫帖子(p12)的点赞
('lk38', 'u2',  'p12', '2026-06-10 07:00:00'),
('lk39', 'u3',  'p12', '2026-06-10 07:30:00'),
('lk40', 'u5',  'p12', '2026-06-10 08:00:00'),
('lk41', 'u7',  'p12', '2026-06-10 08:30:00'),
('lk42', 'u9',  'p12', '2026-06-10 09:00:00'),
-- 敦煌帖子(p13)的点赞
('lk43', 'u1',  'p13', '2026-06-08 11:00:00'),
('lk44', 'u3',  'p13', '2026-06-08 11:30:00'),
('lk45', 'u9',  'p13', '2026-06-08 12:00:00'),
-- 鼓浪屿帖子(p14)的点赞
('lk46', 'u1',  'p14', '2026-06-05 16:00:00'),
('lk47', 'u6',  'p14', '2026-06-05 16:30:00'),
-- VR评测帖子(p15)的点赞
('lk48', 'u1',  'p15', '2026-06-03 14:30:00'),
('lk49', 'u2',  'p15', '2026-06-03 15:00:00'),
('lk50', 'u5',  'p15', '2026-06-03 15:30:00'),
('lk51', 'u10', 'p15', '2026-06-03 16:00:00'),
-- 乌镇帖子(p16)的点赞
('lk52', 'u1',  'p16', '2026-05-28 21:00:00'),
('lk53', 'u7',  'p16', '2026-05-28 21:30:00'),
-- 稻城亚丁帖子(p17)的点赞
('lk54', 'u1',  'p17', '2026-05-25 12:00:00'),
('lk55', 'u2',  'p17', '2026-05-25 12:30:00'),
('lk56', 'u5',  'p17', '2026-05-25 13:00:00'),
('lk57', 'u10', 'p17', '2026-05-25 13:30:00'),
-- 成都美食帖子(p18)的点赞
('lk58', 'u1',  'p18', '2026-05-20 13:00:00'),
('lk59', 'u6',  'p18', '2026-05-20 13:30:00'),
-- 雨崩村帖子(p19)的点赞
('lk60', 'u1',  'p19', '2026-05-18 17:00:00'),
('lk61', 'u4',  'p19', '2026-05-18 17:30:00'),
('lk62', 'u10', 'p19', '2026-05-18 18:00:00'),
-- 西安美食帖子(p20)的点赞
('lk63', 'u1',  'p20', '2026-05-22 19:30:00'),
('lk64', 'u9',  'p20', '2026-05-22 20:00:00'),
-- 大兴机场帖子(p21)的点赞
('lk65', 'u1',  'p21', '2026-05-15 14:30:00'),
('lk66', 'u3',  'p21', '2026-05-15 15:00:00'),
('lk67', 'u9',  'p21', '2026-05-15 15:30:00'),
-- 三亚潜水帖子(p22)的点赞
('lk68', 'u1',  'p22', '2026-05-10 10:00:00'),
('lk69', 'u5',  'p22', '2026-05-10 10:30:00'),
('lk70', 'u4',  'p22', '2026-05-10 11:00:00'),
-- 兵马俑帖子(p23)的点赞
('lk71', 'u1',  'p23', '2026-05-08 11:00:00'),
('lk72', 'u3',  'p23', '2026-05-08 11:30:00'),
('lk73', 'u7',  'p23', '2026-05-08 12:00:00'),
('lk74', 'u10', 'p23', '2026-05-08 12:30:00'),
-- 滑雪帖子(p24)的点赞
('lk75', 'u1',  'p24', '2026-05-05 11:30:00'),
('lk76', 'u5',  'p24', '2026-05-05 12:00:00');

-- ============================================================
-- 通知
-- ============================================================
INSERT INTO notifications (id, recipient_id, sender_id, type, message, post_id, is_read, created_at) VALUES
('n1',  'u1', 'u2',  'LIKE',    '张三 赞了你在黄山的VR视频', 'p1',  0, '2026-06-23 09:15:00'),
('n2',  'u1', 'u3',  'COMMENT', '李四 评论了你在故宫的内容', 'p2',  0, '2026-06-22 18:30:00'),
('n3',  'u1', 'u4',  'COMMENT', '王五 评论了你的帖子', 'p4',       1, '2026-06-20 14:00:00'),
('n4',  'u1', 'u4',  'FOLLOW',  '王五 关注了你', NULL,             1, '2026-06-22 12:00:00'),
('n5',  'u1', NULL,  'SYSTEM',  '欢迎来到徐霞客！开始你的VR旅程吧 🎉', NULL, 0, '2026-06-15 08:00:00'),
('n6',  'u1', 'u2',  'COMMENT', '张三 评论了你的帖子', 'p6',       0, '2026-06-18 16:30:00'),
('n7',  'u1', 'u5',  'LIKE',    '赵六 赞了你的九寨沟VR视频', 'p11', 0, '2026-06-15 11:00:00'),
('n8',  'u1', 'u5',  'COMMENT', '赵六 评论了你的哈巴雪山帖子', 'p7', 0, '2026-06-17 08:30:00'),
('n9',  'u1', 'u6',  'FOLLOW',  '孙七 关注了你', NULL,             0, '2026-06-16 08:00:00'),
('n10', 'u1', 'u7',  'FOLLOW',  '周八 关注了你', NULL,             0, '2026-06-14 08:00:00'),
('n11', 'u1', 'u8',  'FOLLOW',  '吴九 关注了你', NULL,             0, '2026-06-13 08:00:00'),
('n12', 'u1', 'u9',  'FOLLOW',  '郑十 关注了你', NULL,             0, '2026-06-12 08:00:00'),
('n13', 'u1', 'u10', 'FOLLOW',  '钱一 关注了你', NULL,             0, '2026-06-11 08:00:00'),
('n14', 'u1', 'u9',  'COMMENT', '郑十 评论了你的布达拉宫帖子', 'p12', 0, '2026-06-10 08:00:00'),
('n15', 'u1', 'u3',  'COMMENT', '李四 评论了你的敦煌帖子', 'p13',   0, '2026-06-08 12:00:00'),
('n16', 'u5', 'u1',  'LIKE',    '徐霞客 赞了你的哈巴雪山VR视频', 'p7', 0, '2026-06-17 08:00:00'),
('n17', 'u5', 'u4',  'COMMENT', '王五 评论了你的哈巴雪山帖子', 'p7', 0, '2026-06-17 09:00:00'),
('n18', 'u3', 'u1',  'LIKE',    '徐霞客 赞了你的VR评测', 'p15',    0, '2026-06-03 14:30:00'),
('n19', 'u3', 'u2',  'COMMENT', '张三 评论了你的VR评测', 'p15',     0, '2026-06-03 15:00:00'),
('n20', 'u2', 'u1',  'FOLLOW',  '徐霞客 关注了你', NULL,            0, '2026-06-23 08:00:00');

-- ============================================================
-- 会话
-- ============================================================
INSERT INTO conversations (id, type, title, created_at, updated_at) VALUES
('conv1', 'DIRECT', NULL, '2026-06-23 10:30:00', '2026-06-23 10:30:00'),
('conv2', 'DIRECT', NULL, '2026-06-22 15:00:00', '2026-06-22 15:00:00'),
('conv3', 'GROUP', 'VR旅行爱好者群', '2026-06-21 20:00:00', '2026-06-21 20:00:00'),
('conv4', 'DIRECT', NULL, '2026-06-20 08:00:00', '2026-06-20 08:00:00'),
('conv5', 'DIRECT', NULL, '2026-06-18 10:00:00', '2026-06-18 10:00:00'),
('conv6', 'GROUP', '户外探险小队', '2026-06-15 12:00:00', '2026-06-15 12:00:00'),
('conv7', 'DIRECT', NULL, '2026-06-12 14:00:00', '2026-06-12 14:00:00'),
('conv8', 'GROUP', '美食探店群', '2026-06-10 18:00:00', '2026-06-10 18:00:00');

INSERT INTO conversation_participants (id, conversation_id, user_id, joined_at) VALUES
('cp1',  'conv1', 'u1',  '2026-06-23 10:30:00'),
('cp2',  'conv1', 'u2',  '2026-06-23 10:30:00'),
('cp3',  'conv2', 'u1',  '2026-06-22 15:00:00'),
('cp4',  'conv2', 'u3',  '2026-06-22 15:00:00'),
('cp5',  'conv3', 'u1',  '2026-06-21 20:00:00'),
('cp6',  'conv3', 'u2',  '2026-06-21 20:00:00'),
('cp7',  'conv3', 'u3',  '2026-06-21 20:00:00'),
('cp8',  'conv3', 'u4',  '2026-06-21 20:00:00'),
('cp9',  'conv4', 'u1',  '2026-06-20 08:00:00'),
('cp10', 'conv4', 'u5',  '2026-06-20 08:00:00'),
('cp11', 'conv5', 'u1',  '2026-06-18 10:00:00'),
('cp12', 'conv5', 'u6',  '2026-06-18 10:00:00'),
('cp13', 'conv6', 'u1',  '2026-06-15 12:00:00'),
('cp14', 'conv6', 'u5',  '2026-06-15 12:00:00'),
('cp15', 'conv6', 'u8',  '2026-06-15 12:00:00'),
('cp16', 'conv6', 'u10', '2026-06-15 12:00:00'),
('cp17', 'conv7', 'u1',  '2026-06-12 14:00:00'),
('cp18', 'conv7', 'u9',  '2026-06-12 14:00:00'),
('cp19', 'conv8', 'u1',  '2026-06-10 18:00:00'),
('cp20', 'conv8', 'u6',  '2026-06-10 18:00:00'),
('cp21', 'conv8', 'u4',  '2026-06-10 18:00:00'),
('cp22', 'conv8', 'u9',  '2026-06-10 18:00:00');

INSERT INTO messages (id, conversation_id, sender_id, content, created_at) VALUES
-- conv1: 徐霞客 <-> 张三
('msg1',  'conv1', 'u2', '你拍的黄山VR视频太震撼了！是用什么设备拍的？', '2026-06-23 10:30:00'),
('msg2',  'conv1', 'u1', 'Apple Vision Pro，空间视频模式', '2026-06-23 10:35:00'),
('msg3',  'conv1', 'u2', '下次一起出去拍吧！', '2026-06-23 10:40:00'),
-- conv2: 徐霞客 <-> 李四
('msg4',  'conv2', 'u1', '好的，下次一起去桂林拍VR！', '2026-06-22 15:00:00'),
('msg5',  'conv2', 'u3', '没问题！我带上新评测的设备', '2026-06-22 15:05:00'),
-- conv3: VR旅行爱好者群
('msg6',  'conv3', 'u4', '推荐一个拍360全景的好地方——九寨沟！', '2026-06-21 20:00:00'),
('msg7',  'conv3', 'u1', '九寨沟确实很美！我上个月刚去过', '2026-06-21 20:05:00'),
('msg8',  'conv3', 'u2', '我也想去！组队吗？', '2026-06-21 20:10:00'),
('msg9',  'conv3', 'u3', '算我一个！', '2026-06-21 20:15:00'),
-- conv4: 徐霞客 <-> 赵六
('msg10', 'conv4', 'u1', '赵六哥，哈巴雪山的VR视频太棒了！', '2026-06-20 08:00:00'),
('msg11', 'conv4', 'u5', '谢谢！想一起去爬山吗？', '2026-06-20 08:05:00'),
('msg12', 'conv4', 'u1', '当然想！什么时候出发？', '2026-06-20 08:10:00'),
('msg13', 'conv4', 'u5', '下个月吧，我先做攻略', '2026-06-20 08:15:00'),
-- conv5: 徐霞客 <-> 孙七
('msg14', 'conv5', 'u6', '你在长沙吃的那些美食，我都想尝尝！', '2026-06-18 10:00:00'),
('msg15', 'conv5', 'u1', '下次一起去！长沙的美食真的太多了', '2026-06-18 10:05:00'),
-- conv6: 户外探险小队
('msg16', 'conv6', 'u5', '下周末虎跳峡徒步，有人一起吗？', '2026-06-15 12:00:00'),
('msg17', 'conv6', 'u1', '我！一定去！', '2026-06-15 12:05:00'),
('msg18', 'conv6', 'u8', '我也可以，顺便看看有没有水下拍摄点', '2026-06-15 12:10:00'),
('msg19', 'conv6', 'u10','太好了！人多更安全', '2026-06-15 12:15:00'),
-- conv7: 徐霞客 <-> 郑十
('msg20', 'conv7', 'u9', '你的布达拉宫VR视频太有教育意义了', '2026-06-12 14:00:00'),
('msg21', 'conv7', 'u1', '谢谢郑老师！希望能为文化传承做点贡献', '2026-06-12 14:05:00'),
('msg22', 'conv7', 'u9', '下次一起去兵马俑吧，我当导游', '2026-06-12 14:10:00'),
-- conv8: 美食探店群
('msg23', 'conv8', 'u6', '发现了一家超好吃的火锅店！', '2026-06-10 18:00:00'),
('msg24', 'conv8', 'u4', '在哪里？我马上去！', '2026-06-10 18:05:00'),
('msg25', 'conv8', 'u9', '西安的美食太多了，根本吃不完', '2026-06-10 18:10:00'),
('msg26', 'conv8', 'u1', '下次美食VR拍摄走起！', '2026-06-10 18:15:00');

-- ============================================================
-- 用户兴趣标签
-- ============================================================
INSERT INTO user_interests (id, user_id, tag_id) VALUES
-- u1 徐霞客：旅行、VR、摄影
('ui1',  'u1', 'tag-001'),
('ui2',  'u1', 'tag-002'),
('ui3',  'u1', 'tag-003'),
('ui4',  'u1', 'tag-009'),
('ui5',  'u1', 'tag-010'),
('ui6',  'u1', 'tag-020'),
-- u2 张三：VR摄影、旅行
('ui7',  'u2', 'tag-009'),
('ui8',  'u2', 'tag-010'),
('ui9',  'u2', 'tag-011'),
('ui10', 'u2', 'tag-001'),
-- u3 李四：科技评测、VR
('ui11', 'u3', 'tag-014'),
('ui12', 'u3', 'tag-009'),
('ui13', 'u3', 'tag-013'),
-- u4 王五：旅行、美食
('ui14', 'u4', 'tag-001'),
('ui15', 'u4', 'tag-003'),
('ui16', 'u4', 'tag-021'),
('ui17', 'u4', 'tag-015'),
-- u5 赵六：户外、登山、徒步
('ui18', 'u5', 'tag-007'),
('ui19', 'u5', 'tag-015'),
('ui20', 'u5', 'tag-018'),
('ui21', 'u5', 'tag-001'),
-- u6 孙七：美食、旅行
('ui22', 'u6', 'tag-021'),
('ui23', 'u6', 'tag-003'),
('ui24', 'u6', 'tag-008'),
-- u7 周八：建筑、城市探索
('ui25', 'u7', 'tag-003'),
('ui26', 'u7', 'tag-002'),
('ui27', 'u7', 'tag-024'),
-- u8 吴九：潜水、海滨
('ui28', 'u8', 'tag-019'),
('ui29', 'u8', 'tag-005'),
('ui30', 'u8', 'tag-020'),
-- u9 郑十：历史、文化
('ui31', 'u9', 'tag-002'),
('ui32', 'u9', 'tag-024'),
('ui33', 'u9', 'tag-022'),
('ui34', 'u9', 'tag-023'),
-- u10 钱一：滑雪、户外
('ui35', 'u10','tag-007'),
('ui36', 'u10','tag-015'),
('ui37', 'u10','tag-016');

-- ============================================================
-- 社群
-- ============================================================
INSERT INTO communities (id, conversation_id, name, description, avatar_url, creator_id, member_count, is_public) VALUES
('com1', 'conv3', 'VR旅行爱好者群', '热爱VR旅行拍摄的小伙伴们，分享你的VR作品！', 'https://api.dicebear.com/9.x/identicon/svg?seed=vr-travel', 'u1', 4, 1),
('com2', 'conv6', '户外探险小队', '一起去征服大自然！登山、徒步、露营、潜水...', 'https://api.dicebear.com/9.x/identicon/svg?seed=outdoor', 'u5', 4, 1),
('com3', 'conv8', '美食探店群', '寻找各地美食，用VR记录美食之旅', 'https://api.dicebear.com/9.x/identicon/svg?seed=food', 'u6', 4, 1);

INSERT INTO community_tags (id, community_id, tag_id) VALUES
('ct1', 'com1', 'tag-009'),
('ct2', 'com1', 'tag-010'),
('ct3', 'com1', 'tag-011'),
('ct4', 'com2', 'tag-015'),
('ct5', 'com2', 'tag-007'),
('ct6', 'com2', 'tag-018'),
('ct7', 'com3', 'tag-021'),
('ct8', 'com3', 'tag-003');
