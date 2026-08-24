-- 为 media_items 表新增 text_note 字段（闪拍文字备注）
ALTER TABLE media_items ADD COLUMN text_note TEXT NULL AFTER sort_order;
