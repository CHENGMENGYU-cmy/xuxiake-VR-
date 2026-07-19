项目修改记录
================================================================================

【2026-07-19 社区完整体验种子数据】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-19
  修改位置：server/sql/seed-community-experience.sql（新建）
  修改原因：需要为所有缺失数据表补充种子数据，支持多用户体验社区功能
  修改内容：
    - 新建社区体验种子数据SQL文件，覆盖8张缺失数据表
    - community_roles: 6条（3个社群各设管理员和版主）
    - community_announcements: 6条（群规、活动通知、设备推荐等）
    - community_challenges: 6条（摄影大赛、徒步挑战、美食探店、早餐打卡等）
    - community_challenge_entries: 15条（各用户参与挑战记录）
    - collections: 10条（VR旅行精华、云南攻略、美食地图等收藏集）
    - collection_posts: 35条（收藏集与帖子关联）
    - message_reactions: 23条（消息表情反应，覆盖7个会话）
    - location_shares: 6条（实时位置分享，含1条直播状态）
    - 补充comments: 15条（热门帖子的回复评论，含嵌套回复）
    - 补充likes: 15条（热门帖子额外点赞）
  修改效果：所有数据表均有种子数据，10个用户可完整体验社群管理、挑战参与、收藏、消息互动、位置分享等功能

【2026-07-19 搜索与媒体发现分离改造】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-19
  修改位置：web/src/components/media/media-card.tsx（新建）
  修改原因：需要独立的媒体卡片组件用于网格展示
  修改内容：
    - 新建 MediaCard 组件，支持视频/图片/音频三种卡片类型
    - 视频卡片：封面缩略图 + 时长标签 + VR格式角标 + 悬停播放图标
    - 图片卡片：缩略图 + AR标记角标
    - 音频卡片：渐变背景 + 波形可视化 + 时长标签
    - 通用信息栏：标题 + 作者头像 + 点赞数
    - 点击跳转到帖子详情页
  修改效果：媒体内容以视觉优先的卡片形式展示，适合网格布局浏览

第2条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/media/page.tsx（新建）
  修改原因：AR媒体浏览发现应与搜索功能分离，参考YouTube/Instagram/小红书设计
  修改内容：
    - 新建 /media 媒体发现页，独立于搜索页
    - 顶部Tab切换：全部/AR视频/AR图片/音频记录（line样式）
    - 排序切换：热门/最新/推荐（pill按钮样式）
    - 内容区：2-3列网格布局，使用 MediaCard 组件
    - 支持 URL 参数 ?type=VIDEO|IMAGE|AUDIO 直接定位类型
    - 复用 usePostStore 获取数据，postType 过滤 VR_MEDIA
  修改效果：媒体发现页与搜索页职责分离，浏览体验更佳

第3条

  修改时间：2026-07-19
  修改位置：web/src/components/layout/sidebar.tsx
  修改原因：侧边栏"内容分类"链接应指向独立发现页而非搜索页
  修改内容：
    - mediaTypes 链接从 /search?type=xxx 改为 /media?type=xxx
    - section 标题从"内容分类"改为"媒体发现"
  修改效果：侧边栏点击AR视频/图片/音频跳转到独立发现页

第4条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/search/page.tsx
  修改原因：搜索页应回归纯粹的关键词搜索，移除媒体类型筛选
  修改内容：
    - 移除 mediaTypeFilters 数组和相关导入（Video/Image/Music/MediaType）
    - 移除 typeParam 和 mediaTypeFilter 状态及 useEffect
    - 移除"内容"Tab下的媒体类型筛选按钮
    - 简化 filteredPosts 逻辑，仅保留关键词匹配
  修改效果：搜索页专注于关键词搜索，不再承担媒体浏览职责

第5条

  修改时间：2026-07-19
  修改位置：web/src/components/search/search-suggestions.tsx
  修改原因：搜索建议应提供媒体发现快捷入口
  修改内容：
    - 新增"媒体发现"快捷入口区域（无搜索词时显示）
    - 包含AR视频/AR图片/音频记录三个快捷链接
    - 点击跳转到 /media?type=xxx
  修改效果：用户在搜索框无输入时可快速进入媒体发现页

【2026-07-19 AR媒体功能 P1 - AR增强与内容体验】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/upload/page.tsx
  修改原因：上传页所有Tab均为UI占位，未连接实际功能
  修改内容：
    - 完整重写上传页，接入真实视频/音频/图片上传
    - 视频Tab：点击上传 → 视频预览 → VR格式选择 → 发布
    - 图片Tab：点击上传 → 图片预览 → VR格式选择 → 发布
    - 音频Tab：文件上传 + 实时录制（含波形可视化）→ 发布
    - 链接Tab：输入URL → 获取预览 → 发布
    - 翻译Tab：保留UI占位
    - 发布功能：调用 createPost API，成功后跳转 Feed
  修改效果：用户可通过上传页发布视频/图片/音频/链接内容

