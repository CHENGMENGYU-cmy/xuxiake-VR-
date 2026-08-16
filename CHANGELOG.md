项目修改记录（最近30条）
================================================================================

修改时间：2026-08-16
修改位置：web/src/components/layout/sidebar.tsx、web/src/components/upload/snap-upload-dialog.tsx（新建）、web/src/stores/ui-store.ts、web/src/app/(main)/layout.tsx、web/src/app/(main)/snap/page.tsx、web/src/components/layout/navbar.tsx、web/src/components/layout/mobile-nav.tsx、web/src/components/post/post-composer.tsx
修改原因：用户反馈"写作到发布"流转逻辑仍乱——"分享见闻"页有6个上传功能（3创作引导卡片+3内容类型tab），且与App采集、日记/游记创作重复；素材本从App同步进素材库，网页端再设"分享见闻"上传/发布属伪需求。确认后：取消"创作"分组与"分享见闻"独立页面，素材上传降级为素材库内全局工具，写作入口完全收敛到内容页
修改内容：①sidebar.tsx 删除"创作"分组（含"分享见闻"入口），侧边栏变为 浏览/我的/个人 三组；②新建 snap-upload-dialog.tsx 全局"上传素材"弹窗（选择本地文件[图片可多张/视频/语音]→可选文字备注→逐条 uploadXxx 上传→createPost(visibility=PRIVATE, contentLevel=SNAPSHOT)→刷新素材库），ui-store 新增 uploadDialogOpen/openUploadDialog/closeUploadDialog，(main)/layout.tsx 挂载该弹窗；③素材库"上传素材"按钮、顶栏"上传"按钮、移动端底部"发布"→"上传"、feed发布框"+ 更多"/"更多内容" 均改为 openUploadDialog()，不再跳 /upload；④/upload 页保留为孤儿页（无任何导航入口，仅 /upload/journey-creator 子路径仍被游记编辑器使用）
修改效果：写作→发布流转清晰——素材(App同步/上传弹窗)→素材库(私有)；写日记(我的日记页：直接写/AI写)、写游记(我的游记页：手写/AI写)均从内容页进入，无重复入口；"分享见闻"6功能冗余页面取消。TypeScript编译通过（仅剩e2e预存错误），/snap /diaries /journeys 页面编译正常（dev server因OOM重启后验证）
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：web/src/app/(main)/upload/page.tsx、web/src/app/(main)/snap/page.tsx
修改原因：发布-展示流程严重问题修复——①素材"公开/私有"语义矛盾（App同步闪拍私有，/upload发布素材却默认公开且同属SNAPSHOT混进素材库）；②写日记3入口3编辑器（/diaries/new、DiaryComposeDialog、/upload日记tab）体验不一致；③发布后跳转断裂（发布素材跳/feed不跳素材库）；④素材库无上传入口
修改内容：①upload/page.tsx 彻底删除"日记"tab（UploadTab类型/tabContentTypes/initialTab/mood·weather状态/私密日记banner/心情/天气/配图/地点/话题渲染块/发布DIARY分支全部移除），清理SnapPickerDialog/loadRefSnaps/useSearchParams等死代码；②发布素材默认可见性改为PRIVATE（存入素材库），可见性选择处加提示"私密=存入素材库·公开=发布到社区"，发布按钮文案按可见性显示"存入素材库/发布内容"；③发布跳转修正：私密→/snap（提示"已存入素材库"）、公开→/feed（"已发布到社区"）、取消→/snap；④snap/page.tsx 素材库顶部增加"上传素材"按钮(/upload)，空状态增加"去上传素材"引导按钮
修改效果：素材与公开动态语义彻底分离（素材默认私有存素材库，可选公开发布），写日记统一走 /diaries/new + DiaryComposeDialog 引导（删除重复的/upload日记tab），发布后按语义回到内容中心，素材库可直接上传素材，发布-展示链路闭环。TypeScript编译通过（仅剩e2e预存错误），/upload、/snap 等页面均200无编译错误
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：web/src/components/layout/sidebar.tsx、web/src/app/(main)/journeys/page.tsx
修改原因：侧边栏"创作"分组与"我的"分组功能重叠——我的日记/游记在"我的"展示，写游记/AI写游记又出现在"创作"，同一批内容被拆到两处造成混乱；且各内容页内部本已有新建入口，侧边栏写游记/AI写游记属重复入口
修改内容：①sidebar.tsx"创作"分组精简为单一入口"分享见闻"(/upload)，删除重复的"写游记"(/upload/journey-creator)与"AI写游记"(/journeys/generate)，高亮逻辑简化为pathname==='/upload'，清理未使用的Map/Sparkles图标导入；②journeys/page.tsx"我的游记"页顶部补充"AI写游记"按钮(/journeys/generate)，与手写"写游记"并列，保证删除侧边栏入口后写功能完整；③写功能入口收敛到内容页内部——写日记(我的日记页弹窗/素材库顶部)、写游记(我的游记页顶部)、AI写游记(我的游记页/分享见闻引导卡片/素材库多选"生成游记")，均不丢失
修改效果：侧边栏信息架构清晰化为"我的=内容资产 + 创作=唯一发布入口"，写功能从对应内容页直达，消除重复入口与割裂感，TypeScript编译通过（仅剩e2e预存错误）
--------------------------------------------------------------------------------

