-- 用户角色字段
USE xuxiake;
SET NAMES utf8mb4;

ALTER TABLE users ADD COLUMN role ENUM('USER','MODERATOR','ADMIN') NOT NULL DEFAULT 'USER' AFTER updated_at;

-- 将第一个用户设为管理员（后续可通过管理后台修改）
UPDATE users SET role = 'ADMIN' WHERE id = (SELECT id FROM (SELECT id FROM users ORDER BY created_at ASC LIMIT 1) AS t);
