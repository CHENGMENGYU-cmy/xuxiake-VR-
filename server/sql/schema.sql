-- ============================================================
-- XuXiaKe Database Schema (MySQL 5.6 兼容版)
-- 用 Navicat 右键 xuxiake → 运行 SQL 文件 → 选择此文件即可
-- JPA 的 @PrePersist/@PreUpdate 会自动填充时间，SQL 层仅做最简定义
-- ============================================================

CREATE DATABASE IF NOT EXISTS xuxiake
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE xuxiake;

SET NAMES utf8mb4;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                VARCHAR(36)  NOT NULL PRIMARY KEY,
  email             VARCHAR(191) NOT NULL,
  username          VARCHAR(50)  NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  display_name      VARCHAR(100) NOT NULL,
  xxk_number        VARCHAR(11)  NOT NULL COMMENT '徐霞客号，11位随机数字',
  bio               TEXT,
  avatar_url        VARCHAR(500),
  website           VARCHAR(500),
  gender            ENUM('MALE','FEMALE','OTHER','PRIVATE') DEFAULT 'PRIVATE' COMMENT '性别',
  birthday          DATE         COMMENT '生日',
  region            VARCHAR(100) COMMENT '地区',
  occupation        VARCHAR(100) COMMENT '职业',
  vr_device_model   VARCHAR(100),
  vr_device_version VARCHAR(50),
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NULL DEFAULT NULL,
  UNIQUE INDEX idx_users_email (email),
  UNIQUE INDEX idx_users_username (username),
  UNIQUE INDEX idx_users_xxk_number (xxk_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. user_follows
-- ============================================================
CREATE TABLE IF NOT EXISTS user_follows (
  id           VARCHAR(36) NOT NULL PRIMARY KEY,
  follower_id  VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_follow_unique (follower_id, following_id),
  INDEX idx_follow_follower (follower_id),
  INDEX idx_follow_following (following_id),
  CONSTRAINT fk_follow_follower  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_follow_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id            VARCHAR(36) NOT NULL PRIMARY KEY,
  author_id     VARCHAR(36) NOT NULL,
  content       TEXT,
  location_lat  DECIMAL(10,7),
  location_lng  DECIMAL(10,7),
  location_name VARCHAR(200),
  vr_metadata   TEXT COMMENT 'JSON格式VR元数据',
  visibility    ENUM('PUBLIC','FOLLOWERS','PRIVATE') NOT NULL DEFAULT 'PUBLIC',
  like_count    INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  view_count    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_posts_author (author_id),
  INDEX idx_posts_created (created_at DESC),
  INDEX idx_posts_view (view_count DESC),
  INDEX idx_posts_like (like_count DESC),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. media_items
-- ============================================================
CREATE TABLE IF NOT EXISTS media_items (
  id               VARCHAR(36) NOT NULL PRIMARY KEY,
  post_id          VARCHAR(36) NOT NULL,
  type             ENUM('VIDEO','IMAGE','AUDIO','LINK','TRANSLATION') NOT NULL,
  url              VARCHAR(500),
  thumbnail_url    VARCHAR(500),
  hls_url          VARCHAR(500),
  duration         INT,
  width            INT,
  height           INT,
  vr_format        ENUM('STANDARD','VR180','VR360','SPATIAL'),
  language         VARCHAR(10),
  translated_text  TEXT,
  link_url         VARCHAR(500),
  link_title       VARCHAR(500),
  link_description TEXT,
  link_favicon     VARCHAR(500),
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_post (post_id),
  CONSTRAINT fk_media_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. comments
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id         VARCHAR(36) NOT NULL PRIMARY KEY,
  post_id    VARCHAR(36) NOT NULL,
  author_id  VARCHAR(36) NOT NULL,
  parent_id  VARCHAR(36),
  content    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comments_post   (post_id, created_at),
  INDEX idx_comments_parent (parent_id),
  INDEX idx_comments_author (author_id),
  CONSTRAINT fk_comments_post   FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. likes
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  id         VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id    VARCHAR(36) NOT NULL,
  post_id    VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_likes_unique (user_id, post_id),
  INDEX idx_likes_post (post_id),
  CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id           VARCHAR(36)  NOT NULL PRIMARY KEY,
  recipient_id VARCHAR(36)  NOT NULL,
  sender_id    VARCHAR(36),
  type         ENUM('LIKE','COMMENT','FOLLOW','SYSTEM','MESSAGE') NOT NULL,
  message      VARCHAR(500) NOT NULL,
  post_id      VARCHAR(36),
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_recipient (recipient_id, is_read, created_at DESC),
  INDEX idx_notif_sender    (sender_id),
  INDEX idx_notif_post      (post_id),
  CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_sender    FOREIGN KEY (sender_id)    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notif_post      FOREIGN KEY (post_id)      REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id         VARCHAR(36) NOT NULL PRIMARY KEY,
  type       ENUM('DIRECT','GROUP') NOT NULL,
  title      VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_conv_updated (updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. conversation_participants
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  user_id         VARCHAR(36) NOT NULL,
  last_read_at    TIMESTAMP NULL DEFAULT NULL,
  joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_cp_unique (conversation_id, user_id),
  INDEX idx_cp_user (user_id),
  CONSTRAINT fk_cp_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_user FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              VARCHAR(36) NOT NULL PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  sender_id       VARCHAR(36) NOT NULL,
  content         TEXT,
  media_url       VARCHAR(500),
  media_type      ENUM('IMAGE','FILE'),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_msg_conv (conversation_id, created_at),
  CONSTRAINT fk_msg_conv   FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
