-- Add account deactivation fields for the first-release account lifecycle.

ALTER TABLE users
  MODIFY COLUMN status ENUM('ACTIVE','BANNED','DEACTIVATED') NOT NULL DEFAULT 'ACTIVE' COMMENT '状态',
  ADD COLUMN deactivated_at TIMESTAMP NULL DEFAULT NULL COMMENT '注销时间' AFTER status,
  ADD COLUMN deactivation_reason TEXT NULL COMMENT '注销原因' AFTER deactivated_at,
  ADD COLUMN deactivation_restore_deadline TIMESTAMP NULL DEFAULT NULL COMMENT '注销冷静期截止时间' AFTER deactivation_reason;