第2条

  修改时间：2026-07-19
  修改位置：web/src/components/post/media-viewer.tsx
  修改原因：媒体查看器需要更好的交互体验
  修改内容：
    - 视频：悬停自动播放 + 播放按钮覆盖层 + 暂停时重置
    - 音频：独立 AudioPlayer 组件（播放/暂停按钮 + 进度条 + 时长显示）
    - 新增 Pause 图标导入
  修改效果：视频悬停预览播放，音频播放器更美观

第3条

  修改时间：2026-07-19
  修改位置：web/src/components/theme-provider.tsx
  修改原因：next-themes 在 React 19 下注入 script 标签导致警告
  修改内容：
    - 用自定义 ThemeProvider 替换 next-themes
    - 实现 localStorage 持久化 + 系统主题监听 + FOUC 防护
    - 导出 useTheme hook
  修改效果：消除 "Encountered a script tag" 警告

第4条

  修改时间：2026-07-19
  修改位置：web/src/hooks/use-appearance.ts
  修改原因：useTheme 导入来源需要从 next-themes 改为自定义 provider
  修改内容：
    - 导入路径从 'next-themes' 改为 '@/components/theme-provider'
  修改效果：主题切换功能正常工作

第5条

  修改时间：2026-07-19
  修改位置：web/src/app/(landing)/page.tsx
  修改原因：着陆页 isAuthenticated 导致 SSR/客户端 hydration mismatch
  修改内容：
    - 新增 mounted 状态，延迟渲染 auth 相关内容
    - 三处 isAuthenticated 判断均改为 mounted && isAuthenticated
  修改效果：消除 hydration mismatch 错误

第6条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/search/page.tsx
  修改原因：useSearchParams 需要 Suspense 边界
  修改内容：
    - 拆分为 SearchPage（含 Suspense）和 SearchContent（使用 useSearchParams）两个组件
  修改效果：消除 script tag 警告

【2026-07-18 AR媒体功能 P0 - 基础链路打通】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-18
  修改位置：server/src/modules/upload/upload.controller.ts
  修改原因：后端缺少视频和音频上传端点
  修改内容：
    - 新增 POST /api/upload/video 端点（500MB限制，MP4/WebM/MOV/AVI）
    - 新增 POST /api/upload/audio 端点（100MB限制，MP3/WAV/OGG/WebM/AAC）
    - 新增 uploads/videos/ 和 uploads/audio/ 存储目录
    - 重构目录创建逻辑为循环方式
  修改效果：后端支持视频和音频文件上传

第2条

  修改时间：2026-07-18
  修改位置：web/src/lib/media-api.ts
  修改原因：前端缺少视频和音频上传API函数
  修改内容：
    - 新增 UploadVideoResult/UploadAudioResult 接口
    - 新增 uploadVideo(file) 函数
    - 新增 uploadAudio(file) 函数
    - 新增 getVideoMetadata(url) 函数（读取视频时长/宽/高）
    - 新增 getAudioDuration(url) 函数（读取音频时长）
  修改效果：前端具备视频和音频上传能力

第3条

  修改时间：2026-07-18
  修改位置：web/src/components/post/post-composer.tsx
  修改原因：PostComposer 中视频/音频按钮仅显示"功能即将上线"提示
  修改内容：
    - 导入 uploadVideo/uploadAudio/getVideoMetadata/getAudioDuration
    - 新增 videoInputRef/audioInputRef 文件输入引用
    - 新增 handleVideoUpload 处理函数（上传+元数据读取+预览）
    - 新增 handleAudioUpload 处理函数（上传+时长读取+预览）
    - handleMediaClick 支持 VIDEO/AUDIO 类型触发文件选择
    - 媒体预览区新增视频预览（缩略图+播放图标+时长）和音频预览（图标+时长）
    - 新增视频/音频隐藏文件输入控件
  修改效果：用户可通过 PostComposer 上传视频和音频

第4条

  修改时间：2026-07-18
  修改位置：web/src/app/(main)/search/page.tsx
  修改原因：侧边栏 AR视频/AR图片/音频记录链接指向搜索页但未实现类型过滤
  修改内容：
    - 导入 useSearchParams 读取 URL type 参数
    - 新增 mediaTypeFilters 筛选栏（全部/AR视频/AR图片/音频记录）
    - filteredPosts 逻辑增加 mediaTypeFilter 匹配
    - URL type 参数变化时自动更新筛选并触发搜索
  修改效果：点击侧边栏"AR视频/AR图片/音频记录"可正确过滤搜索结果

