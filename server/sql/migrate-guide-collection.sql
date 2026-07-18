-- ============================================================
-- 攻略详情 + 内容合集
-- ============================================================

USE xuxiake;

SET NAMES utf8mb4;

-- ============================================================
-- 1. 攻略详情表（GUIDE类型帖子的结构化数据）
-- ============================================================
CREATE TABLE IF NOT EXISTS guide_details (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  post_id         VARCHAR(36) NOT NULL COMMENT '关联帖子ID',
  destination     VARCHAR(200) DEFAULT NULL COMMENT '目的地',
  category        ENUM('FOOD','STAY','TRANSPORT','TICKET','TIPS') DEFAULT 'TIPS' COMMENT '攻略分类',
  best_season     VARCHAR(50) DEFAULT NULL COMMENT '最佳季节',
  budget_level    ENUM('BUDGET','MID','LUXURY') DEFAULT 'MID' COMMENT '预算等级',
  rich_content    LONGTEXT DEFAULT NULL COMMENT '富文本/Markdown长内容',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_guide_post (post_id),
  CONSTRAINT fk_guide_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. 内容合集表（策展/收藏夹）
-- ============================================================
CREATE TABLE IF NOT EXISTS collections (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  creator_id      VARCHAR(36) NOT NULL COMMENT '创建者ID',
  name            VARCHAR(200) NOT NULL COMMENT '合集名称',
  description     TEXT DEFAULT NULL COMMENT '合集描述',
  cover_url       VARCHAR(500) DEFAULT NULL COMMENT '合集封面图',
  is_public       TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否公开',
  post_count      INT NOT NULL DEFAULT 0 COMMENT '收录帖子数',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_collection_creator (creator_id),
  INDEX idx_collection_public (is_public, post_count DESC),
  CONSTRAINT fk_collection_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. 合集-帖子关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS collection_posts (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  collection_id   VARCHAR(36) NOT NULL,
  post_id         VARCHAR(36) NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0 COMMENT '排序',
  added_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_cp_unique (collection_id, post_id),
  INDEX idx_cp_collection (collection_id),
  INDEX idx_cp_post (post_id),
  CONSTRAINT fk_cp_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
