# 变更记录

---

## 2026-08-12 统一日记编辑器

1. **server/src/modules/posts/posts.controller.ts** — 统一手写/AI日记数据格式
   - diary/save DTO 增加 mood、weather 可选字段

2. **server/src/modules/posts/posts.service.ts** — saveDiary 支持心情天气
   - saveDiary 方法增加 mood/weather 参数，仅显式提供时写入 vrMetadata

3. **web/src/lib/snap-api.ts** — 前端 API 类型同步
   - saveDiary 函数类型增加 mood/weather 可选参数

4. **web/src/app/(main)/diaries/new/page.tsx** (新建) — 统一日记编辑器
   - 卡片式布局：封面图、标题、正文、感悟/心情/天气
   - 支持 edit/snapIds URL 参数
   - 统一调用 saveDiary API

5. **web/src/components/diary/diary-compose-dialog.tsx** — 创作引导跳转统一
   - 自己写跳转改为 /diaries/new

6. **web/src/app/(main)/diaries/page.tsx** — 日记列表编辑跳转统一
   - handleEdit 跳转改为 /diaries/new?edit=

7. **web/src/app/(main)/diaries/[id]/page.tsx** — 日记详情继续写跳转统一
   - continueEdit 简化为 /diaries/new?edit=postId

8. **web/src/app/(main)/snap/generate/batch/page.tsx** — AI 生成后衔接编辑器
   - 生成完成后跳转 /diaries/new?edit=postId

**效果**：手写日记和AI日记共用同一个编辑器，创建编辑体验一致，详情页展示统一。
