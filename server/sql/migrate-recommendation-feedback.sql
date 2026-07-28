USE xuxiake;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  target_id   VARCHAR(36) NOT NULL,
  target_type ENUM('COMMUNITY','USER') NOT NULL,
  type        ENUM('NOT_INTERESTED','INTERESTED','CLICK','VIEW') NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_feedback_user (user_id),
  INDEX idx_feedback_target (target_type, target_id),
  UNIQUE INDEX idx_feedback_unique (user_id, target_id, target_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
