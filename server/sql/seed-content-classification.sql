-- ============================================================
-- 内容分类体系 - 种子数据
-- ============================================================

USE xuxiake;

SET NAMES utf8mb4;

-- 获取已存在的用户ID
SET @u1 = (SELECT id FROM users LIMIT 1);
SET @u2 = (SELECT id FROM users LIMIT 1 OFFSET 1);
SET @u3 = (SELECT id FROM users LIMIT 1 OFFSET 2);

-- ============================================================
-- 1. 创建话题
-- ============================================================
INSERT INTO topics (id, name, icon, description, post_count, is_hot) VALUES
('topic-001', '东京自由行', '🗼', '东京旅行攻略、美食、购物、文化体验分享', 0, 1),
('topic-002', '云南之旅', '🌸', '昆明大理丽江香格里拉，彩云之南的旅行记忆', 0, 1),
('topic-003', 'VR拍摄技巧', '📷', 'VR全景拍摄、360视频制作经验分享', 0, 1),
('topic-004', '周末露营', '⛺', '城市周边露营地推荐、露营装备、露营美食', 0, 1),
('topic-005', '古镇探秘', '🏘️', '中国古镇古村落探访，感受历史沉淀', 0, 1),
('topic-006', '海岛度假', '🏖️', '海岛旅行、潜水、沙滩、日落', 0, 0),
('topic-007', '徒步挑战', '🥾', '户外徒步路线、装备、经验分享', 0, 1),
('topic-008', '美食地图', '🍜', '各地美食探店、特色小吃、餐厅推荐', 0, 1);

-- ============================================================
-- 2. 笔记类型帖子 (NOTE)
-- ============================================================
INSERT INTO posts (id, author_id, post_type, content, location_lat, location_lng, location_name, visibility, like_count, comment_count, view_count, created_at) VALUES
('post-seed-001', @u1, 'NOTE', '今天在西湖边用VR眼镜拍了一组断桥残雪的全景照片，湖面的雾气配上远处的雷峰塔，真的太美了！分享给大家看看 🌊', 30.2590, 120.1449, '杭州西湖', 'PUBLIC', 156, 23, 1890, '2026-07-15 10:30:00'),
('post-seed-002', @u2, 'NOTE', '故宫博物院一日游！用VR眼镜录了一段导游讲解，还自动翻译成了英文版本。推荐大家一定要去看看延禧宫，那个西洋建筑真的很有意思 🏯', 39.9163, 116.3972, '故宫博物院', 'PUBLIC', 203, 45, 3200, '2026-07-14 14:20:00'),
('post-seed-003', @u3, 'MOMENT', '下班后骑车去了外滩，用VR记录了黄浦江的夜景。上海的夜晚真的很迷人 ✨', 31.2400, 121.4900, '上海外滩', 'PUBLIC', 89, 12, 980, '2026-07-16 20:15:00'),
('post-seed-004', @u1, 'NOTE', '在成都宽窄巷子找到了一家超好吃的火锅店！用VR拍了店内环境，古色古香的装修配上正宗的四川火锅，绝了 🌶️', 30.6700, 104.0500, '成都宽窄巷子', 'PUBLIC', 178, 34, 2100, '2026-07-13 18:45:00');

