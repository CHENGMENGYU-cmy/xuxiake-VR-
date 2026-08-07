项目修改记录（最近30条）
================================================================================

修改时间：2026-08-07
修改位置：web/src/app/(main)/snap/generate/batch/page.tsx, diaries/[id]/page.tsx, diaries/page.tsx, discover/page.tsx；server/src/modules/posts/ai.service.ts
修改原因：1) 批量生成页生成后只有「标题+内容」的简单编辑区，无封面图/时间/心情展示，与详情页完整卡片不一致；2) 素材心情为中文值、手写心情为 MoodType key，两套格式导致详情页/列表/广场心情展示不统一
修改内容：1) batch 编辑器顶部加大封面图（首张素材）、标题下显示生成时间与心情，展示向完整卡片靠拢；2) 后端 executeMultiDiaryJob 生成时把素材心情写入 vrMetadata.mood，详情页可完整展示；3) 详情页/我的日记列表/日记广场的心情展示兼容两种格式（能匹配 MoodEmoji 时显示表情，否则直接显示文字心情）
修改效果：AI 批量生成日记后编辑器即有封面图+时间+心情的完整观感，发布后详情页心情字段完整；心情无论中文还是 MoodType 均正确显示
--------------------------------------------------------------------------------

修改时间：2026-08-07
修改位置：web/src/components/diary/snap-picker.tsx；web/src/app/(main)/diaries/[id]/page.tsx, diaries/page.tsx, discover/page.tsx；web/src/types/index.ts
修改原因：1) 写日记素材弹窗（DiaryComposeDialog/SnapPickerDialog）素材按时间平铺，用户想跨月选图时无从下手；2) 手写日记（感想+心情+天气）与 AI 写日记（标题+正文+感悟+图片）展示格式不一致，用户要求统一
修改内容：1) SnapPicker 素材多选网格新增月份分组筛选（顶部「全部」+各月份 chips，如2026年8月），可先切到某月再选该月素材，支持跨月选图；2) 日记详情页统一为完整卡片：封面图+标题+时间+天气+心情+地点+风格标签+正文+感悟（insight），手写与 AI 来源统一渲染；3) 我的日记列表卡片补天气/心情展示、有标题时显示标题；4) 日记广场卡片补天气/心情 chips；5) Post 类型补 title 字段（后端已有该字段）
修改效果：素材选择弹窗可按月筛选、轻松跨月选图；手写与 AI 日记在任何页面都以统一完整卡片展示
--------------------------------------------------------------------------------

修改时间：2026-08-07
修改位置：web/src/app/(main)/diaries/page.tsx, diaries/[id]/page.tsx
修改原因：我的日记列表页操作按钮未按帖子状态差异化——草稿（visibility 为 PRIVATE）错误显示「公开」按钮点击直接发布、跳过编辑确认；关注可见帖子无「直接公开」入口、公开/私密间切换需两次操作；详情页只有编辑/删除，缺可见性管理与升华入口
修改内容：1) 列表页操作按钮按状态差异化：草稿显示「继续写」回到对应 AI 编辑页（不再显示公开/私密切换）；已发布帖子显示「公开/私密/关注可见」两两切换（当前状态对应按钮隐藏，其余两个可见），公开/关注可见可一键互转；切换成功/失败均有 toast 提示；2) 详情页新增所有者操作区：草稿引导「继续写」，已发布帖子提供「公开/私密/关注可见」三态切换 + 「升华为游记」，与列表页能力对齐
修改效果：草稿不再误显示「公开」、可见性切换按状态差异化展示且支持关注可见直接互转；详情页可管理可见性并升华游记
--------------------------------------------------------------------------------

