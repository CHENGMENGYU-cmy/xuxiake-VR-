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

### 方式1：Node.js 脚本（推荐）

```bash
cd server
node ../scripts/create-demo-messages.js
```

### 方式2：SQL 脚本

1. 先查看用户列表，获取两个用户ID
2. 编辑 `demo-message-requests.sql`，替换 `<USER_A_ID>` 和 `<USER_B_ID>`
3. 在 MySQL 中执行脚本

## 已创建的演示数据

已自动创建演示数据：
- **会话ID**: `57b1ab3d81f711f19ff76018957395ba`
- **发起者**: 徐霞客 (u1) - 状态: NORMAL
- **接收者**: 钱一 (u10) - 状态: REQUEST
- **消息内容**: "你好！想交流VR拍摄经验。"

### 重置演示数据

```bash
mysql -u root -proot xuxiake < scripts/reset-demo-messages.sql
```

### 清理演示数据

```bash
mysql -u root -proot xuxiake < scripts/cleanup-demo-messages.sql
```

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

1. 访问 http://localhost:3000/messages
2. 登录为钱一（用户B）
3. 查看"陌生人消息"标签页
4. 点击接受或拒绝按钮
5. 接受后，会话移入"私信"，双方可正常聊天
