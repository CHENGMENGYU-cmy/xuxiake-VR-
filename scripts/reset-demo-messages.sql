-- 重置演示数据
-- 将演示会话重置为初始状态（REQUEST状态）

UPDATE conversation_participants
SET status = 'REQUEST', last_read_at = NULL
WHERE conversation_id = '57b1ab3d81f711f19ff76018957395ba'
AND user_id = 'u10';

-- 验证重置结果
SELECT '=== 重置后的状态 ===' AS info;
SELECT u.display_name, cp.status, cp.last_read_at
FROM conversation_participants cp
JOIN users u ON cp.user_id = u.id
WHERE cp.conversation_id = '57b1ab3d81f711f19ff76018957395ba';