修改时间：2026-08-14
修改位置：web/types/index.ts、web/lib/snap-api.ts、web/stores/snap-store.ts、web/app/(main)/snap/page.tsx、web/components/diary/snap-picker.tsx、web/components/post/post-card.tsx、web/app/(main)/journeys/[id]/page.tsx、web/app/(main)/my/page.tsx、web/components/layout/sidebar.tsx、web/app/(main)/classified/page.tsx、内容生成逻辑链条.md
修改原因：彻底贯彻3级内容链条（闪拍→日记→游记），全面清理前端残留的LOG层代码和引用
修改内容：①types/index.ts移除LOG类型定义和标签映射；②snap-api.ts删除getUserLogs接口，getAiJob/getTravelogueJob返回类型改为TravelogueJob（修复预存的status类型不匹配编译错误）；③snap-store.ts移除logs/logsLoading/fetchLogs状态和动作；④snap/page.tsx移除LOG合并、日志徽标、fetchLogs调用，loading只依赖snapsLoading；⑤snap-picker.tsx移除LOG合并，只展示闪拍素材；⑥post-card.tsx移除LOG标签配置；⑦journeys/[id]AI来源弹窗sourceLogIds改为sourceSnapIds（"条闪拍素材"）；⑧my/page.tsx"闪拍与日志素材"文案改为"闪拍素材（照片·视频·文字）"；⑨sidebar.tsx移除"日志分类"入口(/classified)及Layers图标引用；⑩设计文档移除"日志分类"侧边栏入口行
修改效果：前端代码完全对齐3级内容链条，无任何LOG层残留引用；/classified页面保留但无导航入口（孤儿死代码）；TypeScript编译通过（仅剩e2e测试预存错误）
--------------------------------------------------------------------------------

修改时间：2026-08-14
修改位置：web/components/layout/sidebar.tsx、web/app/(main)/upload/page.tsx、web/app/(main)/snap/page.tsx
修改原因：侧边栏导航7个问题中的3个待处理项修复（手写游记入口缺失、/upload与创作链条脱节、素材库→游记快捷路径缺失）
修改内容：①侧边栏"创作"区增加"写游记"入口(/upload/journey-creator，Map图标)，与"AI写游记"并列，/upload路由高亮逻辑修正避免误匹配；②/upload页增加3个创作引导卡片（写日记→/diaries/new、写游记→/upload/journey-creator、AI写游记→/journeys/generate），点击直达对应创作入口；③素材库多选底部操作栏增加"生成游记"按钮，将选中素材ID作为ids参数跳转/journeys/generate?ids=...
修改效果：手写游记有独立入口，/upload成为创作hub（分享见闻+日记+游记三种路径），素材库选完素材可直接生成游记，创作链路完整闭环
--------------------------------------------------------------------------------

修改时间：2026-08-14
修改位置：server/sync.service.ts、server/ai.service.ts、server/posts.controller.ts、web/snap-api.ts、web/types/snap.ts、web/stores/snap-store.ts、web/journeys/generate/page.tsx、web/snap/page.tsx、web/components/feed/feed-list.tsx、web/components/layout/sidebar.tsx、server/sql/seed-log-diary-travelogue.sql、内容生成逻辑链条.md、闪拍App改动清单-3级链条重构.md（新建）
修改原因：内容链条中LOG层在真实数据链路中不存在（App不产生LOG数据），AI游记生成器依赖logIds但用户实际选不到LOG；同时闪拍App同步数据缺少手动文字备注字段
修改内容：①内容链条从4级简化为3级：闪拍(SNAPSHOT)→日记(DIARY)→游记(TRAVELOGUE)，去掉LOG层；②后端sync.service.ts支持textNote字段（手动文字备注），优先级textNote>recognizedText，支持纯文字闪拍(TEXT mediaType)；③AI游记生成器从logIds改为snapIds（闪拍素材替代日志作为事实骨架来源），controller/api/store/types全链路同步；④前端游记生成器UI全部"日志"改为"闪拍"，素材选择从getUserLogs改为getUserSnaps；⑤素材库纯文字闪拍改为文字卡片展示（显示内容摘要+地点+日期）；⑥侧边栏增加"日志分类"入口(/classified)；⑦feed空状态"探索发现"按钮从/explore改为/discover修复循环重定向；⑧种子数据9个LOG帖子全部改为SNAPSHOT，游记sourceLogIds改为sourceSnapIds，旧LOG数据已删除；⑨设计文档更新至V1.2；⑩新建Android端改动清单文档
修改效果：内容链条与实际数据流完全对齐，AI游记生成器能正确选择闪拍素材生成游记，闪拍支持照片+视频+文字混合记录，素材库展示区分图片和纯文字内容
--------------------------------------------------------------------------------

