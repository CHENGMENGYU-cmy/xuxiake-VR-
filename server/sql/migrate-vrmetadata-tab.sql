-- 迁移旧帖子，补上 vrMetadata.tab 字段
-- 根据 postType + contentLevel 反推原始 Tab

-- 日记 (DIARY contentLevel)
UPDATE posts SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.tab', 'DIARY')
WHERE content_level = 'DIARY' AND (vr_metadata IS NULL OR JSON_EXTRACT(vr_metadata, '$.tab') IS NULL);

-- 游记 (ESSAY contentLevel 或 postType=JOURNEY)
UPDATE posts SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.tab', 'JOURNEY')
WHERE (content_level = 'ESSAY' OR post_type = 'JOURNEY') AND (vr_metadata IS NULL OR JSON_EXTRACT(vr_metadata, '$.tab') IS NULL);

-- VR_MEDIA 第一视角 (VIDEO)
UPDATE posts SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.tab', 'VIDEO')
WHERE post_type = 'VR_MEDIA' AND (vr_metadata IS NULL OR JSON_EXTRACT(vr_metadata, '$.tab') IS NULL);

-- MOMENT 语音记录
UPDATE posts SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.tab', 'AUDIO')
WHERE post_type = 'MOMENT' AND (vr_metadata IS NULL OR JSON_EXTRACT(vr_metadata, '$.tab') IS NULL);

-- NOTE 随记（未被上面覆盖的）
UPDATE posts SET vr_metadata = JSON_SET(COALESCE(vr_metadata, '{}'), '$.tab', 'IMAGE')
WHERE post_type = 'NOTE' AND content_level = 'SNAPSHOT' AND (vr_metadata IS NULL OR JSON_EXTRACT(vr_metadata, '$.tab') IS NULL);

SELECT 'migration done' AS result;
