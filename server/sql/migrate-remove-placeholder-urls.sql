-- 移除头像和封面中的占位图URL，让系统使用默认的首字母+颜色背景
-- 这是真实社区的标准做法：用户未上传时显示首字母，上传后显示真实图片

USE xuxiake;
SET NAMES utf8mb4;

-- 1. 清除用户头像中的占位图URL
UPDATE users
SET avatar_url = NULL
WHERE avatar_url LIKE '/api/placeholder/%';

-- 2. 清除社群头像中的占位图URL
UPDATE communities
SET avatar_url = NULL
WHERE avatar_url LIKE '/api/placeholder/%';

-- 3. 清除社群封面中的占位图URL
UPDATE communities
SET cover_url = NULL
WHERE cover_url LIKE '/api/placeholder/%';

-- 4. 清除帖子素材中的占位图URL（vr_metadata.image）
UPDATE posts
SET vr_metadata = JSON_REMOVE(vr_metadata, '$.image')
WHERE vr_metadata LIKE '%/api/placeholder/%'
  AND JSON_CONTAINS_PATH(vr_metadata, 'one', '$.image');

-- 5. 清除 media_items 中的占位图URL
UPDATE media_items
SET url = NULL
WHERE url LIKE '/api/placeholder/%';

UPDATE media_items
SET thumbnail_url = NULL
WHERE thumbnail_url LIKE '/api/placeholder/%';
