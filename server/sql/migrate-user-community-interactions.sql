USE xuxiake;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS user_community_interactions (
  id            VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id       VARCHAR(36) NOT NULL,
  community_id  VARCHAR(36) NOT NULL,
  action_type   ENUM('VIEW','LIKE','COMMENT','SHARE','JOIN') NOT NULL,
  weight        INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_uci_user (user_id),
  INDEX idx_uci_community (community_id),
  INDEX idx_uci_user_community (user_id, community_id),
  INDEX idx_uci_action (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
