项目修改记录（最近30条）
================================================================================

【2026-07-20 研究计划与研究方案】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-20
  修改位置：徐霞客社区研究计划与研究方案.md（新建）
  修改原因：需要制定完整的项目研究计划和实施方案，明确后续开发方向和测试策略
  修改内容：
    - 新建研究计划与研究方案文档，包含9个主要章节
    - 分析项目当前开发状态，梳理已完成的功能模块
    - 制定5个核心研究任务：AR眼镜数据接入、AR内容渲染、社区功能深化、推荐算法优化、性能优化
    - 规划5个实施阶段：从2026年8月到2027年5月
    - 设计完整的测试计划：单元测试、集成测试、系统测试、用户验收测试
    - 分析技术风险、项目风险、市场风险及应对措施
    - 定义成功标准和评估方法
  修改效果：为项目后续开发提供清晰的路线图和实施指南

【2026-07-20 右侧栏布局重构】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-20
  修改位置：web/src/components/layout/sidebar.tsx
  修改原因：推荐关注模块从左侧栏移到右侧栏
  修改内容：
    - 移除左侧栏底部的"推荐关注"模块
    - 移除相关的状态管理（suggestedUsers）和useEffect
    - 移除未使用的导入（apiClient、getRecommendedUsers、RecommendedUser）
  修改效果：左侧栏更加简洁，专注于导航功能

第2条

  修改时间：2026-07-20
  修改位置：web/src/components/layout/right-panel.tsx
  修改原因：重新设计右侧栏布局，按照用户需求调整模块顺序
  修改内容：
    - 新增"推荐关注"模块，显示3个推荐用户（从左侧栏移入）
    - 移除"热门媒体"模块（不再需要）
    - 移除"直播预告"模块（不再需要）
    - 新增导入：getRecommendedUsers、RecommendedUser、UserPlus
    - 调整模块顺序：热门话题 → 推荐关注 → 推荐社群 → 近期热门动态 → 页脚
  修改效果：右侧栏布局更加合理，推荐关注功能从左侧移至右侧，移除了不常用的热门媒体和直播预告

【2026-07-19 上传内容功能完善】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/upload/page.tsx
  修改原因：VR视频输入框持久化文字问题，页面加载时自动恢复草稿导致随机文字一直存在
  修改内容：
    - 移除页面加载时自动从localStorage恢复草稿的逻辑
    - 保留自动保存草稿功能和手动选择草稿功能
  修改效果：页面打开时不再自动加载之前的草稿内容，修复输入框持久化问题

第2条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/upload/guide-creator/page.tsx
  修改原因：攻略创建器只支持纯文本，缺少图片上传能力
  修改内容：
    - 引入MultiImageUploader组件
    - 添加images状态管理
    - 在详细内容区域后添加攻略图片上传区域（最多12张）
    - 发布时将图片作为mediaItems传递
  修改效果：攻略创建器支持上传多张景点、美食、住宿等相关图片

第3条

  修改时间：2026-07-19
  修改位置：web/src/lib/translation-api.ts（新建）, web/src/app/(main)/upload/page.tsx
  修改原因：翻译功能为UI占位，未实现实际翻译能力
  修改内容：
    - 新建translation-api.ts，使用MyMemory免费翻译API
    - 支持中英日韩四种语言互译
    - 添加自动语言检测功能
    - 更新上传页翻译Tab：添加语言选择、翻译按钮、结果展示
    - 支持一键复制翻译结果、交换源语言和目标语言
  修改效果：翻译功能可正常使用，支持实时翻译和结果复制

第4条

  修改时间：2026-07-19
  修改位置：web/src/components/upload/topic-selector.tsx, web/src/app/(main)/upload/page.tsx
  修改原因：话题标签选择缺少智能推荐，用户需要手动搜索
  修改内容：
    - TopicSelector新增content属性，用于分析内容关键词
    - 添加extractKeywords函数，提取中文和英文关键词（过滤停用词）
    - 根据关键词搜索相关话题，按热度排序推荐
    - UI新增"根据内容推荐"区域，显示智能推荐话题
    - 上传页传递content到TopicSelector
  修改效果：用户输入内容后自动推荐相关话题标签

第5条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/upload/page.tsx
  修改原因：视频和音频上传区域不支持拖拽操作
  修改内容：
    - 视频上传区域添加onDragOver和onDrop事件处理
    - 音频上传区域添加onDragOver和onDrop事件处理
  修改效果：支持拖拽文件到上传区域进行上传

第6条

  修改时间：2026-07-19
  修改位置：web/src/components/upload/route-map-preview.tsx（新建）, web/src/app/(main)/upload/route-creator/page.tsx, web/package.json
  修改原因：路线创建后无法直观预览轨迹和途经点位置
  修改内容：
    - 安装leaflet和react-leaflet地图库
    - 新建RouteMapPreview组件，使用OpenStreetMap瓦片
    - 支持显示GPX轨迹线（蓝色折线）
    - 支持显示途经点标记（点击显示名称和描述）
    - 自动调整地图边界以适应所有点
    - 路线创建页面集成地图预览组件
  修改效果：上传GPX文件或添加途经点后可实时预览路线地图