第5条

  修改时间：2026-07-18
  修改位置：server/sql/schema.sql, server/sql/migrate-media-upload.sql
  修改原因：messages 表 media_type 与 TypeORM 实体不一致
  修改内容：
    - schema.sql: media_type ENUM 扩展 AUDIO/CARD 类型
    - 新建 migrate-media-upload.sql 迁移脚本
  修改效果：数据库与实体定义保持一致

【2026-07-18 内容分类体系 Phase 4 - 攻略与合集】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-18 22:30
  修改位置：server/sql/migrate-guide-collection.sql
  修改原因：为攻略和合集功能创建数据表
  修改内容：
    - 新建 guide_details 表（目的地/分类/最佳季节/预算/富文本内容）
    - 新建 collections 表（合集名称/描述/封面/公开状态/帖子数）
    - 新建 collection_posts 表（合集-帖子关联，支持排序）
  修改效果：数据库支持攻略结构化数据和内容合集功能

第2条

  修改时间：2026-07-18 22:30
  修改位置：server/src/entities/guide-detail.entity.ts, collection.entity.ts, collection-post.entity.ts
  修改原因：TypeORM 实体定义
  修改内容：
    - 新建 GuideDetail 实体（与 Post 一对一关联）
    - 新建 Collection 实体（与 User 多对一关联）
    - 新建 CollectionPost 实体（Collection 和 Post 的多对多关联）
  修改效果：后端实体支持攻略和合集数据模型

第3条

  修改时间：2026-07-18 22:30
  修改位置：server/src/modules/posts/posts.module.ts, posts.service.ts, posts.controller.ts, common/interfaces.ts
  修改原因：后端服务层支持攻略创建和合集CRUD
  修改内容：
    - PostsModule 注册 GuideDetail/Collection/CollectionPost 实体
    - createPost 支持 GUIDE 类型自动创建攻略详情
    - getPostById 关联加载 guideDetail
    - 新增合集 CRUD：createCollection/getCollections/getCollectionById
    - 新增合集帖子管理：addPostToCollection/removePostFromCollection
    - 新增 6 个 API 端点：collections CRUD + posts 管理
  修改效果：后端完整支持攻略发布和合集管理

第4条

  修改时间：2026-07-18 22:30
  修改位置：web/src/types/index.ts, web/src/lib/post-api.ts
  修改原因：前端类型和API同步
  修改内容：
    - 新增 GuideCategory/BudgetLevel/GuideDetail/Collection 接口
    - Post 接口新增 guideDetail 字段
    - CreatePostPayload 新增 guideDetail 字段
    - 新增合集 API 函数（create/get/getPosts/addPost/removePost）
  修改效果：前端类型完整支持攻略和合集

第5条

  修改时间：2026-07-18 22:30
  修改位置：web/src/components/post/post-composer.tsx
  修改原因：发布器支持攻略专属字段
  修改内容：
    - 选择 GUIDE 时显示攻略信息面板（目的地/分类/最佳季节/预算）
    - 提交时自动携带 guideDetail 数据
    - 发布后重置攻略状态
  修改效果：用户可发布带结构化数据的攻略帖子

第6条

  修改时间：2026-07-18 22:30
  修改位置：web/src/components/post/post-card.tsx
  修改原因：帖子卡片展示攻略详情
  修改内容：
    - GUIDE 类型帖子显示攻略信息条（分类/目的地/季节/预算徽章）
    - 新增 guideCategoryLabels/budgetLabels 映射
  修改效果：帖子卡片直观展示攻略的结构化信息

【2026-07-18 内容分类体系 Phase 3 - 路线与旅程】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-18 22:00
  修改位置：server/sql/migrate-route-journey.sql
  修改原因：为路线和旅程内容类型创建结构化数据表
  修改内容：
    - 新建 route_details 表（距离/时长/爬升/难度/类型/GPX/途经点）
    - 新建 journeys 表（标题/目的地/日期/封面/站点数）
    - 新建 journey_stops 表（天数/地点/坐标/描述/媒体）
  修改效果：数据库支持路线和旅程的结构化数据存储

第2条

  修改时间：2026-07-18 22:00
  修改位置：server/src/entities/route-detail.entity.ts, journey.entity.ts, journey-stop.entity.ts
  修改原因：TypeORM 实体定义
  修改内容：
    - 新建 RouteDetail 实体（与 Post 一对一关联）
    - 新建 Journey 实体（与 Post 一对一关联，与 JourneyStop 一对多）
    - 新建 JourneyStop 实体（与 Journey 多对一关联）
  修改效果：后端实体完整支持路线/旅程数据模型

