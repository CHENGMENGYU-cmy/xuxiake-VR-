-- ============================================================
-- Demo community enrichment data
-- Date: 2026-09-11
--
-- Purpose:
-- 1. Make the local preview feel like a real community.
-- 2. Attach posts to communities.
-- 3. Add media items for snapshot/media discovery.
-- 4. Add likes and comments with uneven distribution.
--
-- Safe to re-run: rows use stable demo IDs or delete their own demo prefix.
-- Run after backing up the database.
-- ============================================================

USE xuxiake;
SET NAMES utf8mb4;

START TRANSACTION;

-- ------------------------------------------------------------
-- 0. Remove previous enrichment rows created by this script.
-- ------------------------------------------------------------
DELETE FROM comments WHERE id LIKE 'demo-comment-%';
DELETE FROM likes WHERE id LIKE 'demo-like-%';
DELETE FROM media_items WHERE id LIKE 'demo-media-%';

-- ------------------------------------------------------------
-- 1. Attach public demo posts to communities.
-- ------------------------------------------------------------
UPDATE posts
SET community_id = 'com1'
WHERE deleted_at IS NULL
  AND visibility = 'PUBLIC'
  AND (
    location_name LIKE '%漓江%'
    OR location_name LIKE '%阳朔%'
    OR location_name LIKE '%西湖%'
    OR title LIKE '%VR%'
    OR title LIKE '%科技%'
  );

UPDATE posts
SET community_id = 'com2'
WHERE deleted_at IS NULL
  AND visibility = 'PUBLIC'
  AND (
    location_name LIKE '%稻城%'
    OR location_name LIKE '%哈巴%'
    OR location_name LIKE '%亚布力%'
    OR location_name LIKE '%蜈支洲%'
    OR title LIKE '%雪山%'
    OR title LIKE '%潜水%'
    OR title LIKE '%滑雪%'
  );

UPDATE posts
SET community_id = 'com3'
WHERE deleted_at IS NULL
  AND visibility = 'PUBLIC'
  AND (
    location_name LIKE '%长沙%'
    OR title LIKE '%美食%'
    OR title LIKE '%臭豆腐%'
  );

-- ------------------------------------------------------------
-- 2. Add media items so /media has real entries.
-- ------------------------------------------------------------
INSERT INTO media_items (id, post_id, type, url, thumbnail_url, width, height, vr_format, sort_order, text_note)
SELECT
  CONCAT('demo-media-', LEFT(MD5(id), 25)),
  id,
  'IMAGE',
  JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')),
  JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')),
  1600,
  900,
  CASE
    WHEN location_name LIKE '%漓江%' OR location_name LIKE '%西湖%' OR location_name LIKE '%苏州%' THEN 'VR180'
    WHEN location_name LIKE '%稻城%' OR location_name LIKE '%哈巴%' OR location_name LIKE '%亚布力%' OR location_name LIKE '%蜈支洲%' THEN 'VR360'
    ELSE 'STANDARD'
  END,
  0,
  CONCAT('演示素材：', COALESCE(location_name, '旅行记录'))
FROM posts
WHERE deleted_at IS NULL
  AND visibility = 'PUBLIC'
  AND JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')) IS NOT NULL;

INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order, text_note)
SELECT
  CONCAT('demo-media-video-', LEFT(MD5(id), 19)),
  id,
  'VIDEO',
  '/uploads/demo-videos/preview-unavailable.mp4',
  JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')),
  45,
  1600,
  900,
  CASE
    WHEN location_name LIKE '%漓江%' OR location_name LIKE '%稻城%' OR location_name LIKE '%哈巴%' OR location_name LIKE '%亚布力%' THEN 'VR360'
    ELSE 'SPATIAL'
  END,
  1,
  CONCAT('演示视频：', COALESCE(title, location_name, '旅行短片'))
FROM (
  SELECT *
  FROM posts
  WHERE deleted_at IS NULL
    AND visibility = 'PUBLIC'
    AND content_level = 'TRAVELOGUE'
    AND JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')) IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 6
) AS video_posts;

INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, width, height, vr_format, sort_order, text_note)
SELECT
  CONCAT('demo-media-audio-', LEFT(MD5(id), 19)),
  id,
  'AUDIO',
  '/uploads/demo-audio/travel-note.wav',
  JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')),
  12,
  NULL,
  NULL,
  NULL,
  2,
  CONCAT('演示语音：', COALESCE(location_name, '旅行现场记录'))
FROM (
  SELECT *
  FROM posts
  WHERE deleted_at IS NULL
    AND visibility = 'PUBLIC'
    AND content_level = 'DIARY'
    AND JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')) IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 6
) AS audio_posts;

-- ------------------------------------------------------------
-- 3. Add uneven likes. Authors do not like their own posts.
-- ------------------------------------------------------------
INSERT INTO likes (id, post_id, user_id, created_at)
SELECT CONCAT('demo-like-', LEFT(MD5(CONCAT(p.id, '-', u.id)), 26)), p.id, u.id, DATE_ADD(p.created_at, INTERVAL (ASCII(RIGHT(u.id, 1)) % 72) HOUR)
FROM posts p
JOIN users u ON u.id <> p.author_id
WHERE p.deleted_at IS NULL
  AND p.visibility = 'PUBLIC'
  AND (
    (p.content_level = 'TRAVELOGUE' AND u.id IN ('u1','u3','u4','u5','u6','u7','u8','u9'))
    OR (p.content_level = 'DIARY' AND u.id IN ('u1','u4','u6','u8'))
    OR (p.content_level = 'SNAPSHOT' AND u.id IN ('u1','u3','u5'))
  );

-- ------------------------------------------------------------
-- 4. Add natural comments to public diary/travelogue posts.
-- ------------------------------------------------------------
INSERT INTO comments (id, post_id, author_id, content, created_at)
SELECT CONCAT('demo-comment-', LEFT(MD5(CONCAT(p.id, '-1')), 23)), p.id,
  CASE
    WHEN p.author_id <> 'u1' THEN 'u1'
    ELSE 'u2'
  END,
  CASE
    WHEN p.location_name LIKE '%漓江%' THEN '这篇的等待感很强，适合放到 VR 拍摄技巧话题里做示例。'
    WHEN p.location_name LIKE '%西湖%' THEN '设备测评和旅行感受结合得很好，想看更多拍摄参数。'
    WHEN p.location_name LIKE '%稻城%' THEN '高海拔路线写得很细，氧气和时间安排对新手很有帮助。'
    WHEN p.location_name LIKE '%哈巴%' THEN '登顶部分很有画面感，安全装备清单可以再单独整理一版。'
    WHEN p.location_name LIKE '%长沙%' THEN '美食路线很实用，适合收藏成一天打卡攻略。'
    WHEN p.location_name LIKE '%苏州%' THEN '从园林讲到 VR 空间设计，这个角度很新。'
    WHEN p.location_name LIKE '%蜈支洲%' THEN '水下 VR 素材很适合做沉浸式展示，期待视频版。'
    WHEN p.location_name LIKE '%兵马俑%' THEN '历史细节写得很稳，适合做文化遗产专题。'
    WHEN p.location_name LIKE '%亚布力%' THEN '速度感和专注感写出来了，滑雪路线可以加难度标注。'
    ELSE '内容很完整，适合作为社区推荐样例。'
  END,
  DATE_ADD(p.created_at, INTERVAL 2 HOUR)
FROM posts p
WHERE p.deleted_at IS NULL
  AND p.visibility = 'PUBLIC'
  AND p.content_level IN ('DIARY','TRAVELOGUE');

INSERT INTO comments (id, post_id, author_id, content, created_at)
SELECT CONCAT('demo-comment-', LEFT(MD5(CONCAT(p.id, '-2')), 23)), p.id,
  CASE
    WHEN p.author_id <> 'u3' THEN 'u3'
    ELSE 'u4'
  END,
  CASE
    WHEN p.content_level = 'TRAVELOGUE' THEN '这篇可以再配一张路线图，读起来会更像完整攻略。'
    ELSE '这段日记很自然，适合继续生成一篇更完整的游记。'
  END,
  DATE_ADD(p.created_at, INTERVAL 5 HOUR)
