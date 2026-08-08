-- 内容软删除：posts 表新增 deleted_at，删除改为逻辑删除，统计/列表统一排除
-- 2026-08-08

USE xuxiake;

ALTER TABLE posts
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at;