-- ============================================================
-- 3. VR内容类型帖子 (VR_MEDIA)
-- ============================================================
INSERT INTO posts (id, author_id, post_type, content, location_lat, location_lng, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
('post-seed-005', @u1, 'VR_MEDIA', '黄山云海VR360全景！站在光明顶上，云雾缭绕，仿佛置身仙境。这是用Apple Vision Pro拍摄的4K全景视频 🏔️', 30.1297, 118.1649, '黄山风景区', '{"device":"Apple Vision Pro","resolution":"4K","format":"VR360"}', 'PUBLIC', 312, 67, 4500, '2026-07-12 08:30:00'),
('post-seed-006', @u2, 'VR_MEDIA', '张家界天门山VR180立体视频！走在玻璃栈道上，脚下就是万丈深渊，刺激又震撼。用Meta Quest 4拍摄 🌿', 29.3348, 110.4764, '张家界天门山', '{"device":"Meta Quest 4","resolution":"8K","format":"VR180"}', 'PUBLIC', 267, 52, 3800, '2026-07-11 09:15:00'),
('post-seed-007', @u3, 'VR_MEDIA', '桂林漓江空间视频！坐在竹筏上，两岸的喀斯特地貌尽收眼底。这个空间视频效果真的太棒了 🎥', 25.2736, 110.2902, '桂林漓江', '{"device":"Apple Vision Pro","resolution":"4K","format":"SPATIAL"}', 'PUBLIC', 189, 38, 2600, '2026-07-10 16:00:00');

-- ============================================================
-- 4. 路线类型帖子 (ROUTE)
-- ============================================================
INSERT INTO posts (id, author_id, post_type, content, location_lat, location_lng, location_name, visibility, like_count, comment_count, view_count, created_at) VALUES
('post-seed-008', @u1, 'ROUTE', '黄山经典徒步路线！从前山慈光阁出发，经迎客松、光明顶、飞来石，最后从后山下山。全程约12公里，耗时6小时，累计爬升1200米。难度中等偏上，建议有一定体力基础的朋友尝试 🥾', 30.1297, 118.1649, '黄山风景区', 'PUBLIC', 245, 56, 3200, '2026-07-09 07:00:00'),
('post-seed-009', @u2, 'ROUTE', '千岛湖环湖骑行路线！全程约80公里，沿湖骑行风景绝美。途经千岛湖大桥、姜家镇、汾口镇，最后回到千岛湖镇。建议分两天完成，中间在姜家镇住一晚 🚴', 29.6000, 118.9500, '千岛湖', 'PUBLIC', 178, 34, 2100, '2026-07-08 09:30:00'),
('post-seed-010', @u3, 'ROUTE', '阳朔攀岩路线推荐！在月亮山有几条经典线路，难度5.10a-5.12b不等。今天挑战了5.11a的"月光之路"，虽然中途掉了两次但最终还是完攀了！🧗', 24.7800, 110.4900, '阳朔月亮山', 'PUBLIC', 134, 28, 1800, '2026-07-07 15:00:00');

INSERT INTO route_details (post_id, distance_km, duration_minutes, elevation_gain_m, difficulty, route_type) VALUES
('post-seed-008', 12.5, 360, 1200, 'HARD', 'HIKE'),
('post-seed-009', 80.0, 480, 450, 'MODERATE', 'BIKE'),
('post-seed-010', 0.3, 120, 80, 'EXPERT', 'CLIMB');

-- ============================================================
-- 5. 旅程类型帖子 (JOURNEY)
-- ============================================================
INSERT INTO posts (id, author_id, post_type, content, location_lat, location_lng, location_name, visibility, like_count, comment_count, view_count, created_at) VALUES
('post-seed-011', @u1, 'JOURNEY', '云南7日自由行完美结束！从昆明到大理到丽江，每一站都有不同的风景和体验。用VR记录了整个旅程，接下来会陆续分享每个地方的详细攻略 ✈️', 25.0400, 102.6800, '云南', 'PUBLIC', 356, 78, 5200, '2026-07-05 22:00:00'),
('post-seed-012', @u2, 'JOURNEY', '日本东京5日游！浅草寺、涩谷、新宿、秋叶原、台场...每天都是暴走模式。最推荐的是筑地市场的海鲜早餐，新鲜到爆 🇯🇵', 35.6800, 139.7700, '东京', 'PUBLIC', 289, 62, 4100, '2026-07-01 18:30:00');

INSERT INTO journeys (post_id, title, start_date, end_date, destination, stop_count) VALUES
('post-seed-011', '云南7日自由行', '2026-06-28', '2026-07-04', '昆明-大理-丽江', 5),
('post-seed-012', '东京5日深度游', '2026-06-20', '2026-06-24', '东京', 4);

INSERT INTO journey_stops (journey_id, day_number, location_name, location_lat, location_lng, description, sort_order) VALUES
((SELECT id FROM journeys WHERE post_id='post-seed-011'), 1, '昆明翠湖公园', 25.0400, 102.6800, '抵达昆明，先去了翠湖公园看红嘴鸥，晚上逛了南屏步行街', 0),
((SELECT id FROM journeys WHERE post_id='post-seed-011'), 2, '大理古城', 25.6900, 100.1600, '坐高铁到大理，入住古城客栈，下午骑行环洱海', 1),
((SELECT id FROM journeys WHERE post_id='post-seed-011'), 3, '双廊古镇', 25.9600, 100.1900, '从大理古城到双廊，拍了超美的洱海日落', 2),
((SELECT id FROM journeys WHERE post_id='post-seed-011'), 5, '丽江古城', 26.8700, 100.2300, '到达丽江，逛了四方街，听了纳西古乐', 3),
((SELECT id FROM journeys WHERE post_id='post-seed-011'), 6, '玉龙雪山', 27.1000, 100.1800, '挑战玉龙雪山4680米，高反有点严重但风景值得', 4),
((SELECT id FROM journeys WHERE post_id='post-seed-012'), 1, '浅草寺', 35.7100, 139.7900, '参观雷门和浅草寺，抽了签', 0),
((SELECT id FROM journeys WHERE post_id='post-seed-012'), 2, '涩谷十字路口', 35.6600, 139.7000, '打卡涩谷十字路口，逛了忠犬八公像', 1),
((SELECT id FROM journeys WHERE post_id='post-seed-012'), 3, '秋叶原', 35.7000, 139.7700, '宅男天堂！买了好多手办和电子产品', 2),
((SELECT id FROM journeys WHERE post_id='post-seed-012'), 4, '筑地市场', 35.6650, 139.7700, '早上5点起来去筑地市场吃海鲜早餐，金枪鱼大腹入口即化', 3);

-- ============================================================
-- 6. 攻略类型帖子 (GUIDE)
-- ============================================================
INSERT INTO posts (id, author_id, post_type, content, location_lat, location_lng, location_name, visibility, like_count, comment_count, view_count, created_at) VALUES
('post-seed-013', @u1, 'GUIDE', '【东京美食攻略】整理了东京最值得去的10家餐厅！从米其林三星到平价拉面，从筑地海鲜到秋叶原甜品，全覆盖。预算从人均100元到2000元都有推荐 🍣', 35.6800, 139.7700, '东京', 'PUBLIC', 412, 89, 6800, '2026-07-03 12:00:00'),
('post-seed-014', @u2, 'GUIDE', '【云南住宿攻略】从青旅到民宿到星级酒店，云南各地住宿全攻略。重点推荐大理的海景民宿和丽江的纳西庭院客栈，性价比超高 🏨', 25.0400, 102.6800, '云南', 'PUBLIC', 267, 45, 3900, '2026-07-06 10:00:00'),
('post-seed-015', @u3, 'GUIDE', '【黄山交通攻略】怎么去黄山？高铁到黄山北站后怎么到景区？景区内交通怎么安排？索道怎么选？一篇搞定所有交通问题 🚗', 30.1297, 118.1649, '黄山', 'PUBLIC', 198, 34, 2800, '2026-07-04 14:00:00');

INSERT INTO guide_details (post_id, destination, category, best_season, budget_level, rich_content) VALUES
('post-seed-013', '东京', 'FOOD', '四季皆宜', 'MID', '# 东京美食攻略\n\n## 1. 寿司大（筑地市场）\n推荐：金枪鱼大腹、海胆军舰\n人均：300元\n\n## 2. 一蘭拉面（涩谷）n推荐：天然豚骨拉面\n人均：80元\n\n## 3. 银座小十\n推荐：怀石料理\n人均：2000元\n米其林三星\n\n## 4. 矢场味噌（名古屋风味）\n推荐：味噌炸猪排\n人均：120元\n\n## 5. HARBS（新宿）\n推荐：水果千层蛋糕\n人均：100元'),
('post-seed-014', '云南', 'STAY', '春秋最佳', 'BUDGET', '# 云南住宿攻略\n\n## 昆明\n- 昆明国际青年旅舍：50元/床\n- 翠湖宾馆：300元/晚\n\n## 大理\n- 才村码头海景民宿：200-400元/晚\n- 古城内纳西庭院客栈：150-300元/晚\n\n## 丽江\n- 束河古镇客栈：100-250元/晚\n- 丽江古城观景房：300-500元/晚'),
('post-seed-015', '黄山', 'TRANSPORT', '春秋最佳', 'MID', '# 黄山交通攻略\n\n## 如何到达\n- 高铁：各地→黄山北站\n- 飞机：各地→黄山屯溪机场\n\n## 景区交通\n- 黄山北站→汤口换乘中心：班车20元\n- 汤口→慈光阁/云谷寺：景区大巴19元\n\n## 索道选择\n- 玉屏索道（前山上）：90元\n- 云谷索道（后山上）：80元\n- 建议前山上后山下');

-- ============================================================
-- 7. 帖子标签关联
-- ============================================================
INSERT INTO post_tags (id, post_id, tag_id) VALUES
(uuid(), 'post-seed-001', 'tag-001'),
(uuid(), 'post-seed-001', 'tag-020'),
(uuid(), 'post-seed-002', 'tag-002'),
(uuid(), 'post-seed-002', 'tag-024'),
(uuid(), 'post-seed-003', 'tag-003'),
(uuid(), 'post-seed-004', 'tag-021'),
(uuid(), 'post-seed-004', 'tag-003'),
(uuid(), 'post-seed-005', 'tag-001'),
(uuid(), 'post-seed-005', 'tag-009'),
(uuid(), 'post-seed-005', 'tag-010'),
(uuid(), 'post-seed-006', 'tag-001'),
(uuid(), 'post-seed-006', 'tag-011'),
(uuid(), 'post-seed-007', 'tag-001'),
(uuid(), 'post-seed-007', 'tag-011'),
(uuid(), 'post-seed-008', 'tag-015'),
(uuid(), 'post-seed-008', 'tag-001'),
(uuid(), 'post-seed-009', 'tag-017'),
(uuid(), 'post-seed-009', 'tag-001'),
(uuid(), 'post-seed-010', 'tag-015'),
(uuid(), 'post-seed-011', 'tag-001'),
(uuid(), 'post-seed-011', 'tag-026'),
(uuid(), 'post-seed-012', 'tag-003'),
(uuid(), 'post-seed-012', 'tag-021'),
(uuid(), 'post-seed-013', 'tag-021'),
(uuid(), 'post-seed-013', 'tag-026'),
(uuid(), 'post-seed-014', 'tag-026'),
(uuid(), 'post-seed-015', 'tag-026'),
(uuid(), 'post-seed-015', 'tag-016');

-- ============================================================
-- 8. 帖子话题关联
-- ============================================================
INSERT INTO post_topics (id, post_id, topic_id) VALUES
(uuid(), 'post-seed-001', 'topic-003'),
(uuid(), 'post-seed-002', 'topic-005'),
(uuid(), 'post-seed-004', 'topic-008'),
(uuid(), 'post-seed-005', 'topic-003'),
(uuid(), 'post-seed-005', 'topic-007'),
(uuid(), 'post-seed-006', 'topic-003'),
(uuid(), 'post-seed-008', 'topic-007'),
(uuid(), 'post-seed-011', 'topic-002'),
(uuid(), 'post-seed-012', 'topic-001'),
(uuid(), 'post-seed-013', 'topic-001'),
(uuid(), 'post-seed-013', 'topic-008'),
(uuid(), 'post-seed-014', 'topic-002'),
(uuid(), 'post-seed-015', 'topic-007');

-- ============================================================
-- 9. 更新话题帖子数
-- ============================================================
UPDATE topics SET post_count = (SELECT COUNT(*) FROM post_topics WHERE topic_id = topics.id);

-- ============================================================
-- 10. 更新媒体数据（给部分帖子添加图片）
-- ============================================================
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, sort_order, created_at) VALUES
(uuid(), 'post-seed-001', 'IMAGE', 'https://picsum.photos/seed/xihu1/800/600', 'https://picsum.photos/seed/xihu1/400/300', 0, NOW()),
(uuid(), 'post-seed-002', 'IMAGE', 'https://picsum.photos/seed/gugong1/800/600', 'https://picsum.photos/seed/gugong1/400/300', 0, NOW()),
(uuid(), 'post-seed-004', 'IMAGE', 'https://picsum.photos/seed/huoguo1/800/600', 'https://picsum.photos/seed/huoguo1/400/300', 0, NOW()),
(uuid(), 'post-seed-005', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', 'https://picsum.photos/seed/huangshan1/800/450', 0, NOW()),
(uuid(), 'post-seed-006', 'VIDEO', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4', 'https://picsum.photos/seed/zhangjiajie1/800/450', 0, NOW()),
(uuid(), 'post-seed-008', 'IMAGE', 'https://picsum.photos/seed/huangshan-hike/800/600', 'https://picsum.photos/seed/huangshan-hike/400/300', 0, NOW()),
(uuid(), 'post-seed-011', 'IMAGE', 'https://picsum.photos/seed/yunnan1/800/600', 'https://picsum.photos/seed/yunnan1/400/300', 0, NOW()),
(uuid(), 'post-seed-011', 'IMAGE', 'https://picsum.photos/seed/yunnan2/800/600', 'https://picsum.photos/seed/yunnan2/400/300', 1, NOW()),
(uuid(), 'post-seed-011', 'IMAGE', 'https://picsum.photos/seed/yunnan3/800/600', 'https://picsum.photos/seed/yunnan3/400/300', 2, NOW()),
(uuid(), 'post-seed-012', 'IMAGE', 'https://picsum.photos/seed/tokyo1/800/600', 'https://picsum.photos/seed/tokyo1/400/300', 0, NOW()),
(uuid(), 'post-seed-013', 'IMAGE', 'https://picsum.photos/seed/tokyo-food/800/600', 'https://picsum.photos/seed/tokyo-food/400/300', 0, NOW());