第3条

  修改时间：2026-07-18 22:00
  修改位置：server/src/modules/posts/posts.module.ts, posts.service.ts, common/interfaces.ts
  修改原因：后端服务层支持路线/旅程创建和查询
  修改内容：
    - PostsModule 注册 RouteDetail/Journey/JourneyStop 实体
    - CreatePostDto 新增 routeDetail 和 journey 字段
    - createPost 根据 postType 自动创建路线/旅程结构化数据
    - getPostById 关联加载 routeDetail 和 journey（含 stops）
  修改效果：发布 ROUTE/JOURNEY 类型帖子时自动保存结构化数据

第4条

  修改时间：2026-07-18 22:00
  修改位置：web/src/types/index.ts, web/src/lib/post-api.ts
  修改原因：前端类型定义同步
  修改内容：
    - 新增 Difficulty/RouteType 类型
    - 新增 RouteDetail/JourneyStop/Journey 接口
    - Post 接口新增 routeDetail 和 journey 字段
    - CreatePostPayload 新增 routeDetail 和 journey 字段
  修改效果：前端类型完整支持路线/旅程数据

第5条

  修改时间：2026-07-18 22:00
  修改位置：web/src/components/post/post-composer.tsx
  修改原因：发布器支持路线/旅程专属字段填写
  修改内容：
    - 选择 ROUTE 时显示路线信息面板（距离/时长/爬升/类型/难度）
    - 选择 JOURNEY 时显示旅程信息面板（标题/目的地/日期）
    - 提交时自动携带 routeDetail/journey 数据
    - 发布后重置路线/旅程状态
  修改效果：用户可发布带结构化数据的路线和旅程帖子

第6条

  修改时间：2026-07-18 22:00
  修改位置：web/src/components/post/post-card.tsx
  修改原因：帖子卡片展示路线/旅程详情
  修改内容：
    - ROUTE 类型帖子显示路线信息条（距离/时长/爬升/难度/类型徽章）
    - JOURNEY 类型帖子显示旅程信息条（标题/目的地/日期/站点数）
    - 新增 difficultyLabels/difficultyColors/routeTypeLabels 映射
  修改效果：帖子卡片直观展示路线和旅程的结构化信息

【2026-07-18 内容分类体系 Phase 2 - 话题系统】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-18 21:30
  修改位置：server/src/modules/posts/posts.controller.ts, posts.service.ts
  修改原因：扩展话题API，支持话题详情和话题帖子列表查询
  修改内容：
    - 新增 GET /api/posts/topics/:id（话题详情）
    - 新增 GET /api/posts/topics/:id/posts（话题帖子列表，支持latest/hot排序）
    - 新增 GET /api/posts/topics/all（全部话题列表）
  修改效果：后端完整支持话题聚合功能

第2条

  修改时间：2026-07-18 21:30
  修改位置：web/src/lib/post-api.ts
  修改原因：前端API层补充话题相关接口
  修改内容：
    - 新增 getTopicById（获取话题详情）
    - 新增 getTopicPosts（获取话题帖子，支持分页和排序）
    - 新增 getAllTopics（获取全部话题）
  修改效果：前端可完整调用话题API

第3条

  修改时间：2026-07-18 21:30
  修改位置：web/src/app/(main)/topics/page.tsx, web/src/app/(main)/topics/[id]/page.tsx
  修改原因：创建话题广场和话题详情页面
  修改内容：
    - 新增 /topics 话题广场页面（话题卡片网格、搜索、热门标签）
    - 新增 /topics/[id] 话题详情页面（话题信息、帖子列表、排序切换、加载更多）
  修改效果：用户可浏览话题广场和查看话题下的所有帖子

第4条

  修改时间：2026-07-18 21:30
  修改位置：web/src/components/layout/right-panel.tsx, sidebar.tsx
  修改原因：右侧面板和侧边栏集成话题入口
  修改内容：
    - 右侧面板热门话题改用新API，链接到话题详情页
    - 新增"查看全部话题"链接
    - 侧边栏导航新增"话题广场"入口（Hash图标）
  修改效果：用户可从多个入口访问话题功能

第5条

  修改时间：2026-07-18 21:30
  修改位置：web/src/app/(main)/search/page.tsx
  修改原因：搜索页增加话题搜索能力
  修改内容：
    - 搜索框提示文字改为"搜索用户、内容、话题..."
    - 新增"话题"Tab，展示话题搜索结果
    - "全部"Tab增加话题结果区域
    - 话题搜索结果可点击跳转话题详情页
  修改效果：搜索功能覆盖话题维度