修改时间：2026-08-12
修改位置：server/sql/migrate-journey-tips-highlights.sql（新建）、server/entities/journey.entity.ts、server/entities/journey-stop.entity.ts、server/common/interfaces.ts、server/posts.service.ts、server/ai.service.ts、web/types/index.ts、web/journey-creator/page.tsx、web/journeys/[id]/page.tsx、server/sql/seed-log-diary-travelogue.sql
修改原因：游记展示端视觉体验与主流社区差距大，种子数据缺少Journey结构化记录和手写游记样本
修改内容：①数据库：journeys表增tips列，journey_stops表增highlights+tips列；②后端：DTO/Service/AI服务全链路支持新字段，AI提示词增加推荐/贴士输出；③编辑器：每章增加推荐亮点和实用贴士输入，整体旅行贴士字段；④详情页重设计为携程旅拍风格（全屏hero封面+渐变遮罩、AI辅助角标、精简信息仪表盘、大图+横滑画廊、推荐卡/贴士卡）；⑤种子数据：9篇游记全部创建Journey+JourneyStop记录(20个stop全含highlights/tips)，u4/u6改为手写游记(无AI标记)
修改效果：游记详情页融合主流社区视觉体验，编辑器支持推荐亮点和实用贴士，AI生成游记自动填充新字段，种子数据包含AI+手写混合样本
--------------------------------------------------------------------------------

修改时间：2026-08-12
修改位置：web/src/app/(main)/diaries/new/page.tsx
修改原因：日记配图只支持从素材库选择，用户无法上传本地电脑图片
修改内容：配图区域重构为双来源支持：①电脑上传（本地文件→uploadImage API）；②素材库选择（SnapPickerDialog）；图片网格统一管理（封面标记/删除/设封面），两种来源图片可混用；隐藏file input支持多选图片上传
修改效果：写日记时可同时使用本地图片和已上传的拍摄素材作为配图，体验与小红书图文编辑器一致
--------------------------------------------------------------------------------

修改时间：2026-08-12
修改位置：diaries/new/page.tsx、diaries/page.tsx、snap/generate/[id]/page.tsx
修改原因：日记保存按钮401错误无提示、保存后跳转不合理、种子数据mood为中文非枚举值
修改内容：①增加401鉴权过期提示并跳转登录页；②存草稿留页+replace更新URL、私密跳列表、发布跳日记详情页；③草稿点击统一进/diaries/new编辑器；④种子数据mood改为枚举值(calm/happy/excited)并补齐weather/insight/status字段；⑤新增migrate-diary-metadata.sql迁移脚本更新已有数据库
修改效果：保存体验更合理，日记列表正确显示心情天气感悟徽标，种子数据与前端类型完全对齐
--------------------------------------------------------------------------------

修改时间：2026-08-12
修改位置：server/posts.controller.ts、server/posts.service.ts、web/snap-api.ts
修改原因：手写日记和AI日记数据格式不统一，手写缺标题/感悟/心情/天气字段
修改内容：后端 saveDiary 接口扩展 mood/weather 可选参数，前端 saveDiary 类型同步
修改效果：手写日记的心情天气可通过统一API正确保存
--------------------------------------------------------------------------------

修改时间：2026-08-12
修改位置：web/src/app/(main)/diaries/new/page.tsx（新建）
修改原因：手写日记用通用"分享见闻"表单，AI日记用专属页，编辑体验不一致
修改内容：创建 /diaries/new 专属日记编辑器页（卡片式布局：封面图→标题→正文→感悟/心情/天气），支持 ?edit= 编辑和 ?snapIds= 从素材创建
修改效果：手写和AI日记共用同一编辑器，借鉴小红书/简书的沉浸式写作体验
--------------------------------------------------------------------------------