修改时间：2026-08-07
修改位置：web/src/app/(main)/snap/generate/batch/page.tsx, snap/page.tsx；server/src/modules/posts/ai.service.ts
修改原因：批量日记生成页（/snap/generate/batch）缺少风格选择，硬编码「温柔治愈」，与单张生成页（/snap/generate/[id]）的「选择风格」不一致，用户无法按喜好调整日记语气；素材库展开某天/某集合后进入多选，网格被限定在当前集合（如8月某天），看不到其他月份（如7月）的图片，无法跨月份选素材
修改内容：1) 批量生成页新增「选择日记风格」卡片（五种风格与单张页一致），首次进入先选风格再点「用『XX』生成日记」，不再无提示直接生成；2) 生成后点其他风格即换风格重写——先删除旧草稿再重新生成，避免草稿堆积；3) 从我的日记进入已有草稿时恢复其保存的风格并高亮显示；4) 保存日记时写入当前所选风格；5) 后端 getDiaryStyleGuide 兼容前端带「风」的风格名（温柔治愈风/生活碎片风等），旧草稿无「风」后缀名仍可匹配；6) 素材库多选模式改为展示全部素材（不再受展开的某天/某集合限制），可跨月份勾选图片，展开视图头部提示「多选模式下显示全部素材」
修改效果：批量生成与单张生成体验一致，先选风格再生成、可换风格重写；素材库多选可跨月份选图，7月/8月素材同屏勾选；web/server 类型检查通过
--------------------------------------------------------------------------------

修改时间：2026-08-07
修改位置：新增 web/src/components/diary/snap-picker.tsx, diary-compose-dialog.tsx；改造 web/src/app/(main)/snap/page.tsx, diaries/page.tsx, upload/page.tsx, components/upload/multi-image-uploader.tsx；更新 web/e2e/08-snap-library.spec.ts, 09-diary-flow.spec.ts
修改原因：两个「写日记」入口割裂——素材库右上角「AI 写日记」未选素材时直接拿列表第一张跳转（用户反馈"没选照片就跳走"），我的日记右上角「写日记」直接跳手写页且配图只能本地上传，无法用自己拍摄的素材；手写与 AI 两条路径没有统一的「先选素材」环节
修改内容：借鉴小红书"先选素材再进编辑器"模式，统一为「选素材 → 选创作方式（自己写/AI帮我写）→ 进对应编辑器」：1) 新增 SnapPicker 素材多选网格与 SnapPickerDialog 素材选择弹层；2) 新增 DiaryComposeDialog 两步创作引导弹层（选素材→选手写/AI），两个入口统一进入；3) 素材库右上角/全屏预览/多选底部三处按钮改名「写日记」并统一走引导，已多选直接进模式步、未选进选素材步；4) 我的日记「写日记」按钮改为打开引导；5) 手写编辑器 /upload?level=DIARY 支持 snapIds 参数把素材库图片作为配图引用，配图区新增「从素材库选择」补充入口，发布时写入 vrMetadata.sourceSnapIds 溯源；6) 修复 StrictMode 下素材配图重复加载 bug（去重移入 setImages 内部 + ref 防双调用）
修改效果：写日记从任意入口都先选素材再选创作方式，素材库不再无素材直接跳 AI 页；手写日记可用已拍摄素材配图并溯源；5 条 Playwright 验证通过（素材库入口→手写、我的日记入口→AI、多选直接进模式步、编辑器内补充配图、发布后 sourceSnapIds 与素材媒体写入校验），08-snap-library 测试同步通过
--------------------------------------------------------------------------------

修改时间：2026-08-07
修改位置：server/src/modules/posts/ai.service.ts, posts.service.ts；web/src/app/(main)/snap/page.tsx, snap/generate/batch/page.tsx（新增）, diaries/page.tsx；web/e2e/09-diary-flow.spec.ts（新增）
修改原因：素材库多选「AI 写日记」两条入口流转割裂——顶部按钮忽略多选跳第一张素材；底部按钮批量生成后直接保存为私密日记（无编辑确认），用户以为"写日记"结果直接发布；存草稿后无草稿箱去向，草稿以私密混在日记列表无标记
修改内容：统一为「选素材 → AI 生成草稿 → 人工编辑确认 → 存草稿/私密/发布」三段式：1) 新增批量编辑页 /snap/generate/batch，展示选中素材、调 AI 生成草稿、可编辑后保存；2) snap/page.tsx 顶部/底部「AI 写日记」多选时统一跳批量编辑页（顶部不再忽略多选、底部不再直接发布）；3) 后端 executeMultiDiaryJob 保存 status 由 private 改为 draft（先存草稿）；4) saveDiary 更新草稿时合并旧 vrMetadata，保留 sourceSnapIds/aiGenerated 溯源字段；5) getDiaryDraft 排除多素材批量草稿，避免单张生成页误恢复；6) /diaries 新增「草稿」筛选 tab、草稿卡片虚线边框+草稿角标，点击草稿回到对应编辑页继续编辑
修改效果：素材库多选写日记两条入口统一进批量编辑页，生成后先存草稿、人工确认后才发布；存草稿有明确草稿箱去向，草稿可继续编辑；新增 09-diary-flow 端到端测试全链路通过（多选→批量编辑→存草稿→草稿箱→发布）
--------------------------------------------------------------------------------