第6条

  修改时间：2026-07-18 21:30
  修改位置：web/src/components/post/post-card.tsx
  修改原因：帖子卡片中的话题标签可点击跳转
  修改内容：
    - 话题标签从 span 改为 Link 组件
    - 点击跳转到 /topics/[id] 话题详情页
  修改效果：用户可从帖子卡片直接进入话题页面

【2026-07-18 内容分类体系 Phase 1】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-18 21:00
  修改位置：server/sql/migrate-content-classification.sql
  修改原因：为帖子添加内容分类能力，支持多维度内容组织
  修改内容：
    - posts表新增 post_type 枚举字段（NOTE/VR_MEDIA/ROUTE/JOURNEY/GUIDE/MOMENT）
    - 新建 post_tags 表（帖子-标签多对多关联，复用现有 interest_tags）
    - 新建 topics 表（用户自建话题聚合）
    - 新建 post_topics 表（帖子-话题多对多关联）
  修改效果：数据库支持内容形式分类、标签关联、话题聚合三层分类体系

第2条

  修改时间：2026-07-18 21:00
  修改位置：server/src/entities/post.entity.ts, server/src/entities/topic.entity.ts
  修改原因：TypeORM 实体与数据库表结构同步
  修改内容：
    - Post 实体新增 postType 字段 + tags/topics ManyToMany 关联
    - 新建 Topic 实体（话题标签）
    - InterestTag 实体已存在，无需修改
  修改效果：后端实体完整支持内容分类数据模型

第3条

  修改时间：2026-07-18 21:00
  修改位置：server/src/modules/posts/posts.service.ts, posts.controller.ts, posts.module.ts
  修改原因：后端服务层支持标签/话题 CRUD 和筛选查询
  修改内容：
    - PostsModule 注册 InterestTag、Topic 实体
    - createPost 支持 tagIds 和 topicNames 参数（话题不存在时自动创建）
    - getPosts 支持 postType 和 tagId 筛选参数
    - 新增 GET /api/posts/tags（获取全部标签）
    - 新增 GET /api/posts/topics（热门话题）
    - 新增 GET /api/posts/topics/search（话题搜索）
    - getPostById 关联加载 tags 和 topics
    - formatPost 输出包含 tags 和 topics
  修改效果：帖子发布支持标签和话题，列表查询支持按类型和标签筛选

第4条

  修改时间：2026-07-18 21:00
  修改位置：server/src/common/interfaces.ts, web/src/types/index.ts, web/src/lib/post-api.ts
  修改原因：前后端类型定义同步
  修改内容：
    - 新增 PostType 类型定义
    - CreatePostDto 新增 postType/tagIds/topicNames 字段
    - Post 类型新增 postType/tags/topics 字段
    - 新增 Topic 接口定义
    - post-api 新增 getTags/getHotTopics/searchTopics 函数
    - getPosts 参数新增 postType/tagId 筛选
  修改效果：前后端类型完全对齐，API 层支持新功能

第5条

  修改时间：2026-07-18 21:00
  修改位置：web/src/components/post/post-composer.tsx
  修改原因：发布器支持内容类型选择和标签/话题添加
  修改内容：
    - 新增内容类型选择栏（笔记/VR内容/路线/旅程/攻略/动态 6种）
    - 新增标签选择器（从已有标签中选择，最多5个）
    - 新增话题输入框（回车添加自定义话题，最多5个）
    - 发布时携带 postType/tagIds/topicNames
  修改效果：用户发布内容时可选择内容形式、添加标签和话题

第6条

  修改时间：2026-07-18 21:00
  修改位置：web/src/app/(main)/feed/page.tsx, web/src/app/(main)/explore/page.tsx
  修改原因：Feed 页和探索页支持内容类型筛选
  修改内容：
    - Feed 页新增内容类型筛选胶囊栏（全部/笔记/VR内容/路线/旅程/攻略/动态）
    - 探索页新增内容类型筛选栏（全部/VR内容/路线/攻略）
    - 筛选切换时重新加载对应类型的内容
  修改效果：用户可按内容形式浏览和筛选帖子

第7条

  修改时间：2026-07-18 21:00
  修改位置：web/src/components/post/post-card.tsx, web/src/stores/post-store.ts
  修改原因：帖子卡片展示内容类型标识和标签
  修改内容：
    - 帖子卡片新增内容类型徽章（非 NOTE 类型显示彩色标签）
    - 帖子卡片新增标签和话题展示区
    - post-store 新增 filters 状态，fetchPosts 支持筛选参数
  修改效果：帖子卡片直观展示内容分类信息，Feed 支持筛选状态管理

