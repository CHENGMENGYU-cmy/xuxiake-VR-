项目修改记录（最近30条）
================================================================================

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

修改时间：2026-07-19
修改位置：web/src/app/(main)/upload/page.tsx
修改原因：上传页所有Tab均为UI占位，未连接实际功能
修改内容：完整重写上传页，接入真实视频/音频/图片上传，支持预览、VR格式选择、发布
修改效果：用户可通过上传页发布视频/图片/音频/链接内容
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/components/theme-provider.tsx
修改原因：next-themes在React 19下注入script标签导致警告
修改内容：用自定义ThemeProvider替换next-themes，实现localStorage持久化+系统主题监听+FOUC防护
修改效果：消除"Encountered a script tag"警告
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/app/(landing)/page.tsx
修改原因：着陆页isAuthenticated导致SSR/客户端hydration mismatch
修改内容：新增mounted状态，延迟渲染auth相关内容
修改效果：消除hydration mismatch错误
--------------------------------------------------------------------------------

修改时间：2026-07-19
修改位置：web/src/app/(main)/search/page.tsx
修改原因：useSearchParams需要Suspense边界
修改内容：拆分为SearchPage（含Suspense）和SearchContent两个组件
修改效果：消除script tag警告
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：server/src/modules/upload/upload.controller.ts, web/src/lib/media-api.ts
修改原因：后端缺少视频和音频上传端点，前端缺少对应API
修改内容：后端新增POST /api/upload/video和audio端点，前端新增uploadVideo/uploadAudio等函数
修改效果：后端支持视频和音频文件上传，前端具备上传能力
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：server/sql/schema.sql, server/sql/migrate-media-upload.sql
修改原因：messages表media_type与TypeORM实体不一致
修改内容：schema.sql扩展media_type ENUM为AUDIO/CARD类型，新建迁移脚本
修改效果：数据库与实体定义保持一致
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：server/sql/migrate-guide-collection.sql, server/src/entities/, server/src/modules/posts/
修改原因：为攻略和合集功能创建数据表和后端支持
修改内容：新建guide_details/collections/collection_posts表和实体，后端支持攻略创建和合集CRUD
修改效果：后端完整支持攻略发布和合集管理
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：web/src/types/index.ts, web/src/lib/post-api.ts, web/src/components/post/post-composer.tsx, post-card.tsx
修改原因：前端类型和API同步攻略/合集功能
修改内容：新增GuideCategory/BudgetLevel/Collection等接口，发布器支持攻略专属字段，卡片展示攻略详情
修改效果：前端完整支持攻略和合集
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：server/sql/migrate-route-journey.sql, server/src/entities/, server/src/modules/posts/
修改原因：为路线和旅程内容类型创建结构化数据支持
修改内容：新建route_details/journeys/journey_stops表和实体，后端支持路线/旅程创建和查询
修改效果：发布ROUTE/JOURNEY类型帖子时自动保存结构化数据
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：web/src/types/index.ts, web/src/lib/post-api.ts, web/src/components/post/post-composer.tsx, post-card.tsx
修改原因：前端类型同步路线/旅程功能
修改内容：新增Difficulty/RouteType/Journey等接口，发布器支持路线/旅程专属字段，卡片展示详情
修改效果：前端完整支持路线和旅程
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：server/src/modules/posts/posts.controller.ts, posts.service.ts, web/src/app/(main)/topics/
修改原因：扩展话题API，支持话题详情和帖子列表查询
修改内容：新增话题详情/帖子列表/全部话题API端点，创建话题广场和详情页面
修改效果：后端完整支持话题聚合功能，用户可浏览话题广场和查看话题帖子
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：web/src/components/layout/right-panel.tsx, sidebar.tsx, web/src/app/(main)/search/page.tsx, web/src/components/post/post-card.tsx
修改原因：右侧面板、侧边栏、搜索页集成话题入口
修改内容：右侧面板热门话题改用新API，侧边栏新增话题广场入口，搜索页增加话题Tab，帖子卡片话题标签可点击
修改效果：用户可从多个入口访问话题功能
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：server/sql/migrate-content-classification.sql, server/src/entities/post.entity.ts, topic.entity.ts
修改原因：为帖子添加内容分类能力
修改内容：posts表新增post_type枚举字段，新建post_tags/topics/post_topics表，Post实体新增postType/tags/topics关联
修改效果：数据库支持内容形式分类、标签关联、话题聚合三层分类体系
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：server/src/modules/posts/posts.service.ts, posts.controller.ts, posts.module.ts, web/src/
修改原因：后端服务层和前端支持标签/话题CRUD和筛选查询
修改内容：createPost支持tagIds/topicNames，getPosts支持postType/tagId筛选，新增标签/话题API，前端类型同步
修改效果：帖子发布支持标签和话题，列表查询支持按类型和标签筛选
--------------------------------------------------------------------------------

修改时间：2026-07-18
修改位置：web/src/components/post/post-composer.tsx, web/src/app/(main)/feed/page.tsx, web/src/app/(main)/explore/page.tsx, web/src/components/post/post-card.tsx, web/src/stores/post-store.ts
修改原因：发布器支持内容类型选择和标签/话题添加，Feed页和探索页支持筛选
修改内容：发布器新增内容类型选择栏、标签选择器、话题输入框，Feed页新增筛选胶囊栏，帖子卡片新增内容类型徽章和标签展示
修改效果：用户发布内容时可选择内容形式、添加标签和话题，可按内容形式浏览和筛选帖子
--------------------------------------------------------------------------------
