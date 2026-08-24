-- 为 SNAPSHOT 帖子添加图片 URL（解决素材库图片不显示问题）
-- 根据 location_name 匹配合适的 Unsplash 图片

USE xuxiake;
SET NAMES utf8mb4;

-- 漓江相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1537531383496-f4749b8032cf?w=400')
WHERE content_level = 'SNAPSHOT'
  AND location_name LIKE '%漓江%'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 西湖相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1599707254554-027aeb4de013?w=400')
WHERE content_level = 'SNAPSHOT'
  AND location_name LIKE '%西湖%'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 张家界相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=400')
WHERE content_level = 'SNAPSHOT'
  AND location_name LIKE '%张家界%'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 敦煌相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=400')
WHERE content_level = 'SNAPSHOT'
  AND location_name LIKE '%敦煌%'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 成都相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1609753058587-9f4e4b8d6c7c?w=400')
WHERE content_level = 'SNAPSHOT'
  AND location_name LIKE '%成都%'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 北京相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400')
WHERE content_level = 'SNAPSHOT'
  AND location_name LIKE '%北京%'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 厦门相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1567358325265-7d949b3e7f52?w=400')
WHERE content_level = 'SNAPSHOT'
  AND location_name LIKE '%厦门%'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 云南相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400')
WHERE content_level = 'SNAPSHOT'
  AND (location_name LIKE '%云南%' OR location_name LIKE '%丽江%' OR location_name LIKE '%大理%')
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 西藏相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1461823385004-d7660947a7c0?w=400')
WHERE content_level = 'SNAPSHOT'
  AND (location_name LIKE '%西藏%' OR location_name LIKE '%拉萨%')
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 海南相关
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400')
WHERE content_level = 'SNAPSHOT'
  AND (location_name LIKE '%海南%' OR location_name LIKE '%三亚%')
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);

-- 其他未匹配的 SNAPSHOT 帖子使用默认旅行图片
UPDATE posts
SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.image', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400')
WHERE content_level = 'SNAPSHOT'
  AND (vr_metadata NOT LIKE '%"image"%' OR vr_metadata IS NULL);
