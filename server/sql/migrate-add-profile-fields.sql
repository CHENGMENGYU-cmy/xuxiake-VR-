-- ============================================================
-- 迁移脚本：为 users 表添加个人资料字段
-- 执行方式：在 MySQL 中运行此脚本
-- ============================================================

USE xuxiake;

-- 1. 添加徐霞客号字段（先添加为可空，后续更新后再设为 NOT NULL）
ALTER TABLE users ADD COLUMN xxk_number VARCHAR(11) COMMENT '徐霞客号，11位随机数字' AFTER display_name;

-- 2. 为现有用户生成徐霞客号
DELIMITER //
CREATE PROCEDURE generate_xxk_numbers()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_id VARCHAR(36);
    DECLARE cur CURSOR FOR SELECT id FROM users WHERE xxk_number IS NULL;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 生成11位随机数字
        UPDATE users SET xxk_number = CONCAT(
            FLOOR(RAND() * 9) + 1,
            LPAD(FLOOR(RAND() * 10000000000), 10, '0')
        ) WHERE id = user_id;
    END LOOP;

    CLOSE cur;
END //
DELIMITER ;

CALL generate_xxk_numbers();
DROP PROCEDURE generate_xxk_numbers;

-- 3. 设置为 NOT NULL 和唯一索引
ALTER TABLE users MODIFY COLUMN xxk_number VARCHAR(11) NOT NULL COMMENT '徐霞客号，11位随机数字';
ALTER TABLE users ADD UNIQUE INDEX idx_users_xxk_number (xxk_number);

-- 4. 添加其他个人资料字段
ALTER TABLE users ADD COLUMN gender ENUM('MALE','FEMALE','OTHER','PRIVATE') DEFAULT 'PRIVATE' COMMENT '性别' AFTER website;
ALTER TABLE users ADD COLUMN birthday DATE COMMENT '生日' AFTER gender;
ALTER TABLE users ADD COLUMN region VARCHAR(100) COMMENT '地区' AFTER birthday;
ALTER TABLE users ADD COLUMN occupation VARCHAR(100) COMMENT '职业' AFTER region;

-- 完成
SELECT 'Migration completed successfully!' AS message;