修改时间：2026-08-07
修改位置：web/src/app/(main)/snap/page.tsx；web/e2e/08-snap-library.spec.ts
修改原因：素材库多选模式选中态视觉反馈弱——主色圆圈在照片上对比度不足、勾选图标偏小，用户勾选后难以察觉是否选中，误以为"圆圈勾不上"（功能本身正常）
修改内容：1) 选中时照片叠加半透明主色蒙层（bg-primary/30），整张照片变色，选中态一目了然；2) 选中圆圈加白色描边环（ring-2 ring-white/80）与阴影（shadow-md），深色照片上也醒目；3) 勾选图标由 h-3 加大到 h-3.5 并加粗（strokeWidth 3）；4) 未选中圆圈半透明白底加轻阴影，浅色照片上仍可见；5) 08-snap-library 测试新增选中态视觉断言（蒙层/白描边/阴影/图标粗细）
修改效果：素材库多选勾选后有明确的视觉反馈（照片变绿 + 白描边圆圈 + 加粗勾），不再误判为勾不上；自动化测试覆盖视觉元素防回归
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：web/e2e/08-snap-library.spec.ts
修改原因：素材库功能此前无自动化测试覆盖，无法快速回归验证左侧菜单「素材库」入口及页面各交互
修改内容：完善素材库 Playwright 专项测试，覆盖左侧菜单入口跳转、标题/计数渲染、全部/按地点/按时间/按行程分类 Tab、按天与按地点集合打开、素材卡片点击进全屏相册预览（ESC 关闭）、多选勾选与取消、AI 写日记按钮可用性共 14 步断言
修改效果：素材库全链路自动化测试通过（1 passed），后续改动可一键回归
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：数据库（删除种子帖子）；server/src/modules/users/users.controller.ts；web/src/app/(main)/profile/[username]/components/posts-tab.tsx
修改原因：个人主页「在路上」分类被种子数据污染——56 篇种子示例帖（p1-p24、post-seed-001~015、cp1-cp18）包含大量无真实发布入口的「路线/攻略/第一视角/瞬间」类型，占据全站大部分帖子，导致卡片标签（日记/游记等）与「在路上」筛选（分类/日记/游记/第一视角/语音记录）分类口径不一致、无法对齐；用户只关心真实发布的数据
修改内容：1) 删除全部 56 篇种子帖子及关联数据（媒体/评论/点赞/收藏/通知/话题关联），已备份至 server/sql/backup_seed_posts_2026-08-06.sql，保留 90 篇真实（UUID）帖子；2) 「在路上」筛选对齐真实分类，简化为 全部/日记/游记（移除 分类/第一视角/语音记录 等种子概念）；3) 后端 getUserPosts 的 contentLevel 参数支持逗号分隔多值（TRAVELOGUE,ESSAY 同属游记）
修改效果：个人主页只展示真实发布内容（日记/游记），筛选 tab 与卡片标签一一对齐
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：web/src/lib/api-client.ts, web/src/stores/auth-store.ts
修改原因：access token（15分钟）与 refresh token（7天）均过期时，原逻辑只清除 localStorage 不通知 UI，个人主页帖子静默加载失败并在控制台暴露 401 报错，用户无任何提示
修改内容：1) api-client 在 refresh 彻底失败（登录过期）后 dispatch 全局 `auth:expired` 事件；2) auth-store 监听该事件，立即清除登录态并刷新页面，以游客身份重新加载公开内容；3) 登录/注册/登出时重置 sessionStorage 防重入标志，避免无限刷新
修改效果：token 彻底过期时页面自动降级为游客访问，公开内容正常展示，登录态正确清除，不再出现无提示的 401 空内容
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：server/src/modules/users/users.controller.ts; web/src/lib/social-api.ts, app/(main)/profile/[username]/page.tsx, followers/page.tsx
修改原因：1) 粉丝/关注列表接口一次性全量返回，大粉丝量账号接口变慢、前端一次渲染全部；2) 个人主页互关判断依赖粉丝列表全量数据，列表分页后会误判关注状态；3) 个人主页 Tab 状态不随 URL 记忆，刷新/分享丢失当前标签
修改内容：1) 后端 getFollowers/getFollowing 增加 page/limit 分页（按关注时间倒序，返回 total/hasMore），新增 GET /users/:username/follow-status 轻量接口返回关注数/粉丝数/是否关注/是否被关注；2) 个人主页互关状态与计数改用 follow-status，与粉丝列表分页解耦；3) 粉丝/关注页改为每页50条 + "加载更多"分页；4) 个人主页 Tab 状态同步到 URL（?tab=posts|media|likes|collections），刷新/分享保留当前标签，收藏 Tab 对非本人自动回退
修改效果：大粉丝量账号粉丝/关注列表分页加载不再卡顿；个人主页关注状态判断准确；Tab 可刷新/分享直达
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：server/src/modules/users/users.controller.ts, posts.controller.ts, posts.service.ts; web/src/app/(main)/profile/[username]/page.tsx, followers/page.tsx, components/collections-tab.tsx, web/src/lib/post-api.ts
修改原因：检查社区个人主页流转逻辑发现多处缺陷——1) 影像库/喜欢列表未排除素材库层级（SNAPSHOT/LOG），与"在路上"口径不一致，素材的媒体却显示在影像库；2) 影像库按 post.createdAt 排序但游标按 media.createdAt 过滤，翻页会重复/遗漏；3) 查看他人粉丝/关注列表时用"被查看者的粉丝"判断互关，导致私信按钮误显示（后端又拦截未互关消息，体验断裂）；4) 收藏夹内容接口无权限校验，私有收藏夹可被越权读取，且帖子无翻页只能看到前20条；5) 帖子计数请求一次拉取100条只为拿 total，浪费带宽
修改内容：1) getUserMedia/getUserLikes 增加 `contentLevel NOT IN ('SNAPSHOT','LOG')` 过滤，与"在路上"口径统一；2) getUserMedia 排序字段改为 media.createdAt 与游标字段一致；3) followers 页面新增"我的粉丝列表"状态，互关判断改为"我关注了他且他在我的粉丝中"；4) getCollectionPosts 增加 auth 身份与私有收藏夹权限校验（非创建者不可读私有内容），后端返回 hasMore，前端收藏夹新增"加载更多"分页；5) 帖子计数请求 limit 100→1
修改效果：个人主页各标签页内容口径一致；影像库翻页稳定无重复；他人粉丝页私信按钮判断准确；私有收藏夹防越权、收藏内容可完整浏览；计数请求轻量化
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：web/src/app/(main)/journeys/page.tsx, server/src/modules/users/users.controller.ts, web/src/app/(main)/profile/[username]/components/posts-tab.tsx
修改原因：1) 我的游记页面查询 level='ESSAY' 但 AI 生成游记是 TRAVELOGUE，导致新游记看不到；2) 个人主页 token 过期时接口静默降级为游客（只返回 PUBLIC 7篇）且不触发前端刷新；3) "在路上"标签按 postType 分类，而内容按 contentLevel 分层，游记/日记混在一起
修改内容：1) journeys/page.tsx 查询层级 ESSAY→TRAVELOGUE；2) users.controller getUserPosts 携带 Authorization 但 token 无效时抛 401 触发前端自动刷新；3) posts-tab 标签改为按 contentLevel 分类（全部/分类/日记/游记），后端 getUserPosts 新增 contentLevel 筛选参数（list+count 同步）
修改效果：我的游记能显示 AI 生成的 TRAVELOGUE；个人主页 token 过期自动刷新后显示完整帖子（sunqi 7→10 篇）；"在路上"标签正确分类（游记在游记、日记在日记）
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：server/src/modules/users/users.controller.ts
修改原因：个人主页帖子数量不对（sunqi 显示 72，包含 62 张闪拍素材+日志），因为 count/list 查询没排除 SNAPSHOT/LOG 这类素材库专属层级
修改内容：getUserPosts 的 list 和 count 查询都加过滤 `contentLevel NOT IN ('SNAPSHOT','LOG')`——这两类是素材库专属（已在素材库展示），不属于个人主页"在路上"的发布内容
修改效果：个人主页帖子数量准确反映已发布的 CLASSIFIED/DIARY/TRAVELOGUE（sunqi 由 72 → 9），与"在路上"标签页展示一致
--------------------------------------------------------------------------------

