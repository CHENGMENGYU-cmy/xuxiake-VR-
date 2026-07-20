-- 为 conversation_participants 添加 status 列（消息请求功能）
-- 为 conversations 添加消失消息字段
-- 用 Navicat 右键 xuxiake → 运行 SQL 文件 → 选择此文件

USE xuxiake;
SET NAMES utf8mb4;

-- 1. conversation_participants 添加 status 列
ALTER TABLE conversation_participants
ADD COLUMN status ENUM('NORMAL','REQUEST','HIDDEN') NOT NULL DEFAULT 'NORMAL'
AFTER user_id;

-- 2. conversations 添加消失消息字段
ALTER TABLE conversations
ADD COLUMN is_disappearing TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN disappear_seconds INT NOT NULL DEFAULT 0;
