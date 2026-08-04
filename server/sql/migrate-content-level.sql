-- ============================================================
-- 迁移：content_level ENUM 新增 LOG（日志）、TRAVELOGUE（游记）
-- 数据模型：
--   SNAPSHOT   → 闪拍（原始捕捉）
--   CLASSIFIED → 内容分类
--   DIARY      → 日记（可独立发布）
--   ESSAY      → 游记/散文（已有）
--   LOG        → 日志（私人素材，不发布）
--   TRAVELOGUE → 游记（LOG + DIARY + 提示词 → AI 综合生成）
-- ============================================================

USE xuxiake;

ALTER TABLE posts
  MODIFY COLUMN content_level
    ENUM('SNAPSHOT','CLASSIFIED','DIARY','ESSAY','LOG','TRAVELOGUE')
    NOT NULL DEFAULT 'SNAPSHOT'
    COMMENT '内容层级：SNAPSHOT闪拍|CLASSIFIED分类|DIARY日记|ESSAY散文|LOG日志|TRAVELOGUE游记';

SELECT 'content_level migration done: added LOG, TRAVELOGUE' AS result;