修改时间：2026-08-06
修改位置：web/src/app/(main)/snap/page.tsx
修改原因：素材库"按地点/按时间/按行程"视图仍是 chips 筛选+直接照片墙，与"全部"视图的集合两级浏览不一致
修改内容：所有视图统一为"集合列表→点开看照片"两级浏览：全部/按时间按天聚合、按地点按地点聚合、按行程按行程聚合；点击集合卡片进入该集合照片墙，顶部"← 全部"返回；移除旧 chips 筛选
修改效果：素材库任何维度都是先看集合（封面+标题+数量）、点开才看照片，交互统一
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：web/src/app/(main)/snap/page.tsx
修改原因：素材库先显示每张照片/照片墙仍不符合"先看集合、再点开看照片"的相册体验——多张照片应聚合为集合，只显示集合，点击集合才显示内部照片
修改内容：素材库"全部"视图改为两级浏览：第一层显示按天聚合的集合列表（封面图+日期+数量，如"今天·62张"），点击集合进入该集合的照片墙，点照片全屏预览；顶部"← 全部"返回集合列表
修改效果：素材库先显示集合而非每张照片，点击集合才展开显示所有照片，符合手机相册的聚合浏览
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：web/src/app/(main)/snap/page.tsx
修改原因：素材库"每张图片单独显示详细卡片"不符合相册合集体验，借鉴手机相册——图片聚合为照片墙、点击全屏预览滑动浏览
修改内容：1) 素材库卡片改为密集照片墙合集（3-4列缩略图，不再每张显示内容/关键词/按钮）；2) 点击照片打开全屏相册预览（黑底大图、左右切换、序号、ESC/方向键、底部"AI写日记"入口）；3) 保留按天/按行程分组与多选
修改效果：素材库像手机相册一样聚合预览所有照片，点击任意一张全屏浏览并滑动切换
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：server/src/modules/posts/ai.service.ts, posts.controller.ts; web/src/lib/snap-api.ts, app/(main)/snap/page.tsx
修改原因：素材库每张闪拍都单独生成日记不符合真实内容创作逻辑——一天拍摄大量照片，应"精选素材→生成一篇内容"，借鉴相册时间线+多选交互
修改内容：1) 后端 ai.service 新增 MULTI_DIARY 任务：N张闪拍→DeepSeek生成一篇日记（复用任务队列+模板回退），保存 DIARY 并关联 sourceSnapIds、复制选中照片媒体；2) 新增 POST /posts/diary/generate-batch 端点；3) 前端素材库新增按天时间线分组（今天/昨天/日期照片墙）与多选模式（勾选→底部操作栏"AI写日记"→进度轮询→保存到我的日记）
修改效果：用户可在素材库按天浏览照片，多选任意几张一键生成一篇真实文风的AI日记（带选中照片），避免逐张生成
--------------------------------------------------------------------------------

