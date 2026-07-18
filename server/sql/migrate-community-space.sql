-- 社群空间功能数据库迁移
-- 扩展 communities 表，新增社群管理相关表，posts 表关联社群

-- 1. 扩展 communities 表
ALTER TABLE communities
  ADD COLUMN cover_url VARCHAR(500) DEFAULT NULL COMMENT '社群封面图URL' AFTER avatar_url,
  ADD COLUMN rules TEXT DEFAULT NULL COMMENT '社群规则' AFTER description,
  ADD COLUMN category VARCHAR(50) DEFAULT NULL COMMENT '社群分类' AFTER status,
  ADD COLUMN location_name VARCHAR(200) DEFAULT NULL COMMENT '社群地理位置' AFTER category;

-- 2. posts 表添加 community_id 关联
ALTER TABLE posts
  ADD COLUMN community_id VARCHAR(36) DEFAULT NULL COMMENT '关联社群ID' AFTER author_id,
  ADD KEY idx_posts_community (community_id),
  ADD CONSTRAINT fk_posts_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL;

-- 3. 社群公告表
CREATE TABLE IF NOT EXISTS community_announcements (
  id VARCHAR(36) PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
  author_id VARCHAR(36) NOT NULL COMMENT '发布者ID',
  title VARCHAR(200) NOT NULL COMMENT '公告标题',
  content TEXT NOT NULL COMMENT '公告内容',
  is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_announcements_community (community_id),
  CONSTRAINT fk_announcements_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群公告';

-- 4. 社群角色表（管理员/版主）
CREATE TABLE IF NOT EXISTS community_roles (
  id VARCHAR(36) PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  role ENUM('ADMIN', 'MODERATOR') DEFAULT 'ADMIN' COMMENT '角色类型',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_community_user (community_id, user_id),
  KEY idx_roles_community (community_id),
  KEY idx_roles_user (user_id),
  CONSTRAINT fk_roles_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  CONSTRAINT fk_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群角色';

-- 5. 社群挑战活动表
CREATE TABLE IF NOT EXISTS community_challenges (
  id VARCHAR(36) PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
  creator_id VARCHAR(36) NOT NULL COMMENT '创建者ID',
  title VARCHAR(200) NOT NULL COMMENT '挑战标题',
  description TEXT DEFAULT NULL COMMENT '挑战描述',
  type ENUM('PHOTO', 'ROUTE', 'CHECKIN', 'DISTANCE') DEFAULT 'PHOTO' COMMENT '挑战类型',
  start_date TIMESTAMP NOT NULL COMMENT '开始时间',
  end_date TIMESTAMP NOT NULL COMMENT '结束时间',
  max_participants INT DEFAULT 0 COMMENT '最大参与人数，0表示不限',
  participant_count INT DEFAULT 0 COMMENT '当前参与人数',
  status ENUM('UPCOMING', 'ACTIVE', 'ENDED') DEFAULT 'UPCOMING' COMMENT '挑战状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_challenges_community (community_id),
  KEY idx_challenges_status (status),
  CONSTRAINT fk_challenges_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  CONSTRAINT fk_challenges_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社群挑战活动';
