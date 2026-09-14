-- ============================================================
-- Demo data cleanup for local community preview
-- Date: 2026-09-11
--
-- Purpose:
-- 1. Remove obvious E2E/test posts from the local database.
-- 2. Replace external demo images (dicebear/picsum) with local upload assets.
-- 3. Replace placeholder post covers with existing local uploaded images.
--
-- Run after backing up the database.
-- ============================================================

USE xuxiake;
SET NAMES utf8mb4;

START TRANSACTION;

-- ------------------------------------------------------------
-- 1. Remove only obvious test posts.
-- ------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_test_posts AS
SELECT id
FROM posts
WHERE content LIKE '%E2E 测试%'
   OR content LIKE '%测试图片%'
   OR title LIKE '%测试%'
   OR (
     content_level = 'SNAPSHOT'
     AND COALESCE(NULLIF(TRIM(content), ''), '') = ''
     AND COALESCE(NULLIF(TRIM(title), ''), '') = ''
     AND COALESCE(NULLIF(TRIM(location_name), ''), '') = ''
   );

DELETE FROM journey_stop_media
WHERE stop_id IN (
  SELECT js.id
  FROM journey_stops js
  INNER JOIN journeys j ON j.id = js.journey_id
  INNER JOIN tmp_test_posts t ON t.id = j.post_id
);
DELETE FROM journey_stops
WHERE journey_id IN (
  SELECT j.id
  FROM journeys j
  INNER JOIN tmp_test_posts t ON t.id = j.post_id
);
DELETE FROM journeys WHERE post_id IN (SELECT id FROM tmp_test_posts);

DELETE FROM media_items WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM comments WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM likes WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM notifications WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM reports WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM content_reviews WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM video_comments WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM post_tags WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM post_topics WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM post_hashtags WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM collection_posts WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM playlist_tracks WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM audio_playlist_items WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM community_challenge_entries WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM guide_details WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM route_details WHERE post_id IN (SELECT id FROM tmp_test_posts);
DELETE FROM posts WHERE id IN (SELECT id FROM tmp_test_posts);

-- ------------------------------------------------------------
-- 2. Normalize local uploaded asset URLs.
-- ------------------------------------------------------------
UPDATE media_items
SET url = REPLACE(url, 'http://localhost:3001', '')
WHERE url LIKE 'http://localhost:3001/uploads/%';

UPDATE media_items
SET thumbnail_url = REPLACE(thumbnail_url, 'http://localhost:3001', '')
WHERE thumbnail_url LIKE 'http://localhost:3001/uploads/%';

UPDATE users
SET avatar_url = CASE id
  WHEN 'u1' THEN '/uploads/demo-avatars/u1-xuxiake.png'
  WHEN 'u2' THEN '/uploads/demo-avatars/u2-zhangshan.png'
  WHEN 'u3' THEN '/uploads/demo-avatars/u3-lisi.png'
  WHEN 'u4' THEN '/uploads/demo-avatars/u4-wangwu.png'
  WHEN 'u5' THEN '/uploads/demo-avatars/u5-zhaoliu.png'
  WHEN 'u6' THEN '/uploads/demo-avatars/u6-sunqi.png'
  WHEN 'u7' THEN '/uploads/demo-avatars/u7-zhouba.png'
  WHEN 'u8' THEN '/uploads/demo-avatars/u8-wujiu.png'
  WHEN 'u9' THEN '/uploads/demo-avatars/u9-zhengshi.png'
  WHEN 'u10' THEN '/uploads/demo-avatars/u10-qianyi.png'
  ELSE avatar_url
END
WHERE id IN ('u1','u2','u3','u4','u5','u6','u7','u8','u9','u10');

UPDATE communities
SET avatar_url = CASE id
  WHEN 'com1' THEN '/uploads/demo-covers/lijiang.jpg'
  WHEN 'com2' THEN '/uploads/demo-covers/haba.jpg'
  WHEN 'com3' THEN '/uploads/demo-covers/changsha.jpg'
  ELSE avatar_url
END,
cover_url = CASE id
  WHEN 'com1' THEN '/uploads/demo-covers/lijiang.jpg'
  WHEN 'com2' THEN '/uploads/demo-covers/daocheng.jpg'
  WHEN 'com3' THEN '/uploads/demo-covers/changsha.jpg'
  ELSE cover_url
