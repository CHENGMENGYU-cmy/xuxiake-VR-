-- 安全添加缺失列（已存在则跳过）
-- 用 Navicat 右键 xuxiake → 运行 SQL 文件 → 选择此文件

USE xuxiake;
SET NAMES utf8mb4;

-- 1. conversation_participants 添加 status 列
DROP PROCEDURE IF EXISTS add_status_col;
DELIMITER //
CREATE PROCEDURE add_status_col()
BEGIN
  DECLARE CONTINUE HANDLER FOR 1060 BEGIN END;
  ALTER TABLE conversation_participants
    ADD COLUMN status ENUM('NORMAL','REQUEST','HIDDEN') NOT NULL DEFAULT 'NORMAL' AFTER user_id;
END //
DELIMITER ;
CALL add_status_col();
DROP PROCEDURE IF EXISTS add_status_col;

-- 2. conversations 添加 is_disappearing 列
DROP PROCEDURE IF EXISTS add_disappearing_col;
DELIMITER //
CREATE PROCEDURE add_disappearing_col()
BEGIN
  DECLARE CONTINUE HANDLER FOR 1060 BEGIN END;
  ALTER TABLE conversations
    ADD COLUMN is_disappearing TINYINT(1) NOT NULL DEFAULT 0;
END //
DELIMITER ;
CALL add_disappearing_col();
DROP PROCEDURE IF EXISTS add_disappearing_col;

-- 3. conversations 添加 disappear_seconds 列
DROP PROCEDURE IF EXISTS add_disappear_sec_col;
DELIMITER //
CREATE PROCEDURE add_disappear_sec_col()
BEGIN
  DECLARE CONTINUE HANDLER FOR 1060 BEGIN END;
  ALTER TABLE conversations
    ADD COLUMN disappear_seconds INT NOT NULL DEFAULT 0;
END //
DELIMITER ;
CALL add_disappear_sec_col();
DROP PROCEDURE IF EXISTS add_disappear_sec_col;
