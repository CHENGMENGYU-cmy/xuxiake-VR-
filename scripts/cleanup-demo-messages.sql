-- 清理演示数据
-- 删除演示会话及其相关数据

-- 先删除消息
DELETE FROM messages WHERE conversation_id = '57b1ab3d81f711f19ff76018957395ba';

-- 删除参与者
DELETE FROM conversation_participants WHERE conversation_id = '57b1ab3d81f711f19ff76018957395ba';

-- 删除会话
DELETE FROM conversations WHERE id = '57b1ab3d81f711f19ff76018957395ba';

SELECT '演示数据已清理' AS result;
