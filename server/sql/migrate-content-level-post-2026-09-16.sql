-- Add POST as the canonical public community post level.
-- CLASSIFIED is kept in the enum during the transition so older seed data and
-- already-running databases can be migrated safely.

ALTER TABLE posts
  MODIFY COLUMN content_level
  ENUM('SNAPSHOT','POST','CLASSIFIED','DIARY','TRAVELOGUE','ESSAY')
  NOT NULL DEFAULT 'POST'
  COMMENT '内容层级：SNAPSHOT闪拍|POST随笔|CLASSIFIED旧分类帖|DIARY日记|TRAVELOGUE游记|ESSAY旧游记';

UPDATE posts
SET content_level = 'POST'
WHERE content_level = 'CLASSIFIED';
