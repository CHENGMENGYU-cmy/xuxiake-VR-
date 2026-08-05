-- ============================================================
-- 迁移：posts 新增行程字段（闪拍App tripId → 行程分组）
--   trip_id    行程ID（对应闪拍App的 trip.id）
--   trip_title 行程标题
-- 用于素材库"按行程"分组 + 行程一键生成游记
-- ============================================================

USE xuxiake;

ALTER TABLE posts
  ADD COLUMN trip_id VARCHAR(36) NULL COMMENT '行程ID（闪拍App tripId）' AFTER parent_post_id,
  ADD COLUMN trip_title VARCHAR(200) NULL COMMENT '行程标题' AFTER trip_id,
  ADD INDEX idx_posts_trip (trip_id);

SELECT 'trip fields migration done: added trip_id, trip_title, idx_posts_trip' AS result;
