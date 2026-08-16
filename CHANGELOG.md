项目修改记录（最近30条）
================================================================================

修改时间：2026-08-16
修改位置：社区建设实现说明.md
修改原因：文档停留在 2026-07-27 旧版（四层内容体系 + 旧侧边栏），与 8 月以来实际演进严重脱节——内容链条已精简为 3 级（闪拍→日记→游记，移除 CLASSIFIED/LOG）、侧边栏重构为三组并取消"创作/分享见闻"、素材上传降级为全局弹窗、AI 日记/游记生成与闪拍App同步均已上线
修改内容：①整体架构图与实施阶段表更新为三级内容链条，补充素材库/AI生成/闪拍App接入/社群状态；②命名对照表更新（分享见闻移除、找搭子入发现页、旅程→我的游记），侧边栏布局重写为三组 + 管理中心，写作/上传入口统一说明；③内容体系章节重写：数据模型 enum 对齐 SNAPSHOT/DIARY/TRAVELOGUE/ESSAY、新增生成/同步 API、前端页面改为素材库/发现/日记/游记/classified孤儿页；④开发计划更新为三级链条闭环；⑤文件变更清单更新至 V1.3 实际文件；⑥待上线迁移与验证清单更新；⑦后续规划标记 AI游记✅已完成、社群 Phase1-2✅/3部分、推荐P0✅、AR P0/P1✅、消息P1部分；⑧角色权限修正已实现项（个人设置/用户管理/角色分配）；⑨优先级排序与结论更新
修改效果：文档与当前代码状态对齐，可作为后续开发的准确依据
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：系统框架图.md（新增）、.gitignore
修改原因：需用 XMind 绘制系统框架图，先用结构化 Markdown 供 XMind 一键导入生成思维导图；同时 Word 打开总结文档产生的临时锁文件 ~$*.docx 被 auto commit 误提交
修改内容：①新建《系统框架图.md》——按 12 大层组织系统框架与功能（数据采集/数据同步/内容分层/AI生成/社区社交/AR媒体/治理权限/前端应用/后端服务/数据存储/部署运维），供 XMind 导入 Markdown 直接生成思维导图；②.gitignore 增加 Word/Office 临时文件规则（~$*、*.tmp、*.docx~），并从 git 索引移除误提交的 ~$26年7-8月工作总结汇报.docx（保留磁盘文件）
修改效果：系统框架图可用 XMind "文件→导入→Markdown" 一键生成思维导图；Word 临时文件不再被 git 误跟踪
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：2026年7-8月工作总结汇报.md（新增）、2026年7-8月工作总结汇报.docx（新增）
修改原因：需按汇报要求整理 2026年7-8月工作总结（目标导向、结果标准，按"计划任务→完成→测试→问题→方案→需老师支持"闭环组织）
修改内容：撰写《2026年7-8月工作总结汇报》——含目标导向（面向项目/行业/技术前沿/竞争四维度需求）+ 8 大模块成果（闪拍App接入、三级内容链条、AI生成、社区社交、AR媒体、治理权限、架构收敛、线上部署）+ 测试验证（Playwright 9 spec 等）+ 遗留问题 7 类 + 解决方案 + 需老师支持 6 项 + 下一步 4 周计划；用 md_to_docx.py 生成 Word 版
修改效果：Word 版生成成功（44KB，表格/标题/列表样式齐全），可直接用于汇报会议分发；成果均有代码与线上（xuxiake.com HTTP 200）验证支撑
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：server/sql/seed-log-diary-travelogue.sql、server/sql/migrate-content-level.sql、server/sql/migrate-content-hierarchy.sql
修改原因：数据库清理收尾——seed 脚本 @logId/__LOG_ID__ 变量名残留 LOG 命名(实际存闪拍ID)、历史迁移脚本 content_level enum 仍含已废弃的 CLASSIFIED/LOG(会覆盖 schema 新 enum)
修改内容：①seed-log-diary-travelogue.sql 将 @logId→@snapId、__LOG_ID__→__SNAP_ID__，清理条件移除 'LOG'(数据语义与3级链条对齐)；②migrate-content-level.sql 的 MODIFY enum 改为 SNAPSHOT/DIARY/TRAVELOGUE/ESSAY 并更新注释(避免在初始化时把 schema 新 enum 覆盖回含 CLASSIFIED/LOG 的旧值)；③migrate-content-hierarchy.sql(未挂载历史脚本)同步更新 enum 与注释
修改效果：sql 脚本全链路不再有 LOG/CLASSIFIED 引用(仅历史备份 backup_seed_posts_2026-08-06.sql 保留原样作为回滚快照)；docker 初始化枚举定义与实体、schema 完全一致
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：docker-compose.yml、server/sql/schema.sql、seed.sql、seed-snap-diary.sql、seed-snap-u1.sql、cleanup-admin-data.sql、server/src/common/interfaces.ts、server/src/entities/post.entity.ts、server/src/modules/posts/posts.service.ts、posts.controller.ts、ai.service.ts、server/src/modules/users/users.controller.ts
修改原因：数据库审计发现需处理的问题——docker 初始化链路缺失3个迁移(新环境建库即坏)、LOG/CLASSIFIED 在服务层残留(前端已清后端未清)、旧种子复现脏数据、SNAPSHOT 可见性不统一
修改内容：①docker-compose.yml 挂载缺失的 migrate-travelogue-chapters/tips-highlights/soft-delete，移除旧种子 seed-content-classification.sql，种子脚本重编号(23-26)；②后端精简 ContentLevel 类型与 post.entity enum 为 SNAPSHOT/DIARY/TRAVELOGUE/ESSAY(移除 CLASSIFIED/LOG)，删除 GET /logs 路由与 getUserLogs 方法，移除 feed 三个查询分支的 LOG 排除与 users.controller 统计排除、ai.service 的 LOG 判断；③getUserSnaps 补 visibility:'PRIVATE' 过滤(素材库仅显示私有素材)；④seed.sql 移除废弃 CLASSIFIED update 与硬编码 ADMIN/MODERATOR 角色(种子用户保持 USER)；seed-snap-diary/seed-snap-u1 的 SNAPSHOT 可见性 PUBLIC→PRIVATE；⑤schema.sql post_type/content_level enum 与实体对齐；cleanup-admin-data.sql 修 notifications.recipient_id、journeys 按 post_id 联表删除
修改效果：全新 docker 环境可正常初始化(缺迁移补齐、旧脏种子移除、seed 依赖保持)；LOG/CLASSIFIED 从类型/路由/查询彻底移除(ESSAY 散文层级保留)；素材可见性统一为 PRIVATE。后端编译通过，feed 接口200、/logs 已移除返回404
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：server/src/modules/posts/posts.service.ts、server/src/modules/posts/posts.controller.ts、web/src/stores/post-store.ts、web/src/components/feed/feed-list.tsx、web/src/app/(main)/feed/page.tsx、web/src/app/(main)/upload/journey-creator/page.tsx
修改原因：解决遗留的2个P2级问题——①feed首页「随记」混入公开日记（postType=NOTE 同时命中日记与随记，且 feed 页类型筛选tab 定义却未渲染，属隐藏bug）；②手写游记默认可见性(PUBLIC)与AI生成游记(PRIVATE)不一致
修改内容：①后端 getPosts/getTrendingPosts/getHotPosts 三个查询分支新增 excludeContentLevel 参数（`(contentLevel IS NULL OR contentLevel != :excludeLevel)`，保留无层级的普通随记），controller 接收并透传；②前端 post-store PostFilters 增加 excludeContentLevel，feed-list 接收并传给 fetchPosts；③feed 页修复隐藏bug——渲染类型筛选tab（全部/第一视角/随记/游记/瞬间，原定义未渲染），「随记」tab 传 postType=NOTE + excludeContentLevel=DIARY，FeedList 按当前 tab 传参；④journey-creator 手写游记默认可见性从 PUBLIC 改为 PRIVATE，与AI游记统一（发布时再选公开）
修改效果：feed首页显示类型筛选tab，「随记」不再混入公开日记（日记走日记广场）；手写游记默认存为私密、发布时选公开，与AI游记可见性一致。前后端TypeScript编译通过，feed接口(带excludeContentLevel)返回200，页面编译正常
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：web/src/app/(main)/upload/page.tsx（删除）、web/src/components/upload/topic-selector.tsx、community-selector.tsx、draft-list.tsx、publish-preview.tsx、image-cropper.tsx、video-thumbnail-selector.tsx、visibility-control.tsx（删除）
修改原因：用户明确"分享见闻"功能永久移除、后续不再添加；该页面及仅其使用的上传组件已成为孤儿死代码
修改内容：删除分享见闻页 upload/page.tsx 及 7 个孤儿上传组件（topic-selector/community-selector/draft-list/publish-preview/image-cropper/video-thumbnail-selector/visibility-control）；保留 /upload/journey-creator（写游记编辑器）、multi-image-uploader（被 /diaries/new 使用）、snap-upload-dialog（上传弹窗）；清除 .next 缓存后重建
修改效果：分享见闻相关代码完全清理，/upload 目录只剩写游记编辑器；/upload/journey-creator、/diaries/new、/snap 页面编译正常，TypeScript 编译通过（仅剩 e2e 预存错误）
--------------------------------------------------------------------------------

修改时间：2026-08-16
修改位置：web/src/components/layout/sidebar.tsx
修改原因：用户反馈侧边栏"浏览/我的/个人"分组标题与上方分隔线的间距不一致
修改内容："个人"分组容器从 `px-3 pb-3` 改为 `p-3`，与其他分组（浏览/我的/管理中心）统一，标题与分隔线间距一致
修改效果：三个分组标题与其上方分隔线的间距统一为 12px，侧边栏视觉对齐；页面编译正常
--------------------------------------------------------------------------------

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
