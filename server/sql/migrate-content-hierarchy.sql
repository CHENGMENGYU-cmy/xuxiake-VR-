-- ============================================================
-- 内容层级体系迁移（历史：已由 schema.sql + migrate-content-level.sql 对齐 3 级链条）
-- 闪拍(SNAPSHOT) → 日记(DIARY) → 游记(TRAVELOGUE/ESSAY)
-- ============================================================

ALTER TABLE posts
  ADD COLUMN content_level ENUM('SNAPSHOT','DIARY','TRAVELOGUE','ESSAY') NOT NULL DEFAULT 'SNAPSHOT' COMMENT '内容层级' AFTER post_type,
  ADD COLUMN parent_post_id VARCHAR(36) NULL COMMENT '上级内容ID，用于内容层级关联' AFTER content_level,
  ADD INDEX idx_posts_content_level (content_level),
  ADD INDEX idx_posts_parent (parent_post_id),
  ADD CONSTRAINT fk_posts_parent FOREIGN KEY (parent_post_id) REFERENCES posts(id) ON DELETE SET NULL;
