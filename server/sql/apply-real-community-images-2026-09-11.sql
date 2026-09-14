-- 将社区演示图片从插画占位图切换为本地真实地点照片
-- 执行前建议备份数据库：backup-xuxiake-before-real-images-2026-09-11.sql

UPDATE communities
SET avatar_url = REPLACE(avatar_url, '/uploads/demo-covers/', '/uploads/real-covers/')
WHERE avatar_url LIKE '/uploads/demo-covers/%.jpg';

UPDATE communities
SET cover_url = REPLACE(cover_url, '/uploads/demo-covers/', '/uploads/real-covers/')
WHERE cover_url LIKE '/uploads/demo-covers/%.jpg';

UPDATE media_items
SET url = REPLACE(url, '/uploads/demo-covers/', '/uploads/real-covers/')
WHERE url LIKE '/uploads/demo-covers/%.jpg';

UPDATE media_items
SET thumbnail_url = REPLACE(thumbnail_url, '/uploads/demo-covers/', '/uploads/real-covers/')
WHERE thumbnail_url LIKE '/uploads/demo-covers/%.jpg';

UPDATE posts
SET vr_metadata = JSON_SET(
  vr_metadata,
  '$.image',
  REPLACE(JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')), '/uploads/demo-covers/', '/uploads/real-covers/')
)
WHERE vr_metadata IS NOT NULL
  AND JSON_VALID(vr_metadata)
  AND JSON_UNQUOTE(JSON_EXTRACT(vr_metadata, '$.image')) LIKE '/uploads/demo-covers/%.jpg';
