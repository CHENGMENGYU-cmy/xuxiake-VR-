-- 修复素材库图片：将 vr_metadata.image 中的中文路径替换为 post ID（URL安全）
-- 使用 post ID 作为占位图 seed，避免中文URL编码问题

USE xuxiake;
SET NAMES utf8mb4;

-- 将所有包含 /api/placeholder/ 且含中文的 image URL 替换为使用 post ID
UPDATE posts
SET vr_metadata = JSON_SET(
  vr_metadata,
  '$.image',
  CONCAT('/api/placeholder/snap-', id, '?type=landscape')
)
WHERE content_level = 'SNAPSHOT'
  AND vr_metadata LIKE '%/api/placeholder/%'
  AND vr_metadata LIKE '%type=landscape%';