修改时间：2026-08-12
修改位置：diary-compose-dialog.tsx、diaries/page.tsx、diaries/[id]/page.tsx、batch/page.tsx
修改原因：日记创作/编辑入口分散在不同页面（upload/snap/generate），体验碎片化
修改内容：所有"写日记""编辑""继续写"跳转统一指向 /diaries/new；AI批量生成完成后自动跳转新编辑器
修改效果：用户无论从哪个入口写日记，都进入同一个编辑器，体验一致
--------------------------------------------------------------------------------

修改时间：2026-08-08
修改位置：内容生成逻辑链条.docx（新增）
修改原因：内容生成逻辑链条为 Markdown 文档，需生成 Word 版本便于存档/分发
修改内容：用 md_to_docx.py 将《内容生成逻辑链条.md》转换为 Word 文档（复用微软雅黑/Light Grid 表格/居中标题等样式，支持表格/列表/引用/代码块/粗体/行内代码）
修改效果：Word 版生成成功（内容生成逻辑链条.docx，46KB）
--------------------------------------------------------------------------------

修改时间：2026-08-08
修改位置：md_to_docx.py（新增）；线上汇报方案.docx（新增）
修改原因：线上汇报方案为 Markdown 文档，需生成 Word 版本便于会议分发
修改内容：新增通用 md→docx 转换脚本 md_to_docx.py（复用项目 generate_docx.py 样式：微软雅黑/居中标题/Light Grid 表格/代码块浅灰底纹，支持标题/表格/列表/引用/代码块/分隔线/粗体/行内代码），并生成《线上汇报方案.docx》
修改效果：方案 Word 版生成成功（6 表格/123 段/12 标题全部转换），后续任意 md 文档可用 `python md_to_docx.py <input.md> [output.docx]` 转 Word
--------------------------------------------------------------------------------

修改时间：2026-08-08
修改位置：线上汇报方案.md（新增）；CHANGELOG.md
修改原因：需要组织线上会议，各人汇报社区开发工作进展并部署放假后的工作计划
修改内容：撰写《线上汇报方案》——含会议信息/议程/整体进度总览（闪拍采集→同步→分层→AI生成→发布→治理全链路已闭环）；按后端/前端/闪拍App/测试/产品五角色给出进展汇报提纲与遗留问题；部署放假后4周计划（W1推荐P1+社群P3、W2消息P3+推荐P2、W3 AR P2+社群P4、W4图片审核+运营看板+微信分享）及各周负责人/里程碑
修改效果：会议可按方案直接召开，各人进展、节后计划、责任人、截止时间明确；CHANGELOG裁剪至最近30条
--------------------------------------------------------------------------------

修改时间：2026-08-08
修改位置：server/sql/migrate-soft-delete.sql（新增）；server/src/entities/post.entity.ts, modules/posts/posts.service.ts, modules/users/users.controller.ts
修改原因：1) 个人主页帖子数把草稿（vrMetadata.status=draft）也计入，用户删除日记后主页仍显示草稿/残留内容，统计口径与"我的日记"不一致；2) 内容删除为物理删除，不可恢复、无审计；3) 软删与草稿排除条件最初用 JSON_EXTRACT/无括号 OR 写法，SQL 运算符优先级导致 OR 破坏 AND 链（authorId 等条件全部失效），接口返回所有用户帖子
修改内容：1) posts 表新增 deleted_at，删除改为软删除（deletePost 置 deleted_at，可恢复）；2) 所有 posts 读查询统一过滤 deleted_at IS NULL（feed/详情/层级/用户列表/日记/游记/闪拍/日志/合集/维度统计/行程等）；3) getUserPosts 统计/列表口径排除草稿与软删，草稿排除用 LIKE 匹配 '"status":"draft"' 并加括号包裹（修复 OR 破坏 AND 链问题）
修改效果：帖子数只统计有效内容（排除草稿/软删/闪拍日志素材）；删除日记后个人主页即时同步；软删可恢复、数据可审计；接口与 UI 验证通过（sunqi 帖子数 7 = 4 日记非草稿 + 3 游记，日记筛选不再出现草稿，软删后 getPostById 404、列表剔除）
--------------------------------------------------------------------------------

