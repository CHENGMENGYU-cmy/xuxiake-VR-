-- 消息请求接受/拒绝演示
-- 假设已运行 demo-message-requests.sql 创建了示例数据

-- 场景1：用户B接受消息请求
-- 执行后，该会话将从"陌生人消息"移到"私信"

UPDATE conversation_participants
SET status = 'NORMAL'
WHERE conversation_id = '<CONV_ID>' AND user_id = '<USER_B_ID>';

-- 验证：现在两个用户都能在正常私信列表看到这个会话
SELECT '=== 接受后：用户B的私信列表 ===' AS info;
SELECT c.id, c.updated_at, cp.status AS my_status
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = '<USER_B_ID>' AND cp.status = 'NORMAL';

-- 场景2：用户B拒绝消息请求
-- 执行后，该会话将从用户B的列表中隐藏

UPDATE conversation_participants
SET status = 'HIDDEN'
WHERE conversation_id = '<CONV_ID>' AND user_id = '<USER_B_ID>';

-- 验证：用户B看不到这个会话，但用户A仍然可以看到
SELECT '=== 拒绝后：用户B的私信列表（应该为空）===' AS info;
SELECT c.id, c.updated_at, cp.status AS my_status
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = '<USER_B_ID>' AND cp.status IN ('NORMAL', 'REQUEST');

SELECT '=== 拒绝后：用户A仍然可以看到会话 ===' AS info;
SELECT c.id, c.updated_at, cp.status AS my_status
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = '<USER_A_ID>' AND cp.status = 'NORMAL';

-- 状态说明：
-- NORMAL: 正常私信，显示在收件箱
-- REQUEST: 陌生人消息，显示在"陌生人消息"标签页
-- HIDDEN: 已拒绝/隐藏，不在列表中显示