FROM posts p
WHERE p.deleted_at IS NULL
  AND p.visibility = 'PUBLIC'
  AND p.content_level IN ('DIARY','TRAVELOGUE')
  AND (
    p.location_name LIKE '%漓江%'
    OR p.location_name LIKE '%西湖%'
    OR p.location_name LIKE '%稻城%'
    OR p.location_name LIKE '%长沙%'
    OR p.location_name LIKE '%苏州%'
  );

-- ------------------------------------------------------------
-- 5. Refresh community challenge windows for the current demo period.
-- ------------------------------------------------------------
UPDATE community_challenges
SET
  title = '9月VR旅行创作挑战',
  description = '用VR设备记录一段9月旅途。可以是城市夜景、山水风光、博物馆展陈或街头生活。\n\n🏆 奖品：\n- 一等奖：Insta360自拍杆\n- 二等奖：VR清洁套装\n- 三等奖：定制手机壳\n\n📏 要求：VR360或空间视频，标注地点和设备。',
  start_date = '2026-09-01 00:00:00',
  end_date = '2026-09-30 23:59:59',
  max_participants = 50,
  status = 'ACTIVE'
WHERE id = 'ch1';

UPDATE community_challenges
SET
  title = '国庆VR设备开箱挑战',
  description = '新买了VR设备？拍一段开箱视频或第一次试拍体验，分享设备优缺点、使用场景和画面样张。',
  start_date = '2026-10-01 00:00:00',
  end_date = '2026-10-15 23:59:59',
  max_participants = 30,
  status = 'UPCOMING'
WHERE id = 'ch2';

UPDATE community_challenges
SET
  title = '9月百公里徒步挑战',
  start_date = '2026-09-01 00:00:00',
  end_date = '2026-09-30 23:59:59',
  status = 'ACTIVE'
WHERE id = 'ch3';

UPDATE community_challenges
SET
  start_date = '2026-09-01 00:00:00',
  end_date = '2026-12-31 23:59:59',
  status = 'ACTIVE'
WHERE id = 'ch4';

UPDATE community_challenges
SET
  title = '秋季城市美食探店接力',
  start_date = '2026-09-01 00:00:00',
  end_date = '2026-10-20 23:59:59',
  status = 'ACTIVE'
WHERE id = 'ch5';

UPDATE community_challenges
SET
  title = '10月早餐打卡30天',
  start_date = '2026-10-01 00:00:00',
  end_date = '2026-10-30 23:59:59',
  status = 'UPCOMING'
WHERE id = 'ch6';

UPDATE community_challenges c
SET participant_count = (
  SELECT COUNT(*)
  FROM community_challenge_entries e
  WHERE e.challenge_id = c.id
)
WHERE c.id IN ('ch1','ch2','ch3','ch4','ch5','ch6');

-- ------------------------------------------------------------
-- 6. Recompute counters used by cards and side panels.
-- ------------------------------------------------------------
UPDATE posts p
SET like_count = (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id),
    comment_count = (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id),
    view_count = GREATEST(
      view_count,
      CASE
        WHEN content_level = 'TRAVELOGUE' THEN 120 + like_count * 9
        WHEN content_level = 'DIARY' THEN 60 + like_count * 7
        ELSE 30 + like_count * 5
      END
    )
WHERE p.deleted_at IS NULL;

UPDATE communities c
SET member_count = (
  SELECT COUNT(DISTINCT user_id)
  FROM conversation_participants cp
  WHERE cp.conversation_id = c.conversation_id
)
WHERE c.id IN ('com1','com2','com3');

UPDATE topics t
SET post_count = (
  SELECT COUNT(*)
  FROM post_topics pt
  JOIN posts p ON p.id = pt.post_id AND p.deleted_at IS NULL
  WHERE pt.topic_id = t.id
);

COMMIT;

SELECT 'posts' AS metric, COUNT(*) AS value FROM posts WHERE deleted_at IS NULL
UNION ALL SELECT 'community_posts', COUNT(*) FROM posts WHERE deleted_at IS NULL AND community_id IS NOT NULL
UNION ALL SELECT 'media_items', COUNT(*) FROM media_items
UNION ALL SELECT 'demo_media_items', COUNT(*) FROM media_items WHERE id LIKE 'demo-media-%'
UNION ALL SELECT 'likes', COUNT(*) FROM likes
UNION ALL SELECT 'comments', COUNT(*) FROM comments;