【2026-07-17 首页AR眼镜功能优化】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-17 15:00
  修改位置：web/src/app/(landing)/page.tsx
  修改原因：用户要求首页突出AR眼镜功能，增强视觉效果
  修改内容：
    - Hero区域：从单列居中布局改为左右分栏布局，右侧添加AR眼镜3D视觉效果
    - AR眼镜图形：使用CSS绘制AR眼镜造型，添加浮动和发光动画效果
    - 功能标签：在眼镜周围添加"实时连接""全天续航""语音交互""AR导航"四个浮动标签
    - 新增AR功能展示区：添加AR眼镜功能列表（4K拍摄、AR实景叠加、实时翻译、AR导航）
    - 新增AR功能演示区：展示AR眼镜在景点识别、实时翻译、AR导航三个场景的实际效果
    - 新增AR vs 传统设备对比：对比AR眼镜与手机、运动相机的优劣势
    - 文案统一：将所有"VR眼镜"引用改为"AR眼镜"
    - 导入新图标：Eye、Wifi、Battery、Camera、Mic、Navigation
    - 添加CSS动画：浮动动画(float)和发光动画(glow)
  修改效果：首页从单一文案展示变为AR眼镜功能突出的视觉化展示，用户能直观了解AR眼镜的核心功能和优势

  修改时间：2026-07-17 15:30
  修改位置：web/src/app/(landing)/page.tsx
  修改原因：用户反馈不需要价格标识和"徐霞客 AR Pro"产品介绍
  修改内容：
    - 移除AR vs 传统设备对比中的价格显示（¥2,999起、¥3,000+、¥2,000+）
    - 移除"徐霞客 AR Pro"规格卡片，替换为简洁的AR眼镜图形展示
    - 右侧展示改为：AR眼镜图形 + 环绕的功能标签（4K拍摄、AR识别、实时翻译、AR导航）
  修改效果：页面更加聚焦于AR眼镜的功能介绍，避免商业化气息过重

【2026-07-16 社交功能】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-16 23:00
  修改位置：server/sql/, server/src/entities/, server/src/modules/social/, web/src/
  修改原因：实现社交功能 — 同类项推荐和建群功能
  修改内容：
    - 新增数据库表：interest_tags（兴趣标签）、user_interests（用户兴趣关联）、communities（社群）、community_tags（社群标签关联）
    - 新增TypeORM实体：InterestTag、UserInterest、Community、CommunityTag
    - 新增SocialController，实现：标签CRUD、用户兴趣管理、智能推荐算法、社群CRUD
    - 智能推荐算法：基于共同兴趣数量、同龄人（±5岁）、同地区综合评分排序
    - 前端新增页面：发现好友页（/discover）、创建社群页（/communities/create）、社群详情页（/communities/[id]）
    - 设置页面新增"兴趣标签"Tab，支持用户选择和管理兴趣标签
    - 侧边栏新增"发现好友"导航入口，推荐关注改为智能推荐
    - 右侧面板新增"推荐社群"卡片
    - 预设30个兴趣标签，覆盖旅行/VR技术/户外活动/文化体验等分类
  修改效果：用户可通过兴趣标签完善个人画像，系统基于共同兴趣、年龄、地区智能推荐同类用户和社群；用户可创建基于兴趣的社群，支持公开/私密设置

  修改时间：2026-07-16 23:45
  修改位置：web/src/components/layout/sidebar.tsx
  修改原因：移除侧边栏中不需要的"关于徐霞客"导航项
  修改内容：
    - 删除导航项配置中的"关于徐霞客"条目
    - 移除未使用的 Info 图标导入
  修改效果：侧边栏导航更加简洁，移除了冗余的导航入口

--------------------------------------------------------------------------------
第2条

  修改时间：2026-07-16 22:30
  修改位置：web/src/app/(landing)/page.tsx
  修改原因：调整为所有用户首次访问都看到介绍页，按钮根据登录状态智能跳转
  修改内容：
    - 移除已登录用户的自动重定向逻辑
    - 所有用户访问 / 都能看到完整的介绍页内容
    - 导航栏：已登录显示"进入社区"按钮，未登录显示"登录/注册"
    - Hero CTA：已登录显示"进入社区"→/feed，未登录显示"开始探索"→/login
    - 底部 CTA：已登录显示"进入社区"，未登录显示"免费注册/已有账号登录"
    - 保留 DeepSeek 风格的全屏 Hero、功能展示、数据佐证等完整内容
  修改效果：每次访问首页都能看到丰富的介绍内容，点击按钮后根据登录状态智能跳转到社区或登录页

