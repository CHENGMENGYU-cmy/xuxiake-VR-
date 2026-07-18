-- 社群挑战参与记录表
CREATE TABLE IF NOT EXISTS community_challenge_entries (
  id VARCHAR(36) PRIMARY KEY,
  challenge_id VARCHAR(36) NOT NULL COMMENT '挑战ID',
  user_id VARCHAR(36) NOT NULL COMMENT '参与者ID',
  post_id VARCHAR(36) DEFAULT NULL COMMENT '关联帖子ID',
  note TEXT DEFAULT NULL COMMENT '参与说明',
  score INT DEFAULT 0 COMMENT '得分/积分',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_challenge_user (challenge_id, user_id),
  KEY idx_entries_challenge (challenge_id),
  KEY idx_entries_user (user_id),
  CONSTRAINT fk_entries_challenge FOREIGN KEY (challenge_id) REFERENCES community_challenges(id) ON DELETE CASCADE,
  CONSTRAINT fk_entries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_entries_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群挑战参与记录';
