-- ============================================================
-- 迁移：content_level ENUM 对齐 3 级内容链条
-- 数据模型：
--   SNAPSHOT   → 闪拍（原始素材，仅自己可见）
--   DIARY      → 日记（可独立发布）
--   TRAVELOGUE → 游记（闪拍 + 日记 + AI 综合生成）
--   ESSAY      → 游记/散文（与 TRAVELOGUE 同属游记层级）
-- ============================================================

USE xuxiake;

ALTER TABLE posts
  MODIFY COLUMN content_level
    ENUM('SNAPSHOT','DIARY','TRAVELOGUE','ESSAY')
    NOT NULL DEFAULT 'SNAPSHOT'
    COMMENT '内容层级：SNAPSHOT闪拍|DIARY日记|TRAVELOGUE游记|ESSAY散文';

SELECT 'content_level migration aligned to 3-level chain' AS result;
