-- 添加 phone 列到 users 表
USE xuxiake;

ALTER TABLE users
ADD COLUMN phone VARCHAR(20) UNIQUE DEFAULT NULL COMMENT '手机号' AFTER username;
