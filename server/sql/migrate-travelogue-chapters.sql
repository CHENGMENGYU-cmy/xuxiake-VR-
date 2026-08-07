-- 图文叙事章节式游记：journeys 扩展元信息字段 + journey_stops 支持日期 + 新增 journey_stop_media 多图表
-- 2026-08-07

USE xuxiake;

ALTER TABLE journeys
  ADD COLUMN summary TEXT NULL AFTER cover_url,
  ADD COLUMN transport VARCHAR(50) NULL AFTER summary,
  ADD COLUMN budget VARCHAR(50) NULL AFTER transport,
  ADD COLUMN theme VARCHAR(50) NULL AFTER budget,
  ADD COLUMN insight TEXT NULL AFTER theme;

ALTER TABLE journey_stops
  ADD COLUMN day_date VARCHAR(20) NULL AFTER day_number;

CREATE TABLE IF NOT EXISTS journey_stop_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stop_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_stop_media_stop (stop_id),
  CONSTRAINT fk_stop_media_stop FOREIGN KEY (stop_id) REFERENCES journey_stops(id) ON DELETE CASCADE
);