END
WHERE id IN ('com1','com2','com3');

-- ------------------------------------------------------------
-- 3. Give posts real local covers from existing upload assets.
-- ------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_post_covers (
  location_key varchar(80) PRIMARY KEY,
  cover_url varchar(500) NOT NULL
);

INSERT INTO tmp_post_covers (location_key, cover_url) VALUES
('漓江', '/uploads/demo-covers/lijiang.jpg'),
('阳朔', '/uploads/demo-covers/lijiang.jpg'),
('西湖', '/uploads/demo-covers/westlake.jpg'),
('稻城', '/uploads/demo-covers/daocheng.jpg'),
('哈巴', '/uploads/demo-covers/haba.jpg'),
('长沙', '/uploads/demo-covers/changsha.jpg'),
('苏州', '/uploads/demo-covers/suzhou.jpg'),
('蜈支洲', '/uploads/demo-covers/sanya.jpg'),
('三亚', '/uploads/demo-covers/sanya.jpg'),
('兵马俑', '/uploads/demo-covers/terracotta.jpg'),
('亚布力', '/uploads/demo-covers/yabuli.jpg'),
('黄山', '/uploads/demo-covers/huangshan.jpg'),
('故宫', '/uploads/demo-covers/forbidden-city.jpg'),
('长城', '/uploads/demo-covers/greatwall.jpg'),
('张家界', '/uploads/demo-covers/zhangjiajie.jpg'),
('桂林', '/uploads/demo-covers/lijiang.jpg'),
('九寨沟', '/uploads/demo-covers/jiuzhaigou.jpg'),
('布达拉宫', '/uploads/demo-covers/potala.jpg'),
('敦煌', '/uploads/demo-covers/dunhuang.jpg'),
('鼓浪屿', '/uploads/demo-covers/gulangyu.jpg');

-- Fill travel demo posts by location.
UPDATE posts p
INNER JOIN tmp_post_covers c
  ON p.location_name LIKE CONCAT('%', c.location_key, '%')
     OR p.title LIKE CONCAT('%', c.location_key, '%')
     OR p.content LIKE CONCAT('%', c.location_key, '%')
SET p.vr_metadata = CASE
  WHEN JSON_VALID(COALESCE(NULLIF(p.vr_metadata, ''), '{}'))
    THEN JSON_SET(COALESCE(NULLIF(p.vr_metadata, ''), '{}'), '$.image', c.cover_url)
  ELSE JSON_OBJECT('image', c.cover_url)
END;

-- Final fallback for posts that still have no useful cover.
UPDATE posts
SET vr_metadata = CASE
  WHEN JSON_VALID(COALESCE(NULLIF(vr_metadata, ''), '{}'))
    THEN JSON_SET(COALESCE(NULLIF(vr_metadata, ''), '{}'), '$.image', '/uploads/demo-covers/lijiang.jpg')
  ELSE JSON_OBJECT('image', '/uploads/demo-covers/lijiang.jpg')
END
WHERE deleted_at IS NULL
  AND (vr_metadata IS NULL OR vr_metadata = '' OR vr_metadata NOT LIKE '%\"image\"%');

COMMIT;

-- Quick audit.
SELECT 'posts_total' AS metric, COUNT(*) AS value FROM posts WHERE deleted_at IS NULL
UNION ALL SELECT 'test_posts', COUNT(*) FROM posts WHERE deleted_at IS NULL AND (content LIKE '%E2E 测试%' OR content LIKE '%测试图片%' OR title LIKE '%测试%' OR (content_level = 'SNAPSHOT' AND COALESCE(NULLIF(TRIM(content), ''), '') = '' AND COALESCE(NULLIF(TRIM(title), ''), '') = '' AND COALESCE(NULLIF(TRIM(location_name), ''), '') = ''))
UNION ALL SELECT 'post_placeholder_covers', COUNT(*) FROM posts WHERE deleted_at IS NULL AND vr_metadata LIKE '%/api/placeholder/%'
UNION ALL SELECT 'dicebear_user_avatars', COUNT(*) FROM users WHERE avatar_url LIKE 'https://api.dicebear.com/%'
UNION ALL SELECT 'external_community_images', COUNT(*) FROM communities WHERE avatar_url LIKE 'http%' OR cover_url LIKE 'http%';