--------------------------------------------------------------------------------
第3条

  修改时间：2026-07-16 10:00
  修改位置：web/src/app/(main)/about/page.tsx
  修改原因：原页面像产品官网，与社区风格割裂，需融入社区体验
  修改内容：
    - 重构页面为社区化风格，使用 Card/Badge/Avatar 等统一组件
    - 新增社区数据统计板块（旅行者/故事/城市/VR内容数量）
    - 新增精选旅行者故事板块，用真实用户内容展示社区活力
    - 功能介绍改为用户视角"在徐霞客，你可以..."
    - 新增底部快速入口，引导用户浏览动态/发现旅伴/分享旅程
    - 移除技术架构板块和冗余的导入
    - 添加徐霞客名言增强文化温度
  修改效果：页面从产品宣传页变为社区介绍页，与平台整体风格统一，用户能感受到活跃社区氛围

--------------------------------------------------------------------------------
第4条

  修改时间：2026-07-14 17:50 ~ 18:25
  修改位置：server/src/modules/, web/src/stores/, web/src/app/(main)/notifications/, web/src/app/(main)/messages/
  修改原因：头像更新后，项目中所有显示该用户的地方都需要同步更新；通知和消息页面使用mock数据需改为真实数据
  修改内容：
    - 后端新增 GET /api/users/suggested/list 接口，返回最新用户（仅排除自己），包含 isFollowing 字段
    - 后端新增会话API：GET /api/conversations（会话列表）、GET/POST /api/conversations/:id/messages（消息）
    - 前端 sidebar 组件改为从后端获取推荐用户，不再使用 mockUsers 静态数据
    - post-store 新增 updateUserAvatar 方法，更新帖子列表中指定用户的头像
    - auth-store 的 updateUser 方法在更新头像时，同步调用 post-store 更新帖子中的用户头像
    - 通知页面改为从后端 /api/notifications 获取真实数据，支持标记已读
    - 消息页面改为从后端 /api/conversations 获取真实会话列表
  修改效果：头像更新后全局同步；通知和消息页面显示真实数据，头像实时更新

  补充修改：个人主页（/profile/[username]）改为从后端获取用户数据，不再使用 mockUsers，确保显示最新头像

【2026-07-11】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-11 19:10 ~ 20:30
  修改位置：web/src/app/globals.css, layout.tsx, 以及 20+ 组件文件
  修改原因：建立徐霞客品牌视觉识别系统，从小红书清新感+抖音流畅交互+VR沉浸式设计出发
  修改内容：
    - 色彩系统：从单色灰阶改为山水青(oklch 175°)+日落橙(oklch 55°)双色主题，亮暗双模式
    - 字体：从 Geist 替换为 Quicksand(圆润拉丁)+Noto Sans SC(中文) 字体组合
    - 动效：添加卡片悬浮升起、按钮点击回弹、全局平滑过渡动画
    - 品牌渐变：Logo 和封面使用青橙渐变，文字渐变效果
    - 统一色彩：消除 20+ 组件中 150+ 处硬编码颜色，全部使用语义化 CSS 变量
  修改效果：界面从单调灰阶转为清新自然的山水风格，交互更流畅自然

--------------------------------------------------------------------------------
第2条

  修改时间：2026-07-11 22:30 ~ 22:35
  修改位置：web/public/images/login-bg.svg, web/src/app/(auth)/layout.tsx
  修改原因：重新设计登录背景，体现VR第一视角沉浸式体验、社交连接本质、智能眼镜+徐霞客探索文化
  修改内容：
    - 创建定制 SVG 背景图 (332行)，包含17层视觉元素：深空渐变、星空、北极星导航、三层水墨山峦、
      金色探索足迹路径、13个社交网络节点+连接线、VR智能眼镜框架角、HUD网格、扫描线、罗盘指南针、
      旅行日志书卷、水墨云雾、暗角聚焦、徐霞客名言「丈夫当朝碧海而暮苍梧」
    - 移除 Unsplash 外部图片依赖，改用本地 SVG，加载更快更稳定
    - 更新 Logo 副标题为「戴智能眼镜，连接志同道合的探索者」
    - 移除多余的叠加遮罩层（SVG 内置暗角）
  修改效果：登录页背景完整呈现徐霞客"VR+探索+社交"品牌叙事，无外部依赖，首屏加载更可靠

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-04 20:17 ~ 21:24
  修改位置：.claude/auto-commit.sh
  修改原因：优化自动提交脚本逻辑
  修改内容：更新自动提交脚本，调整提交流程和日志记录方式
  修改效果：自动提交过程更稳定，日志输出更清晰

--------------------------------------------------------------------------------
第2条

  修改时间：2026-07-04 21:20 ~ 21:22
  修改位置：web/src/components/layout/（right-panel.tsx, mobile-nav.tsx, navbar.tsx, sidebar.tsx）
  修改原因：布局组件需要统一优化
  修改内容：对右侧导航栏、移动端导航、顶部导航栏、侧边栏进行样式调整和交互优化，统一视觉风格
  修改效果：整体布局更协调，各端显示效果更佳

