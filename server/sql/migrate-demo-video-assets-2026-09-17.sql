-- 演示视频素材此前统一指向 /uploads/demo-videos/preview-unavailable.mp4，
-- 但该文件在磁盘上并不存在，6 条 VIDEO 素材只能靠前端降级显示封面。
-- 现改为指向真实可播放的 /uploads/demo-videos/travel-demo.mp4。
--
-- 前置步骤（运行时目录不入库，需要先恢复资产）：
--   node server/scripts/restore-demo-videos.mjs --copy
--
-- 本次迁移前已备份：backup-xuxiake-before-publish-chain-cleanup-2026-09-17.sql

UPDATE media_items
SET url = '/uploads/demo-videos/travel-demo.mp4'
WHERE type = 'VIDEO'
  AND url = '/uploads/demo-videos/preview-unavailable.mp4';

-- 校验：应为 0 条仍指向已废弃的占位文件
SELECT COUNT(*) AS stale_placeholder_count
FROM media_items
WHERE url = '/uploads/demo-videos/preview-unavailable.mp4';

-- 校验：应有 6 条指向真实视频
SELECT COUNT(*) AS playable_video_count
FROM media_items
WHERE type = 'VIDEO'
  AND url = '/uploads/demo-videos/travel-demo.mp4';
