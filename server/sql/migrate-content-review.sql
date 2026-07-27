-- ============================================================
-- 内容审核体系
-- content_reviews: 审核队列
-- reports: 用户举报
-- ============================================================

USE xuxiake;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS content_reviews (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  post_id     VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NULL,
  status      ENUM('PENDING','APPROVED','REJECTED','FLAGGED') NOT NULL DEFAULT 'PENDING',
  risk_type   VARCHAR(50) NULL COMMENT '敏感词/违规图片/隐私信息/其他',
  risk_detail TEXT NULL,
  reason      TEXT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  INDEX idx_review_status (status),
  INDEX idx_review_post (post_id),
  CONSTRAINT fk_review_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  reporter_id VARCHAR(36) NOT NULL,
  post_id     VARCHAR(36) NOT NULL,
  reason      VARCHAR(100) NOT NULL,
  detail      TEXT NULL,
  status      ENUM('PENDING','RESOLVED','DISMISSED') NOT NULL DEFAULT 'PENDING',
  resolved_by VARCHAR(36) NULL,
  resolution  TEXT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  INDEX idx_report_status (status),
  INDEX idx_report_post (post_id),
  CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