修改时间：2026-08-05
修改位置：server/sql/migrate-add-trip.sql（新建）, schema.sql, docker-compose.yml, src/entities/post.entity.ts, modules/sync/sync.service.ts, modules/posts/ai.service.ts, posts.service.ts, posts.controller.ts, scripts/backfill-trips.js（新建）; web/src/lib/snap-api.ts, app/(main)/snap/page.tsx; Android 闪拍App（非本仓库git）
修改原因：闪拍App一天内拍摄的照片同步到社区时行程归属被丢弃（sync只消费moments/reflections，帖子无trip字段），素材库62条SNAPSHOT平铺展示、无"一次旅程"语境，也无法批量升华成内容
修改内容：1) P0行程分组——posts新增trip_id/trip_title字段（migration+entity+docker挂载），sync.service幂等补全行程（originalId已存在仅补全不重建），Android同步携带tripId/tripTitle，素材库新增"按行程"视图（classified/dimensions加byTrip维度）；2) P1行程一键生成游记——新增GET /posts/trips（行程列表含封面）与POST /posts/travelogue/generate-by-trip，素材库行程选中态"AI生成游记"按钮+进度轮询；3) 修复ai.service生成游记不复制媒体（加mediaItems relations）与标题"undefined游记"的||优先级bug；4) 新增backfill-trips.js按连续日期分桶回填历史62条为1段行程
修改效果：素材库按行程分组（62张→1段行程），行程一键生成带62张图片的游记，内容从零散照片自动升华；端到端验证通过
--------------------------------------------------------------------------------

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
