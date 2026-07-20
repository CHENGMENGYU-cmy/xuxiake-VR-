-- 安全添加缺失列
-- 在 Navicat 查询编辑器中逐条执行，遇到 "Duplicate column" 错误忽略即可
-- 用法：复制每条语句到 Navicat 查询窗口，点"运行"

USE xuxiake;
SET NAMES utf8mb4;

-- 第1条：conversation_participants 添加 status 列（已存在则报错忽略）
ALTER TABLE conversation_participants ADD COLUMN status ENUM('NORMAL','REQUEST','HIDDEN') NOT NULL DEFAULT 'NORMAL' AFTER user_id;

-- 第2条：conversations 添加 is_disappearing 列（已存在则报错忽略）
ALTER TABLE conversations ADD COLUMN is_disappearing TINYINT(1) NOT NULL DEFAULT 0;

-- 第3条：conversations 添加 disappear_seconds 列（已存在则报错忽略）
ALTER TABLE conversations ADD COLUMN disappear_seconds INT NOT NULL DEFAULT 0;
