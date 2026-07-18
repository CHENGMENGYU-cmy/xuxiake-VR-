-- ============================================================
-- 内容分类体系 - Phase 1
-- posts表新增post_type字段 + 创建post_tags表 + 创建topics表
-- ============================================================

USE xuxiake;

SET NAMES utf8mb4;

-- ============================================================
-- 1. posts表新增内容类型字段
-- ============================================================
ALTER TABLE posts
  ADD COLUMN post_type ENUM('NOTE','VR_MEDIA','ROUTE','JOURNEY','GUIDE','MOMENT')
    NOT NULL DEFAULT 'NOTE' COMMENT '内容形式：笔记/VR内容/路线/旅程/攻略/轻动态'
  AFTER community_id;

CREATE INDEX idx_posts_type ON posts (post_type);

-- ============================================================
-- 2. 帖子-标签关联表（复用interest_tags）
-- ============================================================
CREATE TABLE IF NOT EXISTS post_tags (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  post_id     VARCHAR(36) NOT NULL,
  tag_id      VARCHAR(36) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_post_tag_unique (post_id, tag_id),
  INDEX idx_pt_post (post_id),
  INDEX idx_pt_tag (tag_id),
  CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_tag  FOREIGN KEY (tag_id)  REFERENCES interest_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. 话题标签表（用户自建标签聚合）
-- ============================================================
CREATE TABLE IF NOT EXISTS topics (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL COMMENT '话题名称',
  icon        VARCHAR(20)  DEFAULT NULL COMMENT '话题图标',
  description TEXT         DEFAULT NULL COMMENT '话题描述',
  cover_url   VARCHAR(500) DEFAULT NULL COMMENT '话题封面图',
  post_count  INT          NOT NULL DEFAULT 0 COMMENT '关联帖子数',
  is_hot      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否热门话题',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_topic_name (name),
  INDEX idx_topic_hot (is_hot, post_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. 帖子-话题关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS post_topics (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  post_id     VARCHAR(36) NOT NULL,
  topic_id    VARCHAR(36) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_post_topic_unique (post_id, topic_id),
  INDEX idx_ppost_post (post_id),
  INDEX idx_ppost_topic (topic_id),
  CONSTRAINT fk_ppost_post  FOREIGN KEY (post_id)  REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_ppost_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
