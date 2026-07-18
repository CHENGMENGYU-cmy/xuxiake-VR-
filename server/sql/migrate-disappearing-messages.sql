-- 消失消息字段
ALTER TABLE `conversations` ADD COLUMN `is_disappearing` tinyint(1) NOT NULL DEFAULT 0 AFTER `updated_at`;
ALTER TABLE `conversations` ADD COLUMN `disappear_seconds` int NOT NULL DEFAULT 0 AFTER `is_disappearing`;
