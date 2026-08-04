-- ============================================================
-- 闪拍种子数据 — 关联到第一个普通用户
-- ============================================================

USE xuxiake;

-- 获取第一个普通用户ID
SET @userId = (SELECT id FROM users WHERE role = 'USER' LIMIT 1);

INSERT INTO posts (id, author_id, post_type, content_level, content, location_name, vr_metadata, visibility, created_at) VALUES
(UUID(), @userId, 'NOTE', 'SNAPSHOT', '今天终于写完了报告，虽然很累，但松了一口气。', '学校图书馆', '{"keywords":["报告","疲惫","完成","夜晚"],"mood":"疲惫但满足","scene":"学习工作","image":"https://images.unsplash.com/photo-1499750310107-5fef28a66643"}', 'PUBLIC', '2026-08-04 21:30:00'),
(UUID(), @userId, 'NOTE', 'SNAPSHOT', '傍晚路过操场，天色很好，突然觉得今天也没那么糟。', '校园操场', '{"keywords":["傍晚","操场","天空","平静"],"mood":"平静","scene":"日常散步","image":"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"}', 'PUBLIC', '2026-08-03 18:20:00'),
(UUID(), @userId, 'NOTE', 'SNAPSHOT', '和朋友吃了一顿火锅，聊了很多乱七八糟的事。', '市中心火锅店', '{"keywords":["朋友","火锅","聊天","开心"],"mood":"开心","scene":"朋友聚会","image":"https://images.unsplash.com/photo-1555939594-58d7cb561ad1"}', 'PUBLIC', '2026-08-02 20:10:00'),
(UUID(), @userId, 'NOTE', 'SNAPSHOT', '窗外下着雨，一个人坐在咖啡馆，感觉有点低落。', '城市咖啡馆', '{"keywords":["下雨","咖啡","独处","低落"],"mood":"低落","scene":"独处时光","image":"https://images.unsplash.com/photo-1518051870910-a46e30d9db16"}', 'PUBLIC', '2026-08-01 16:00:00');

SELECT 'Seed snap data inserted successfully!' AS result;
