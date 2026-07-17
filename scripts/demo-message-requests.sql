-- 消息请求功能演示数据
-- 假设已有两个用户，我们创建一个消息请求场景

-- 1. 查看现有用户（取前两个）
SELECT id, username, displayName FROM users LIMIT 2;

-- 2. 创建一个私聊会话（模拟用户A向非互关用户B发送消息）
-- 替换 <USER_A_ID> 和 <USER_B_ID> 为实际的用户ID
SET @conv_id = UUID();

INSERT INTO conversations (id, type, title, created_at, updated_at)
VALUES (@conv_id, 'DIRECT', NULL, NOW(), NOW());

-- 3. 添加参与者，发送者状态为 NORMAL，接收者状态为 REQUEST
-- 发起者（用户A）- 状态：NORMAL
INSERT INTO conversation_participants (id, conversation_id, user_id, status, last_read_at, joined_at)
VALUES (UUID(), @conv_id, '<USER_A_ID>', 'NORMAL', NOW(), NOW());

-- 接收者（用户B）- 状态：REQUEST（陌生人消息）
INSERT INTO conversation_participants (id, conversation_id, user_id, status, last_read_at, joined_at)
VALUES (UUID(), @conv_id, '<USER_B_ID>', 'REQUEST', NULL, NOW());

-- 4. 添加示例消息
INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
VALUES (UUID(), @conv_id, '<USER_A_ID>', '你好！我是通过你的旅行视频认识你的，想和你交流一下VR拍摄经验。', NOW());

-- 5. 验证数据
SELECT '=== 会话信息 ===' AS info;
SELECT * FROM conversations WHERE id = @conv_id;

SELECT '=== 参与者状态 ===' AS info;
SELECT cp.*, u.username, u.displayName
FROM conversation_participants cp
JOIN users u ON cp.user_id = u.id
WHERE cp.conversation_id = @conv_id;

SELECT '=== 消息内容 ===' AS info;
SELECT m.*, u.username AS sender_name
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE m.conversation_id = @conv_id;

-- 6. 查询各用户的会话列表视图
SELECT '=== 用户A的正常私信列表 ===' AS info;
SELECT c.id, c.updated_at, 'NORMAL' AS my_status
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = '<USER_A_ID>' AND cp.status = 'NORMAL';

SELECT '=== 用户B的陌生人消息列表 ===' AS info;
SELECT c.id, c.updated_at, 'REQUEST' AS my_status
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = '<USER_B_ID>' AND cp.status = 'REQUEST';