【2026-07-19 首页与探索发现功能区分】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-19
  修改位置：server/src/modules/posts/posts.service.ts, posts.controller.ts, posts.module.ts
  修改原因：getPosts 不支持按关注关系过滤帖子，无法实现首页关注动态流
  修改内容：
    - 注入 UserFollow repository
    - getPosts 新增 userId 和 followingOnly 参数
    - followingOnly=true 时查询关注列表，过滤作者在关注列表中的帖子，可见性包含 PUBLIC 和 FOLLOWERS
    - getTrendingPosts 和 getHotPosts 同步支持 followingIds 过滤
    - Controller 的 GET /posts 端点可选读取 authorization header，有 token 时提取 userId
  修改效果：后端支持按关注关系过滤帖子，支持 FOLLOWERS 可见性帖子展示

第2条

  修改时间：2026-07-19
  修改位置：web/src/lib/post-api.ts, web/src/stores/post-store.ts, web/src/components/feed/feed-list.tsx
  修改原因：前端需要传递 followingOnly 参数到后端
  修改内容：
    - post-api.ts 的 getPosts 参数新增 followingOnly
    - post-store.ts 的 PostFilters 新增 followingOnly
    - feed-list.tsx 的 FeedListProps 新增 followingOnly，传递给 fetchPosts
    - 关注动态为空时显示引导页面：发现旅伴 + 探索发现按钮
  修改效果：前端支持关注动态流模式

第3条

  修改时间：2026-07-19
  修改位置：web/src/app/(main)/feed/page.tsx, web/src/app/(main)/explore/page.tsx
  修改原因：首页和探索页功能高度重叠，需要明确区分定位
  修改内容：
    - 首页：改为关注动态流（followingOnly=true），展示关注用户的最新内容
    - 探索页：顶部新增热门话题横向滚动卡片（getHotTopics API）
    - 探索页：内容类型筛选聚焦旅行发现（VR内容/路线/攻略），去掉笔记/旅程/动态
    - 探索页：排序标签改为圆角 pill 样式
  修改效果：首页是社交时间线（你在关注谁），探索页是全局发现引擎（全站在发生什么）

【2026-07-19 帖子编辑与删除功能】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-19
  修改位置：server/src/modules/posts/posts.service.ts, posts.controller.ts
  修改原因：后端缺少编辑帖子的端点
  修改内容：
    - posts.service.ts 新增 updatePost(userId, postId, dto) 方法，验证作者权限后更新 content
    - posts.controller.ts 新增 @Put(':id') 端点，需 JWT 认证
  修改效果：后端支持编辑帖子内容

第2条

  修改时间：2026-07-19
  修改位置：web/src/lib/post-api.ts, web/src/stores/post-store.ts
  修改原因：前端缺少编辑/删除帖子的 API 和状态管理
  修改内容：
    - post-api.ts 新增 updatePost(postId, payload) 函数
    - post-store.ts 新增 removePost(postId) 和 updatePostInList(postId, updatedPost) actions
  修改效果：前端具备编辑和删除帖子的完整数据流

第3条

  修改时间：2026-07-19
  修改位置：web/src/components/post/post-card.tsx, edit-post-dialog.tsx（新建）
  修改原因：帖子卡片需要编辑和删除操作入口
  修改内容：
    - PostCard 的 DropdownMenu 区分自己/他人的帖子：自己的显示编辑、删除、复制链接；他人的显示保存、复制链接、举报
    - 新建 EditPostDialog 编辑弹窗组件，预填当前内容，保存后原地更新列表
    - 删除操作使用 Dialog 确认弹窗，确认后从列表移除
    - 复制链接功能调用 clipboard API
  修改效果：用户可编辑和删除自己发布的帖子，交互参考小红书/抖音风格

【2026-07-19 首页快速发布社交化改造】

--------------------------------------------------------------------------------
第1条

  修改时间：2026-07-19
  修改位置：web/src/components/post/post-composer.tsx
  修改原因：首页发布器交互偏重，展开后显示6种帖子类型选择器、标签/话题、类型专属字段，操作路径太长
  修改内容：
    - 重构为社交平台风格：收起状态一行布局（头像+输入+图片按钮+发布按钮）
    - 展开状态：多行textarea自动扩展+图片预览网格+媒体按钮行+发布按钮
    - 移除帖子类型选择器、标签选择器、话题输入、路线/旅程/攻略专属字段
    - 默认发布NOTE类型，复杂内容引导到/upload页面
    - 新增拖拽上传图片（dragOver/dragLeave/drop事件）
    - 新增粘贴上传图片（paste事件检测剪贴板图片）
    - 新增"+"更多菜单（Popover）：添加音频、添加链接、前往上传页面
    - 更多菜单支持点击外部自动关闭
    - 收起状态媒体数量角标、Ctrl+Enter快捷键提示、发布中状态处理
  修改效果：首页发布体验从"功能齐全的编辑器"变为"快速发布的社交风格"，文字+图片一键发布，复杂内容走独立页面

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
