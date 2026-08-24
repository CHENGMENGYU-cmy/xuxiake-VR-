-- 将所有外部图片 URL（dicebear/unsplash/picsum）替换为本地动态占位图端点 /api/placeholder/:seed
-- 占位图由后端动态生成，风格统一、改一处即可；用户上传真实图片后替换该字段即可。

USE xuxiake;
SET NAMES utf8mb4;

-- 1. 用户头像：https://api.dicebear.com/9.x/avataaars/svg?seed=X → /api/placeholder/{username}
UPDATE users
SET avatar_url = CONCAT('/api/placeholder/', username)
WHERE avatar_url LIKE 'https://api.dicebear.com/%';

-- 2. 社群头像：/api/placeholder/community-{seed}
UPDATE communities
SET avatar_url = CONCAT('/api/placeholder/community-', SUBSTRING_INDEX(avatar_url, '=', -1))
WHERE avatar_url LIKE 'https://api.dicebear.com/%';

-- 3. 社群封面：/api/placeholder/cover-{seed}?type=landscape
UPDATE communities
SET cover_url = CONCAT('/api/placeholder/cover-', SUBSTRING_INDEX(SUBSTRING_INDEX(cover_url, '/seed/', -1), '/', 1), '?type=landscape')
WHERE cover_url LIKE 'https://picsum.photos/%';

-- 4. SNAPSHOT 帖子素材图：vr_metadata.image → /api/placeholder/{sanitized-location}?type=landscape
--    用 location_name 做 seed（去除空格和斜杠），占位图自动显示地点文字
UPDATE posts
SET vr_metadata = JSON_SET(
  vr_metadata,
  '$.image',
  CONCAT('/api/placeholder/', REPLACE(REPLACE(COALESCE(NULLIF(location_name, ''), '旅行'), '/', '-'), ' ', '-'), '?type=landscape')
)
WHERE content_level = 'SNAPSHOT'
  AND vr_metadata LIKE '%unsplash%';

-- 5. media_items 图片/缩略图：https://picsum.photos/seed/{seed}/{w}/{h} → /api/placeholder/{seed}?type=landscape
UPDATE media_items
SET url = CONCAT('/api/placeholder/', SUBSTRING_INDEX(SUBSTRING_INDEX(url, '/seed/', -1), '/', 1), '?type=landscape')
WHERE url LIKE 'https://picsum.photos/seed/%';

UPDATE media_items
SET thumbnail_url = CONCAT('/api/placeholder/', SUBSTRING_INDEX(SUBSTRING_INDEX(thumbnail_url, '/seed/', -1), '/', 1), '?type=landscape')
WHERE thumbnail_url LIKE 'https://picsum.photos/seed/%';

-- 6. 测试视频源不可用，替换为占位
UPDATE media_items
SET url = '/api/placeholder/video-placeholder?type=landscape',
    thumbnail_url = '/api/placeholder/video-placeholder?type=landscape'
WHERE url LIKE 'https://test-videos.co.uk/%';
