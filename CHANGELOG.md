项目修改记录（最近30条）
================================================================================

修改时间：2026-08-05
修改位置：web/next.config.ts
修改原因：本地开发模式下前端未把 /uploads 静态目录代理到后端，闪拍App上传的图片/缩略图在 Web 端全部 404（生产有 nginx alias 兜底，本地 dev 缺失）
修改内容：next.config 新增 rewrites，将 /uploads/:path* 代理到后端（按 NEXT_PUBLIC_API_URL 推导后端 origin，默认 http://localhost:3001）
修改效果：本地开发时上传的媒体和缩略图可正常显示，不再 404
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：server/src/modules/upload/upload.controller.ts, server/scripts/fix-thumbnails.js（新建）
修改原因：图片上传接口缩略图用固定文件名（thumb_.jpg/thumb_.png），多张图片互相覆盖，导致 media_items 里 62 条 thumbnail_url 引用同一文件、其余 404（闪拍App同步多张真实图片后暴露）
修改内容：1) generateThumbnail 改用 uuid 唯一缩略图名，后续上传不再互相覆盖；2) 新建 server/scripts/fix-thumbnails.js，为已有 62 条记录重新生成唯一缩略图并更新 thumbnail_url，删除旧固定文件
修改效果：闪拍App同步上来的多张图片缩略图不再 404，素材库正常展示
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：Android 闪拍App工程（Kuaishan-Android-Source-0.8.2-20260724，非本仓库git）— 新增 data/CommunityModels.kt、CommunityBackendClient.kt、CommunityTokenStore.kt、CommunitySyncManager.kt、ui/SyncToCommunityActivity.kt、res/layout/activity_sync_to_community.xml；修改 app/build.gradle.kts、AndroidManifest.xml、NoahApplication.kt、MainActivity.kt、activity_main.xml；文档 内容生成逻辑链条.md
修改原因：闪拍App本地采集的旅行瞬间数据无法接入社区——后端 /api/sync/snapshots 与 /api/upload/* 接口已就绪，但App端无调用代码
修改内容：1) Android端新增"同步到社区"功能：主界面入口按钮→SyncToCommunityActivity（社区账号+密码+图形验证码登录）→手动触发批量同步；2) CommunitySyncManager 独立单线程协调登录/媒体上传/幂等记录/token刷新（401自动refresh重试）；3) 素材经 /api/upload/{image,video,audio} + /api/sync/snapshots 入库为 SNAPSHOT 素材（PRIVATE，按moment.id幂等）；4) 社区后端地址 COMMUNITY_BASE_URL 在 app/build.gradle.kts 配置（当前指向本机 192.168.1.134:3001 供真机联调）；5) 已用 gradle assembleDebug 构建验证通过，APK已生成
修改效果：闪拍App数据可经登录后手动同步接入社区，成为素材库SNAPSHOT素材，再走AI日记/游记发布链路；设计文档"App端上传调用代码"状态由 ❌ 更新为 ✅ 已实现
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：web/src/components/layout/sidebar.tsx
修改原因：侧边栏创作区"发布见闻"与页面标题"分享见闻"命名不一致
修改内容：侧边栏创作区第一个入口标签从"发布见闻"改为"分享见闻"，与 /upload 页面标题统一
修改效果：菜单名称与页面标题完全一致，命名规范统一
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：web/src/app/(main)/upload/page.tsx, discover/page.tsx, topics/page.tsx, snap/square/page.tsx, journeys/page.tsx, topics/[id]/page.tsx, diaries/[id]/page.tsx
修改原因：检查发现侧边栏各功能页面存在5处功能重复——手写日记/手写游记双入口、AI写游记双入口、话题广场和日记广场在聚合页与独立页重复展示、/journeys标题命名不一致
修改内容：1) /upload精简为纯多媒体分享，移除「写日记」「写游记」tab，日记编辑仅从/diaries「写日记」按钮进入；2) 话题/日记广场统一到/discover（Tabs改为受控支持?tab=参数），/topics和/snap/square改为重定向；3) /journeys移除页面内「AI生成」按钮（侧边栏已有），标题"游记散文"改"我的游记"；4) 更新/topics/[id]和/diaries/[id]返回链接指向/discover对应tab
修改效果：每个创作/浏览动作只有单一入口，页面间无功能重复，命名统一
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：web/src/components/layout/sidebar.tsx, mobile-nav.tsx; web/src/app/(main)/my/page.tsx（新建）, my/works/page.tsx（删除）
修改原因：按用户要求结合「内容生成逻辑链条」(素材→日记→游记)重构侧边栏，实现完整闭环——素材库管理→AI生成日记→升华游记→发布社区→浏览发现灵感→再创作；借鉴小红书/B站真实社区导航
修改内容：1) 我的区拆回三项：素材库(/snap)/我的日记(/diaries)/我的游记(/journeys)，直观体现三级生成链条；2) 创作区精简为两项：发布见闻(/upload)/AI写游记(/journeys/generate)，AI写日记入口保留在素材库页面内；3) 删除合并页/my/works；4) 新建/my我的中心聚合页（素材库/日记/游记/设置入口卡片）；5) 移动端底部导航补齐「我的」入口，改为5项：首页/发现/发布/消息/我的，移除通知项
修改效果：侧边栏直观呈现内容生成链条闭环——素材(起点)→日记(中间)→游记(终点)→社区(发布展示)，桌面/移动端功能一致
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：web/src/components/layout/sidebar.tsx, navbar.tsx
修改原因：用户确认创作功能应保留在左侧菜单栏，而非移到顶栏下拉按钮
修改内容：1) 侧栏新增"创作"区：分享见闻(/upload)、AI写日记(/snap)、AI写游记(/journeys/generate)三个入口；2) 顶栏移除创建下拉菜单，恢复为简单的上传图标按钮
修改效果：创作入口回归左侧菜单栏，符合用户偏好；导航结构为浏览/我的/创作/个人四区
--------------------------------------------------------------------------------

修改时间：2026-08-04
修改位置：web/src/components/layout/sidebar.tsx, navbar.tsx; web/src/app/(main)/discover/page.tsx; web/src/app/(main)/my/works/page.tsx（新建）
修改原因：侧栏导航项多达11个，浏览/我的/创作三区功能重叠（AI日记=我的闪拍同一页面、日记广场和话题广场同为浏览区、创建入口分散5处），借鉴YouTube/小红书三段模型重构
修改内容：1) 侧栏从11项精简至7项：浏览区(首页+发现)、我的区(素材库+我的作品)、个人区(消息/通知/设置)；2) /discover页面合并日记广场+话题广场+寻找搭子为三个tab；3) 新建/my/works页面合并日记+游记管理为tab切换；4) 顶栏新增渐变色"+"创建按钮下拉菜单（上传媒体/AI写日记/AI写游记/手写日记/手写游记），移除侧栏创作区
修改效果：导航逻辑清晰——浏览=消费别人内容、我的=管理自己内容、创建=顶栏统一入口，侧栏项减少36%
--------------------------------------------------------------------------------

修改时间：2026-08-04
修改位置：server/src/modules/posts/posts.controller.ts; web/src/components/layout/sidebar.tsx, app/(main)/snap/page.tsx, app/(main)/diaries/page.tsx
修改原因：1) 游记AI生成页面 /journeys/generate 报401错误导致生成失败；2) 左侧栏"我的内容"三项和"分享见闻"功能逻辑混乱，借鉴真实社区平台梳理导航
修改内容：1) 修复 ai/jobs/:jobId 和 travelogue/job/:jobId 两个端点的 UnauthorizedException→NotFoundException，避免job不存在时触发前端auth-refresh链路；2) 侧栏"游记散文"统一命名为"我的游记"；3) 创作区新增"AI日记"独立入口；4) /snap页面标题改为"素材库"并新增醒目的"AI写日记"按钮；5) /diaries页面移除"从闪拍生成"按钮，精简创建入口
修改效果：游记AI生成不再误报401；导航逻辑清晰——"我的内容"为内容库管理，"创作"为统一创建入口
--------------------------------------------------------------------------------

修改时间：2026-08-04
修改位置：server/src/modules/posts/posts.controller.ts, posts.service.ts; web/src/lib/snap-api.ts, stores/snap-store.ts, app/(main)/snap/generate/[id]/page.tsx
修改原因：AI日记生成页面的草稿保存逻辑有缺陷——每次进入都重新生成不恢复草稿、每次保存都创建新帖子、401错误码误用
修改内容：1) 后端新增 GET diary/draft/:snapId 草稿查询端点；2) 重构 saveDiary 支持 diaryId 更新已有帖子而非重复创建；3) 修复 diary/generate 素材不存在时返回 404 而非 401；4) 前端新增 fetchDiaryDraft action 和 existingDraftId 状态管理；5) 生成页面进入时先检查草稿→有则恢复、无则AI生成；6) 草稿保存后留在页面继续编辑，发布/私密后跳转
修改效果：借鉴真实社区平台模式，草稿创建→编辑→发布完整流程打通，不再重复创建帖子，401错误修复
--------------------------------------------------------------------------------

修改时间：2026-08-04
修改位置：web/src/app/(main)/snap/square/page.tsx, web/src/app/(main)/diaries/[id]/page.tsx
修改原因：日记广场页面的日记卡片无法点击查看详情，且缺少对公开日记的查看支持
修改内容：1) 日记广场卡片添加 cursor-pointer 和 onClick 导航到 /diaries/[id]；2) 日记详情页权限检查改为公开日记所有人可查看、私密日记仅作者可查看；3) 非作者查看时隐藏编辑/删除按钮并显示公开日记提示；4) 返回按钮根据是否为作者跳转到不同页面
修改效果：日记广场卡片可点击查看详情，公开日记可正常浏览，私密日记权限正确隔离
--------------------------------------------------------------------------------

修改时间：2026-08-04
修改位置：server/sql/seed.sql, users 表
修改原因：users 表全部用户均为普通用户（USER），缺少系统管理员和审核员角色
修改内容：u1 徐霞客设为系统管理员(ADMIN)，u3 李四设为审核员(MODERATOR)，其余保持 USER；同步更新当前数据库
修改效果：管理端用户管理（仅 ADMIN）与内容审核（ADMIN/MODERATOR）权限生效，三种角色权限矩阵验证通过
--------------------------------------------------------------------------------

修改时间：2026-08-04
修改位置：server/sql/schema.sql, seed.sql, seed-content-classification.sql, seed-community-experience.sql, seed-log-diary-travelogue.sql
修改原因：种子数据为"群聊时代"产物，与当前"社群=内容社区"开发逻辑脱节——社群动态为空、社群字段缺失、内容层级混乱、话题关联表名错误
修改内容：社群升级为内容社区（补封面/分类/规则/位置，各新增6条专属动态）；posts 内容层级统一（CLASSIFIED/LOG/DIARY/TRAVELOGUE）；修复 topic_posts→post_topics、DELETE 语句 bug；schema 补齐 post_tags/post_topics 表
修改效果：社群动态页有真实内容，内容分层清晰，帖子-话题-社群三表打通，feed 正常展示内容层级标签，数据库已按新种子重置重灌
--------------------------------------------------------------------------------

修改时间：2026-07-20
修改位置：徐霞客社区研究计划与研究方案.md（V2.0重写）
修改原因：需厘清任务/方案/计划/进度四个核心概念的区别与关系，形成逻辑完整的从现状到上线的全生命周期报告
修改内容：新增四个核心概念的定义与关系说明，重构为九章结构——导言→概述→进度→任务→方案→计划→测试→风险→标准，明确当前框架搭建完成后的AR数据接入→测试→上线路径
修改效果：报告逻辑清晰层次分明，四概念贯穿全文，五大任务各有方案/计划/验收标准，可直接作为项目执行依据
--------------------------------------------------------------------------------

修改时间：2026-07-20
修改位置：web/src/components/layout/sidebar.tsx, right-panel.tsx
修改原因：推荐关注模块从左侧栏移到右侧栏，重新设计右侧栏布局
修改内容：左侧栏移除推荐关注模块，右侧栏新增推荐关注、移除热门媒体和直播预告，调整模块顺序
修改效果：左侧栏专注导航，右侧栏布局更合理
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/app/(main)/upload/page.tsx
修改原因：VR视频输入框持久化文字问题，页面加载时自动恢复草稿导致随机文字一直存在
修改内容：移除页面加载时自动从localStorage恢复草稿的逻辑，保留自动保存和手动选择草稿功能
修改效果：页面打开时不再自动加载之前的草稿内容
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/app/(main)/upload/guide-creator/page.tsx
修改原因：攻略创建器只支持纯文本，缺少图片上传能力
修改内容：引入MultiImageUploader组件，添加攻略图片上传区域（最多12张）
修改效果：攻略创建器支持上传多张景点、美食、住宿等相关图片
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/lib/translation-api.ts（新建）, web/src/app/(main)/upload/page.tsx
修改原因：翻译功能为UI占位，未实现实际翻译能力
修改内容：新建translation-api.ts使用MyMemory API，支持中英日韩互译，添加语言选择和翻译按钮
修改效果：翻译功能可正常使用，支持实时翻译和结果复制
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/components/upload/topic-selector.tsx, web/src/app/(main)/upload/page.tsx
修改原因：话题标签选择缺少智能推荐，用户需要手动搜索
修改内容：TopicSelector新增content属性，添加extractKeywords函数，根据内容关键词智能推荐话题
修改效果：用户输入内容后自动推荐相关话题标签
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/app/(main)/upload/page.tsx
修改原因：视频和音频上传区域不支持拖拽操作
修改内容：视频和音频上传区域添加onDragOver和onDrop事件处理
修改效果：支持拖拽文件到上传区域进行上传
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/components/upload/route-map-preview.tsx（新建）, web/src/app/(main)/upload/route-creator/page.tsx, web/package.json
修改原因：路线创建后无法直观预览轨迹和途经点位置
修改内容：安装leaflet和react-leaflet，新建RouteMapPreview组件，支持GPX轨迹线和途经点标记显示
修改效果：上传GPX文件或添加途经点后可实时预览路线地图
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：server/src/modules/posts/posts.service.ts, posts.controller.ts, posts.module.ts
修改原因：getPosts不支持按关注关系过滤帖子，无法实现首页关注动态流
修改内容：注入UserFollow repository，getPosts新增followingOnly参数，支持FOLLOWERS可见性帖子
修改效果：后端支持按关注关系过滤帖子
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/lib/post-api.ts, web/src/stores/post-store.ts, web/src/components/feed/feed-list.tsx
修改原因：前端需要传递followingOnly参数到后端
修改内容：post-api、post-store、feed-list新增followingOnly支持，关注动态为空时显示引导页面
修改效果：前端支持关注动态流模式
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/app/(main)/feed/page.tsx, web/src/app/(main)/explore/page.tsx
修改原因：首页和探索页功能高度重叠，需要明确区分定位
修改内容：首页改为关注动态流，探索页新增热门话题卡片和内容类型筛选
修改效果：首页是社交时间线，探索页是全局发现引擎
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：server/src/modules/posts/posts.service.ts, posts.controller.ts
修改原因：后端缺少编辑帖子的端点
修改内容：新增updatePost方法和@Put(':id')端点，验证作者权限后更新content
修改效果：后端支持编辑帖子内容
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/lib/post-api.ts, web/src/stores/post-store.ts
修改原因：前端缺少编辑/删除帖子的API和状态管理
修改内容：新增updatePost函数、removePost和updatePostInList actions
修改效果：前端具备编辑和删除帖子的完整数据流
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/components/post/post-card.tsx, edit-post-dialog.tsx（新建）
修改原因：帖子卡片需要编辑和删除操作入口
修改内容：PostCard下拉菜单区分自己/他人帖子，新建EditPostDialog，删除使用确认弹窗
修改效果：用户可编辑和删除自己发布的帖子
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/components/post/post-composer.tsx
修改原因：首页发布器交互偏重，操作路径太长
修改内容：重构为社交平台风格，收起状态一行布局，展开状态多行textarea+图片预览，支持拖拽/粘贴上传，新增更多菜单
修改效果：首页发布体验变为快速社交风格，文字+图片一键发布
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：server/sql/seed-community-experience.sql（新建）
修改原因：需要为所有缺失数据表补充种子数据
修改内容：新建社区体验种子数据SQL，覆盖community_roles、community_announcements、community_challenges等8张表
修改效果：所有数据表均有种子数据，支持多用户体验社区功能
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/components/media/media-card.tsx（新建）, web/src/app/(main)/media/page.tsx（新建）
修改原因：需要独立的媒体卡片组件和媒体发现页
修改内容：新建MediaCard组件（视频/图片/音频三种类型），新建/media媒体发现页（Tab切换+网格布局）
修改效果：媒体内容以视觉优先的卡片形式展示，浏览体验更佳
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/app/(main)/search/page.tsx, web/src/components/search/search-suggestions.tsx
修改原因：搜索页应回归纯粹的关键词搜索，媒体浏览应独立
修改内容：搜索页移除媒体类型筛选，搜索建议新增媒体发现快捷入口
修改效果：搜索页专注于关键词搜索，媒体浏览职责分离
--------------------------------------------------------------------------------
