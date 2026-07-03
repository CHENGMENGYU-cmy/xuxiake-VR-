# 徐霞客系统 (XuXiaKe)

最后更新：2026-07-03

用 VR 记录旅程，让世界触手可及 🌍

---

## 📁 项目结构

```
XuXiaKe/
├── web/           ← 前端 (Next.js 16 + React 19)
│   └── src/
│       ├── app/         # 页面路由
│       ├── components/  # UI 组件
│       ├── stores/      # 状态管理
│       ├── types/       # 类型定义
│       └── lib/         # 工具函数
├── server/        ← 后端 (NestJS 11)
│   └── src/
│       ├── modules/     # 业务模块
│       └── common/      # 共享接口 & 数据
├── .vscode/       ← VSCode 一键启动配置
└── README.md
```

---

## 🚀 手动启动步骤

### 第 1 步：打开项目

```
用 VSCode 打开文件夹：D:\Other\Cluade CodeProjects\XuXiaKe
```

### 第 2 步：安装依赖（仅首次需要）

在 VSCode 中打开 **两个终端**：

**终端 1（前端）：**
```bash
cd web
npm install
```

**终端 2（后端）：**
```bash
cd server
npm install
```

### 第 3 步：构建后端（仅首次或修改后端后需要）

```bash
cd server
npm run build
```

### 第 4 步：启动服务

**终端 1 — 启动后端（端口 3001）：**
```bash
cd server
npm run start:dev
```

**终端 2 — 启动前端（端口 3000）：**
```bash
cd web
npm run dev
```

### 第 5 步：打开浏览器

访问：**http://localhost:3000**

---

## 🧪 测试账号

| 邮箱 | 密码 |
|------|------|
| xuxiake@example.com | 任意密码 |
| zhangshan@example.com | 任意密码 |
| lisi@example.com | 任意密码 |
| wangwu@example.com | 任意密码 |

---

## 🖥️ VSCode 一键启动

在 VSCode 中按 `Ctrl+Shift+P` → 输入 `Tasks: Run Task` → 选择 **🟢 一键启动全部**

---

## 📡 端口说明

| 服务 | 端口 | 地址 |
|------|------|------|
| 前端页面 | 3000 | http://localhost:3000 |
| 后端 API | 3001 | http://localhost:3001/api |
| WebSocket | 3001 | ws://localhost:3001/chat |
| SSE 通知 | 3001 | http://localhost:3001/api/sse/notifications |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 + React 19 + TypeScript |
| UI 组件 | shadcn/ui + Tailwind CSS v4 |
| 状态管理 | Zustand + TanStack Query |
| 后端框架 | NestJS 11 + TypeScript |
| 实时通信 | Socket.IO（聊天）+ SSE（通知） |
| 认证 | JWT 双 Token（Access + Refresh） |
