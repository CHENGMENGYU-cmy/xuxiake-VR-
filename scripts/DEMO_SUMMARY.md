# 消息请求功能演示总结

## 演示数据

已创建的演示会话：
- **会话ID**: `57b1ab3d81f711f19ff76018957395ba`
- **发起者**: 徐霞客 (u1) - 状态: NORMAL
- **接收者**: 钱一 (u10) - 状态: REQUEST
- **消息内容**: "你好！想交流VR拍摄经验。"

## 功能验证

### 1. 查看会话列表

```sql
-- 用户A（徐霞客）的私信列表
SELECT c.id, c.updated_at, 'NORMAL' AS my_status
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = 'u1' AND cp.status = 'NORMAL';

-- 用户B（钱一）的陌生人消息列表
SELECT c.id, c.updated_at, 'REQUEST' AS my_status
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
WHERE cp.user_id = 'u10' AND cp.status = 'REQUEST';
```

### 2. 接受消息请求

```sql
-- 将状态从 REQUEST 改为 NORMAL
UPDATE conversation_participants
SET status = 'NORMAL'
WHERE conversation_id = '57b1ab3d81f711f19ff76018957395ba'
AND user_id = 'u10';

-- 效果：会话从"陌生人消息"移入"私信"
```

### 3. 拒绝消息请求

```sql
-- 将状态从 REQUEST 改为 HIDDEN
UPDATE conversation_participants
SET status = 'HIDDEN'
WHERE conversation_id = '57b1ab3d81f711f19ff76018957395ba'
AND user_id = 'u10';

-- 效果：会话从用户B的列表中隐藏
```

## 前端测试

1. 访问 http://localhost:3000/messages
2. 登录为钱一（用户B）
3. 查看"陌生人消息"标签页
4. 点击接受或拒绝按钮

## API 测试

```bash
# 接受消息请求（需要登录token）
curl -X POST http://localhost:3001/api/conversations/57b1ab3d81f711f19ff76018957395ba/accept \
  -H "Authorization: Bearer <token>"

# 拒绝消息请求
curl -X POST http://localhost:3001/api/conversations/57b1ab3d81f711f19ff76018957395ba/reject \
  -H "Authorization: Bearer <token>"
```

## 状态说明

| 状态 | 说明 | 前端显示 |
|------|------|----------|
| NORMAL | 正常私信 | 显示在"私信"标签页 |
| REQUEST | 陌生人消息 | 显示在"陌生人消息"标签页 |
| HIDDEN | 已拒绝/隐藏 | 不在列表中显示 |
