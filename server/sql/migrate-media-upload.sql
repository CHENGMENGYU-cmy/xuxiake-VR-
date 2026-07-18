-- 媒体上传功能迁移
-- 扩展 messages 表 media_type，与 TypeORM 实体保持一致
ALTER TABLE messages MODIFY media_type ENUM('IMAGE','FILE','AUDIO','CARD') NOT NULL DEFAULT 'IMAGE';