--------------------------------------------------------------------------------
第3条

  修改时间：2026-07-04 21:12 ~ 21:15
  修改位置：web/src/app/(main)/settings/components/appearance-tab.tsx
  修改原因：需要实现外观设置功能
  修改内容：安装next-themes依赖，创建ThemeProvider组件，实现完整的外观设置面板，包括主题切换、紧凑模式等，扩展ui-store添加外观状态，外观设置自动持久化到localStorage
  修改效果：用户可以自定义界面主题和显示偏好，设置会自动保存

--------------------------------------------------------------------------------
第4条

  修改时间：2026-07-04 10:19 ~ 21:01
  修改位置：web/src/app/(main)/settings/page.tsx
  修改原因：设置页面需要重构和完善
  修改内容：对设置页面进行多次重构，优化页面结构和Tab切换逻辑，整合各设置子组件
  修改效果：设置页面结构更清晰，各功能Tab切换更流畅

--------------------------------------------------------------------------------
第5条

  修改时间：2026-07-04 19:21 ~ 21:01
  修改位置：web/src/app/(main)/settings/components/notifications-tab.tsx
  修改原因：通知设置组件需要完善
  修改内容：实现通知设置组件，添加各种通知选项的开关控制和配置功能
  修改效果：用户可以自定义通知偏好设置

--------------------------------------------------------------------------------
第6条

  修改时间：2026-07-04 19:17 ~ 20:54
  修改位置：web/src/app/(main)/settings/components/privacy-tab.tsx
  修改原因：隐私设置需要完善和清理
  修改内容：实现隐私设置组件，添加隐私相关选项，后续清理了多余的代码
  修改效果：用户可以管理隐私相关设置

--------------------------------------------------------------------------------
第7条

  修改时间：2026-07-04 19:16
  修改位置：web/src/app/(main)/settings/components/profile-tab.tsx
  修改原因：需要实现个人资料设置功能
  修改内容：创建个人资料设置组件，包含用户信息编辑、头像上传等功能
  修改效果：用户可以在设置页面编辑个人资料信息

--------------------------------------------------------------------------------
第8条

  修改时间：2026-07-04 11:01
  修改位置：.gitignore
  修改原因：需要更新忽略规则
  修改内容：添加新的文件和目录到git忽略列表
  修改效果：避免不必要的文件被纳入版本控制

--------------------------------------------------------------------------------
第9条

  修改时间：2026-07-04 20:49 ~ 20:54
  修改位置：server/src/modules/auth/（auth.controller.ts, auth.service.ts）
  修改原因：认证模块需要优化
  修改内容：重构认证控制器和服务，优化登录注册流程，调整接口响应格式
  修改效果：认证流程更规范，接口响应更统一

--------------------------------------------------------------------------------
第10条

  修改时间：2026-07-04 20:11
  修改位置：server/src/common/interfaces.ts
  修改原因：需要统一接口类型定义
  修改内容：添加和更新公共接口类型定义
  修改效果：前后端类型定义更统一，减少类型错误

--------------------------------------------------------------------------------
第11条

  修改时间：2026-07-04 10:33 ~ 10:59
  修改位置：web/src/app/(main)/messages/[conversationId]/page.tsx
  修改原因：消息对话页面需要优化
  修改内容：调整消息对话页面的布局和交互逻辑
  修改效果：消息对话体验更流畅

--------------------------------------------------------------------------------
第12条

  修改时间：2026-07-04 10:20 ~ 10:35
  修改位置：server/sql/schema.sql, server/src/entities/user.entity.ts
  修改原因：用户数据模型需要扩展
  修改内容：更新数据库Schema和用户实体，添加新的用户字段
  修改效果：支持更丰富的用户信息存储

--------------------------------------------------------------------------------
第13条

  修改时间：2026-07-04 10:19
  修改位置：server/src/modules/users/users.controller.ts
  修改原因：用户模块接口需要调整
  修改内容：更新用户控制器的接口逻辑
  修改效果：用户相关接口更完善

--------------------------------------------------------------------------------
第14条

  修改时间：2026-07-04 10:20
  修改位置：server/sql/migrate-add-profile-fields.sql
  修改原因：需要数据库迁移脚本
  修改内容：创建数据库迁移脚本，添加用户资料相关字段
  修改效果：数据库结构平滑升级

【2026-07-03】

--------------------------------------------------------------------------------
第15条

  修改时间：2026-07-03 19:05 ~ 19:26
  修改位置：web/src/app/(main)/settings/page.tsx
  修改原因：设置页面初始开发
  修改内容：创建设置页面基础结构，实现Tab组件框架
  修改效果：设置页面基础框架搭建完成
