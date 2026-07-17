# 消息请求功能演示

## 功能说明

实现类似 Instagram/Twitter 的消息请求机制：
- **互关好友**：消息直接进入收件箱
- **非互关用户**：消息进入"陌生人消息"，需对方接受

## 数据库字段

`conversation_participants` 表新增 `status` 字段：
- `NORMAL` - 正常私信，显示在收件箱
- `REQUEST` - 陌生人消息，显示在"陌生人消息"标签页
- `HIDDEN` - 已拒绝/隐藏，不在列表中显示

## 演示脚本

### 方式1：TypeScript 脚本（推荐）

```bash
cd server
npx tsx ../scripts/create-demo-messages.ts
```

### 方式2：SQL 脚本

1. 先查看用户列表，获取两个用户ID
2. 编辑 `demo-message-requests.sql`，替换 `<USER_A_ID>` 和 `<USER_B_ID>`
3. 在 MySQL 中执行脚本

## API 接口

### 获取会话列表
```
GET /api/conversations?status=NORMAL    # 正常私信
GET /api/conversations?status=REQUEST   # 陌生人消息
```

### 接受消息请求
```
POST /api/conversations/:id/accept
```

### 拒绝消息请求
```
POST /api/conversations/:id/reject
```

## 前端页面

1. **消息列表页** (`/messages`)
   - 顶部标签页切换"私信"和"陌生人消息"
   - 陌生人消息显示接受/拒绝按钮

2. **会话详情页** (`/messages/:id`)
   - 如果是消息请求，显示橙色提示横幅
   - 未接受前无法发送消息

## 测试流程

1. 用户A 关注用户B（用户B未关注A）
2. 用户A 向用户B 发送消息
3. 用户B 在"陌生人消息"看到请求
4. 用户B 点击"接受"或"拒绝"
5. 接受后，会话移入"私信"，双方可正常聊天
