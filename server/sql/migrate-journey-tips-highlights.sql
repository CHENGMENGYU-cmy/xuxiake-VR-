-- 游记功能升级 V1：增加推荐亮点和实用贴士字段
-- 日期：2026-08-12
-- 用途：游记详情页融合主流社区风格，每章支持推荐亮点和实用贴士

-- journeys 表增加整体旅行贴士
ALTER TABLE journeys ADD COLUMN tips TEXT NULL AFTER insight;

-- journey_stops 表增加推荐亮点和当天贴士
ALTER TABLE journey_stops ADD COLUMN highlights TEXT NULL AFTER description;
ALTER TABLE journey_stops ADD COLUMN tips TEXT NULL AFTER highlights;
