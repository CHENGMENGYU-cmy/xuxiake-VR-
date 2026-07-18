-- ============================================================
-- 路线与旅程结构化数据
-- ============================================================

USE xuxiake;

SET NAMES utf8mb4;

-- ============================================================
-- 1. 路线详情表（ROUTE类型帖子的结构化数据）
-- ============================================================
CREATE TABLE IF NOT EXISTS route_details (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  post_id           VARCHAR(36) NOT NULL COMMENT '关联帖子ID',
  distance_km       DECIMAL(10,2) DEFAULT NULL COMMENT '距离（公里）',
  duration_minutes  INT DEFAULT NULL COMMENT '时长（分钟）',
  elevation_gain_m  INT DEFAULT NULL COMMENT '累计爬升（米）',
  difficulty        ENUM('EASY','MODERATE','HARD','EXPERT') DEFAULT 'MODERATE' COMMENT '难度等级',
  route_type        ENUM('HIKE','BIKE','DRIVE','PADDLE','CLIMB') DEFAULT 'HIKE' COMMENT '路线类型',
  gpx_data          TEXT DEFAULT NULL COMMENT 'GPX轨迹文件内容',
  waypoints         JSON DEFAULT NULL COMMENT '途经点JSON数组[{lat,lng,name,description}]',
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_route_post (post_id),
  CONSTRAINT fk_route_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. 旅程记录表（JOURNEY类型帖子的结构化数据）
-- ============================================================
CREATE TABLE IF NOT EXISTS journeys (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  post_id       VARCHAR(36) NOT NULL COMMENT '关联帖子ID',
  title         VARCHAR(200) NOT NULL COMMENT '旅程标题',
  start_date    DATE DEFAULT NULL COMMENT '开始日期',
  end_date      DATE DEFAULT NULL COMMENT '结束日期',
  destination   VARCHAR(200) DEFAULT NULL COMMENT '目的地',
  cover_url     VARCHAR(500) DEFAULT NULL COMMENT '旅程封面图',
  stop_count    INT NOT NULL DEFAULT 0 COMMENT '站点数量',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_journey_post (post_id),
  CONSTRAINT fk_journey_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. 旅程站点表
-- ============================================================
CREATE TABLE IF NOT EXISTS journey_stops (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  journey_id      INT NOT NULL COMMENT '所属旅程ID',
  day_number      INT DEFAULT NULL COMMENT '第几天',
  location_name   VARCHAR(200) DEFAULT NULL COMMENT '地点名称',
  location_lat    DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  location_lng    DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  description     TEXT DEFAULT NULL COMMENT '站点描述',
  media_url       VARCHAR(500) DEFAULT NULL COMMENT '站点照片/视频URL',
  sort_order      INT NOT NULL DEFAULT 0 COMMENT '排序',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_stop_journey (journey_id),
  CONSTRAINT fk_stop_journey FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
