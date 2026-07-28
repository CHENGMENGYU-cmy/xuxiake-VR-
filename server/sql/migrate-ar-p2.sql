USE xuxiake;
SET NAMES utf8mb4;

-- 视频弹幕表
CREATE TABLE IF NOT EXISTS video_comments (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  post_id     VARCHAR(36) NOT NULL,
  user_id     VARCHAR(36) NOT NULL,
  content     TEXT NOT NULL,
  time_offset DECIMAL(10,3) NOT NULL DEFAULT 0 COMMENT '视频时间位置',
  color       VARCHAR(20) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vc_post (post_id),
  INDEX idx_vc_post_time (post_id, time_offset),
  CONSTRAINT fk_vc_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_vc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 音频专辑表
CREATE TABLE IF NOT EXISTS audio_playlists (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id         VARCHAR(36) NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT NULL,
  cover_url       VARCHAR(500) NULL,
  track_count     INT NOT NULL DEFAULT 0,
  total_duration  INT NOT NULL DEFAULT 0 COMMENT '总时长(秒)',
  is_public       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ap_user (user_id),
  CONSTRAINT fk_ap_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 音频专辑-帖子关联表
CREATE TABLE IF NOT EXISTS audio_playlist_items (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  playlist_id     VARCHAR(36) NOT NULL,
  post_id         VARCHAR(36) NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  added_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_api_unique (playlist_id, post_id),
  CONSTRAINT fk_api_playlist FOREIGN KEY (playlist_id) REFERENCES audio_playlists(id) ON DELETE CASCADE,
  CONSTRAINT fk_api_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
