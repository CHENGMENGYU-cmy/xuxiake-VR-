-- ============================================================
-- 社交功能 - 兴趣标签与社群系统
-- ============================================================

USE xuxiake;

SET NAMES utf8mb4;

-- ============================================================
-- 1. 兴趣标签表
-- ============================================================
CREATE TABLE IF NOT EXISTS interest_tags (
  id          VARCHAR(36)  NOT NULL PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL COMMENT '标签名称',
  category    VARCHAR(50)  NOT NULL COMMENT '标签分类：TRAVEL/VR/ACTIVITY/CULTURE/OTHER',
  icon        VARCHAR(50)  DEFAULT NULL COMMENT '标签图标',
  sort_order  INT          NOT NULL DEFAULT 0 COMMENT '排序权重',
  is_hot      TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否热门标签',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_tag_name (name),
  INDEX idx_tag_category (category),
  INDEX idx_tag_hot (is_hot, sort_order DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. 用户兴趣关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS user_interests (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  tag_id      VARCHAR(36) NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_user_tag_unique (user_id, tag_id),
  INDEX idx_ui_user (user_id),
  INDEX idx_ui_tag (tag_id),
  CONSTRAINT fk_ui_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ui_tag  FOREIGN KEY (tag_id)  REFERENCES interest_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. 社群表（扩展conversations表，添加社群专属字段）
-- ============================================================
CREATE TABLE IF NOT EXISTS communities (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  conversation_id VARCHAR(36)  NOT NULL COMMENT '关联的群聊会话ID',
  name            VARCHAR(100) NOT NULL COMMENT '社群名称',
  description     TEXT         COMMENT '社群描述',
  avatar_url      VARCHAR(500) COMMENT '社群头像',
  creator_id      VARCHAR(36)  NOT NULL COMMENT '创建者ID',
  member_count    INT          NOT NULL DEFAULT 0 COMMENT '成员数量',
  max_members     INT          NOT NULL DEFAULT 500 COMMENT '最大成员数',
  is_public       TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '是否公开可见',
  status          ENUM('ACTIVE','DISSOLVED') NOT NULL DEFAULT 'ACTIVE',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NULL DEFAULT NULL,
  UNIQUE INDEX idx_community_conv (conversation_id),
  INDEX idx_community_creator (creator_id),
  INDEX idx_community_public (is_public, status),
  CONSTRAINT fk_community_conv    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_community_creator FOREIGN KEY (creator_id)       REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. 社群兴趣标签关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS community_tags (
  id           VARCHAR(36) NOT NULL PRIMARY KEY,
  community_id VARCHAR(36) NOT NULL,
  tag_id       VARCHAR(36) NOT NULL,
  created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_community_tag_unique (community_id, tag_id),
  INDEX idx_ct_community (community_id),
  INDEX idx_ct_tag (tag_id),
  CONSTRAINT fk_ct_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  CONSTRAINT fk_ct_tag       FOREIGN KEY (tag_id)        REFERENCES interest_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 插入预设兴趣标签数据
-- ============================================================
INSERT INTO interest_tags (id, name, category, icon, sort_order, is_hot) VALUES
-- 旅行类
('tag-001', '自然风光', 'TRAVEL', '🏔️', 100, 1),
('tag-002', '历史古迹', 'TRAVEL', '🏛️', 95, 1),
('tag-003', '城市探索', 'TRAVEL', '🌆', 90, 1),
('tag-004', '乡村田园', 'TRAVEL', '🌾', 85, 0),
('tag-005', '海滨度假', 'TRAVEL', '🏖️', 88, 1),
('tag-006', '沙漠探险', 'TRAVEL', '🏜️', 70, 0),
('tag-007', '雪山攀登', 'TRAVEL', '🏔️', 65, 0),
('tag-008', '古镇漫游', 'TRAVEL', '🏘️', 82, 1),
-- VR技术类
('tag-009', 'VR全景拍摄', 'VR', '📷', 98, 1),
('tag-010', '360视频', 'VR', '🎬', 92, 1),
('tag-011', '空间视频', 'VR', '📹', 88, 1),
('tag-012', 'VR直播', 'VR', '📡', 75, 0),
('tag-013', 'VR后期制作', 'VR', '🖥️', 72, 0),
('tag-014', '设备评测', 'VR', '🎮', 80, 1),
-- 活动类
('tag-015', '徒步旅行', 'ACTIVITY', '🥾', 86, 1),
('tag-016', '自驾游', 'ACTIVITY', '🚗', 84, 1),
('tag-017', '骑行', 'ACTIVITY', '🚴', 78, 0),
('tag-018', '露营', 'ACTIVITY', '⛺', 82, 1),
('tag-019', '潜水', 'ACTIVITY', '🤿', 76, 0),
('tag-020', '摄影', 'ACTIVITY', '📸', 90, 1),
-- 文化类
('tag-021', '美食探店', 'CULTURE', '🍜', 88, 1),
('tag-022', '民俗文化', 'CULTURE', '🎭', 74, 0),
('tag-023', '非遗体验', 'CULTURE', '🎨', 72, 0),
('tag-024', '博物馆', 'CULTURE', '🏛️', 80, 1),
('tag-025', '寺庙祈福', 'CULTURE', '🛕', 68, 0),
-- 其他
('tag-026', '旅行攻略', 'OTHER', '📝', 85, 1),
('tag-027', '穷游', 'OTHER', '💰', 78, 0),
('tag-028', '亲子游', 'OTHER', '👨‍👩‍👧', 82, 1),
('tag-029', '独自旅行', 'OTHER', '🧳', 76, 0),
('tag-030', '团队出行', 'OTHER', '👥', 74, 0);