修改时间：2026-08-08
修改位置：web/src/app/(main)/upload/journey-creator/page.tsx
修改原因：章节式游记编辑器的「出行方式」「旅行主题」用固定选项下拉框，而 AI 生成（或自由填写）的游记这两个字段是自由文本（如"市内公交与步行""美食探店与城市光影随笔"），不在固定选项内——编辑游记时下拉框无法选中、回填显示为空，用户以为内容丢失
修改内容：出行方式/主题由 select 改为 datalist 自由输入（input + datalist 建议项）：可下拉选择常见选项，也可手动输入任意文本；AI 生成的自由文本编辑回填时能正确显示并可修改
修改效果：编辑 AI 生成的游记时，出行方式/主题能正确回填显示；Playwright 验证 fde24594（长沙游记）编辑页全字段回填完整（标题/导语/目的地/出行方式/主题/结尾/Day 章节含多图/封面）
--------------------------------------------------------------------------------

修改时间：2026-08-08
修改位置：server/src/entities/journey.entity.ts, journey-stop.entity.ts（新增 journey-stop-media.entity.ts）；server/src/modules/posts/posts.service.ts, ai.service.ts, posts.module.ts, common/interfaces.ts；server/sql/migrate-travelogue-chapters.sql（新增）；web/src/app/(main)/upload/journey-creator/page.tsx（重构）, journeys/generate/page.tsx, journeys/[id]/page.tsx, journeys/page.tsx；web/src/types/index.ts, lib/post-api.ts
修改原因：原有"写游记"两个割裂实现均不完整——手写是"表单式"（正文与行程站点分离、站点仅单图，写不出图文并茂的游记）；AI 生成产物是纯文本 Markdown、无 Journey 结构（无封面/信息卡/站点）；两条链路产物形态不一致，且 updatePost 编辑时只更新 content、不更新 journey 结构。对照《内容生成逻辑链条》（闪拍→日志/日记→游记）与真实游记形式（公众号/马蜂窝图文叙事章节式），需统一升级
修改内容：1) 手写编辑器重构为「图文叙事章节式」：标题+封面+导语+信息卡（目的地/日期/出行方式/人均/主题）+ 按天章节（每章 日期+地点+正文+多图，支持本地上传/从素材库选图）+ 结尾感悟；2) AI 游记生成升级为结构化：后端按素材日期分天生成章节、自动配图、生成标题/导语/信息卡/结尾感悟，创建 Journey+stops+stop_media，生成后落回同款章节式编辑器继续手改再发布；3) 后端数据模型：journeys 扩展 summary/transport/budget/theme/insight，journey_stops 加 day_date，新增 journey_stop_media 多图表（迁移 migrate-travelogue-chapters.sql）；4) updatePost 支持整体更新 journey 结构（先删旧再重建）；5) 详情页图文叙事渲染（封面+导语+信息卡+Day 章节图墙+结尾感悟），列表页卡片显示封面+标题+目的地/天数徽标；6) 手写与 AI 统一 contentLevel=TRAVELOGUE，getContentHierarchy 对 TRAVELOGUE 兼容 ESSAY（旧数据可见）
修改效果：手写与 AI 都能产出"图文交织、按天分章节、带信息卡与结尾感悟"的完整游记，且在同一编辑器内统一编辑发布；编辑游记时结构与正文一并更新；详情/列表展示与真实游记一致；接口层（createPost/getById/updatePost）+ AI 结构化生成 + Playwright 全链路（手写→发布→详情渲染→编辑回填→列表显示）验证通过
--------------------------------------------------------------------------------

修改时间：2026-08-07
修改位置：web/src/app/(main)/snap/page.tsx
修改原因：素材库「按行程」视图的"AI 生成游记"入口违背《内容生成逻辑链条》（闪拍→日志/日记→游记），把行程内全部 SNAPSHOT 直接生成游记、缺失"日志事实+日记情感"归集；且与 /journeys/generate（选日志+日记→游记）功能重复、能力更弱（参数硬编码、无素材选择、无结果预览、状态残留、轮询泄漏）
修改内容：删除素材库按行程「AI 生成游记」入口——移除 startTripGeneration 内联逻辑与 setInterval 轮询、tripGen* 状态、"已选行程+AI 生成游记"UI 条；清理不再使用的 generateTravelogueByTrip/getTravelogueJob/useRouter/toast/Sparkles 等引用；后端 generate-by-trip 接口保留不动，snap-api.ts 同步保留
修改效果：素材库专注「闪拍→日记」，游记统一从「我的日记→升华为游记」与 /journeys/generate 生成，链路清晰、无重复入口；消除状态残留与轮询泄漏隐患；Playwright 验证通过（按行程不再出现 AI 生成游记按钮、照片墙/多选/写日记正常；日记→升华为游记→生成→保存私密→我的游记全链路）
--------------------------------------------------------------------------------

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

