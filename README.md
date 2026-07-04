# 徐霞客系统 (XuXiaKe)

最后更新：2026-07-04

一个以 VR 内容为核心的沉浸式社交分享平台，让用户以第一人称视角记录和分享旅行体验。

---

## ✨ 核心功能

| 模块 | 功能 |
|------|------|
| **用户系统** | 注册登录、个人主页、资料编辑、XXK 编号唯一标识 |
| **内容发布** | 支持 VR360/VR180/空间视频、图片、音频等多媒体内容，附带地理位置标记 |
| **信息流** | 个性化动态流、内容探索、搜索发现 |
| **社交互动** | 点赞、评论（支持嵌套回复）、关注/粉丝体系 |
| **实时聊天** | 基于 WebSocket 的私信系统，支持文字和媒体消息 |
| **通知中心** | SSE 实时推送点赞、评论、关注、系统通知 |
| **个人设置** | 资料管理、隐私控制、通知偏好、主题外观切换 |

---

## 🎯 应用场景

- **旅行记录**：用 VR 设备拍摄 360° 全景，在平台上以沉浸式方式回顾旅程
- **景点探索**：浏览其他用户的 VR 内容，足不出户体验世界各地风景
- **社交分享**：与志同道合的旅行爱好者互动交流

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
