-- ============================================================
-- 日志 / 日记 / 游记 种子数据
-- 仅普通用户 (role='USER')，不含管理员
-- 每个普通用户：1条LOG(私人日志) + 1条DIARY(可发日记) + 1条TRAVELOGUE(AI游记)
-- ============================================================

USE xuxiake;
SET NAMES utf8mb4;

-- 清除旧的日志/日记/游记种子数据（u2-u10，本文件插入的普通用户）
DELETE FROM posts
WHERE author_id IN ('u2','u3','u4','u5','u6','u7','u8','u9','u10')
  AND content_level IN ('LOG','DIARY','TRAVELOGUE');
-- 清理本文件产生的游记话题关联
DELETE FROM post_topics
WHERE post_id IN (SELECT id FROM posts WHERE content_level = 'TRAVELOGUE');

-- ============================================================
-- u2 张三 (VR摄影师, 北京) — 漓江光影
-- ============================================================
SET @userId = 'u2';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年8月4日，阳朔兴坪镇。凌晨4:30到达拍摄点，架设Insta360 X4。5:12日出开始，晨雾从江面升起，喀斯特山峰在金色光线中渐次显现。拍摄持续到19:30日落，共拍摄14组延时素材。天气晴朗，气温34°C，湿度偏高。同行：无。设备电量消耗3块电池。',
 NULL, '阳朔兴坪镇漓江边',
 '{"keywords":["漓江","延时摄影","日出","日落","喀斯特"],"weather":"晴","activity":"摄影","companion":"独自"}',
 'PRIVATE', 0, 0, 0, '2026-08-04 20:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '在漓江边站了15个小时，从漆黑等到漆黑。最美的其实是日出前那二十分钟——天空从深蓝变成浅紫，再变成橘红，整个过程安静得只听得见快门声和水流声。\n\n有时候觉得，摄影教会我的不是怎么拍好一张照片，而是怎么等待。很多东西急不来，光不会因为你着急就提前亮起来。\n\n今天拍了三千多张，最后可能只选十张。但这种"浪费"让我觉得奢侈而幸福。',
 '在漓江边等光的人', '阳朔兴坪镇',
 '{"keywords":["漓江","等待","摄影哲学","独处","光影"],"mood":"calm","weather":"sunny","insight":"摄影教会我的不是怎么拍好一张照片，而是怎么等待。","style":"诗意散文风","status":"public","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-04 21:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 漓江光影日记：从日出到日落的十二小时\n\n## 出发\n\n去漓江拍延时，是计划了很久的事。桂林山水在VR镜头里会是什么样子？我想知道当喀斯特山峰遇到360度全景，是不是能让人真的"站在"漓江边。\n\n凌晨四点出发，兴坪镇还在沉睡，只有江面的雾气醒着。\n\n## 等待光\n\n架好设备的时候天还是黑的。第一缕光在5点12分出现——不是太阳，是天空开始变颜色。深蓝、浅紫、橘红，整个过程像有人在头顶慢慢拉开一块画布。\n\n喀斯特山峰的轮廓从黑暗中浮现，江面开始反射天光。那一刻我突然明白了，为什么古人说"桂林山水甲天下"——不是因为山有多高水有多深，而是因为这里的山水组合，恰好击中了人对"美"最原始的感知。\n\n## 十二小时的凝视\n\n从日出到日落，我用Insta360 X4记录了14组延时序列。中午的阳光太硬，不适合拍摄，我就坐在江边的石头上，看来往的竹筏和游客。\n\n一个撑竹筏的老人经过，问我拍了多久。我说从凌晨开始。他笑了笑说："你们拍照片的人，比我们划船的还有耐心。"\n\n我想他说得对。摄影和旅行一样，最美的部分不在目的地，在路上。\n\n## 入夜\n\n太阳落山后，我收拾设备准备离开。江面恢复了平静，山峰重新变成剪影。我回头看了一眼，心想：今天的光，我会记得很久。\n\n> 旅行提示：阳朔兴坪镇是拍摄漓江日出的最佳位置，建议住在兴坪古镇，步行到江边约15分钟。夏季日出时间约5:10-5:30，需提前到达。',
 '漓江光影日记：从日出到日落的十二小时', '阳朔兴坪镇',
 '{"keywords":["漓江","阳朔","延时摄影","日出","桂林山水","旅行摄影"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"根据今天的拍摄日志和心情日记，写一篇漓江光影旅行游记，包含实用旅行提示","style":"诗意散文风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-04 22:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u3 李四 (科技博主, 广东) — 西湖VR测评
-- ============================================================
SET @userId = 'u3';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年8月3日，杭州西湖断桥。测试新VR相机的空间视频拍摄能力。拍摄参数：4K/60fps，VR180模式，白平衡自动，ISO 100-800。拍摄对象：断桥、白堤、雷峰塔远景、湖面倒影、游客动态。设备温度正常，未出现过热警告。视频文件共28GB。下午在湖滨路咖啡馆对比了前三代设备的画质表现，暗部细节提升明显。',
 NULL, '杭州西湖断桥',
 '{"keywords":["VR相机","测评","西湖","空间视频","画质对比"],"weather":"多云转晴","activity":"设备测评","companion":"独自"}',
 'PRIVATE', 0, 0, 0, '2026-08-03 19:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '拿着新设备在西湖边走了一圈，突然想起六年前第一次来西湖——那时候拿的还是手机，拍了张糊掉的断桥。\n\n六年过去，设备从手机变成了VR相机，从平面变成了360度。但站在断桥上的那种感觉没变。科技一直在进步，但西湖还是那个西湖，断桥还是那个断桥。\n\n可能这就是科技的意义吧——不是替代真实的体验，而是让没来过的人，也能感受到那一刻的风和光。',
 '用最新的设备，拍最老的风景', '杭州西湖',
 '{"keywords":["西湖","科技","时间","断桥","VR"],"mood":"calm","weather":"cloudy","insight":"科技一直在进步，但西湖还是那个西湖。","style":"成长复盘风","status":"public","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-03 20:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 西湖边上的一场VR革命：当千年湖山撞上最新科技\n\n## 为什么选西湖？\n\n做VR相机测评，选景很重要。西湖有山有水有建筑有倒影，自然光和阴影交错，是测试HDR和暗部细节的最佳场地。而断桥——一个被拍了无数次的地方——恰恰是检验VR能不能让人看到"不一样"的最佳场景。\n\n## 拍摄体验\n\n这次带的是最新款VR180相机，4K/60fps。在断桥上拍了四十分钟：全景、特写、人像、风景。最惊喜的是暗部表现——荷叶下面的阴影区域，上一代设备会一片死黑，这一代能看清水面的纹理。\n\n从白堤走到雷峰塔，一路走一路拍。自动白平衡在树荫和阳光之间切换很快，没有明显的色温漂移。唯一的小遗憾是逆光场景下高光溢出稍多，后期需要压一下。\n\n## 在西湖边想到的\n\n六年前我第一次来西湖，用手机拍了张断桥。那张照片后来换了三次手机也没舍得删——不是因为画质好，而是因为那一刻的风、温度、心情都和像素一起被保存了下来。\n\n现在用VR拍西湖，本质上做的是一样的事：让一个瞬间被记住。只不过这一次，我想让看的人不只是看到断桥，而是"站在"断桥上看西湖。\n\n> 拍摄建议：西湖断桥上午9点前光线最佳，白堤一侧可以拍到雷峰塔远景。VR拍摄建议使用三脚架，保持水平，避免后期拼接错位。',
 '当千年湖山撞上最新科技：西湖VR拍摄手记', '杭州西湖',
 '{"keywords":["VR测评","西湖","空间视频","摄影技巧","科技人文"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合设备测评日志和个人感悟日记，写一篇西湖VR拍摄游记，包含设备体验和拍摄建议","style":"成长复盘风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-03 21:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u4 王五 (环球旅行者, 四川) — 稻城亚丁
-- ============================================================
SET @userId = 'u4';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年8月2日，稻城亚丁景区。徒步路线：游客中心→冲古寺→洛绒牛场→牛奶海→五色海，全程18公里，海拔从3900米爬升到4700米。用时8.5小时。天气：上午晴，午后转多云，14:00开始下小雨。三神山（仙乃日、央迈勇、夏诺多吉）均有可见。牛奶海水色碧蓝，五色海因光线不足色彩不太明显。高反轻微，服用了红景天。',
 NULL, '稻城亚丁景区',
 '{"keywords":["稻城亚丁","徒步","高海拔","三神山","牛奶海"],"weather":"晴转小雨","activity":"高海拔徒步","companion":"独自"}',
 'PRIVATE', 0, 0, 0, '2026-08-02 21:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '在海拔4700米的五色海边，我突然理解了什么叫做"身体在地狱，眼睛在天堂"。\n\n走最后一段爬升的时候，每走十步就要停下来喘气。但一抬头，仙乃日雪山的山尖就在云层中若隐若现，像在说：快到了，再坚持一下。\n\n到了牛奶海的那一刻，我坐在石头上一句话都说不出来。那个蓝色——不是天蓝也不是海蓝，是只有在高原冰川融水里才能看到的碧蓝。我拿起VR相机，又放下。有些画面，镜头装不下。',
 '在4700米的高原上，我学会了呼吸', '稻城亚丁牛奶海',
 '{"keywords":["高海拔","牛奶海","坚持","震撼","自然之美"],"mood":"excited","weather":"rainy","insight":"有些画面，镜头装不下。","style":"温柔治愈风","status":"public","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-02 22:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 稻城亚丁：身体的地狱，眼睛的天堂\n\n## 为什么一定要去稻城亚丁？\n\n如果有人问"中国最美的徒步路线在哪里"，稻城亚丁一定在前三名。三座神山环绕的高原盆地，海拔从3900到4700米，沿途有冰川、湖泊、草甸、森林，景观密度极高。\n\n但这里也是出了名的"体力绞肉机"——全程18公里，高海拔爬升800米，对体能和意志力都是巨大考验。\n\n## 徒步全记录\n\n### 第一段：游客中心→冲古寺（轻松开局）\n\n这段有电瓶车可以坐，但我选择步行适应海拔。沿途是茂密的高山松林，空气里带着松香。冲古寺很小，但位置绝佳——正对仙乃日雪山，是拍摄第一组VR全景的最佳点位。\n\n### 第二段：冲古寺→洛绒牛场（精华段）\n\n从冲古寺步行三公里到洛绒牛场，沿途是开阔的草甸和溪流。三座神山会轮流出现在视野里，每转一个弯就是不一样的构图。这里也是野生动物的天堂，我看到了藏羚羊和土拨鼠。\n\n### 第三段：洛绒牛场→牛奶海（魔鬼爬升）\n\n这是全程最难的一段。从4200米到4500米，坡度陡、氧气少。我每走十步就要停下来深呼吸。路上遇到一个藏族大叔，他跟我说："慢慢走，山不会跑的。"这句话给了我很大的安慰。\n\n### 终点：牛奶海和五色海\n\n牛奶海的水色是饱和度极高的碧蓝，据说是冰川融水中富含矿物质导致的。我在湖边坐了很久，拍了很多VR素材——但说实话，VR也拍不出身临其境的那种震撼。\n\n五色海因为下午光线不足，五种颜色不太明显。但站在4700米的高度俯瞰整个山谷，那种"渺小而幸运"的感觉，是任何设备都拍不出来的。\n\n> 实用提示：①必须提前一天到稻城县城适应海拔；②带足氧气瓶，每人至少2罐；③牛奶海最佳拍摄时间是上午11点前，午后容易起云；④高原天气多变，备好雨衣和冲锋衣。',
 '稻城亚丁徒步全记录：在4700米与自己对话', '稻城亚丁景区',
 '{"keywords":["稻城亚丁","徒步攻略","牛奶海","高原旅行","VR全景"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合徒步日志和心情日记，写一篇稻城亚丁深度游记，包含分段路线描述和实用旅行提示","style":"温柔治愈风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-02 23:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u5 赵六 (户外教练, 云南) — 哈巴雪山登顶
-- ============================================================
SET @userId = 'u5';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年8月1日，哈巴雪山登顶日。凌晨3:00从大本营（4100m）出发，6:48登顶（5396m）。天气：晴朗无风，气温-8°C，能见度极佳。登顶用时3小时48分。同行客户3人，均成功登顶。使用了冰爪、冰镐、安全带等技术装备。雪线以上约500米，冰裂缝较往年偏少。拍摄了登顶360°全景VR。下撤用时2.5小时，15:00返回哈巴村。',
 NULL, '哈巴雪山',
 '{"keywords":["哈巴雪山","登顶","5396米","雪山攀登","向导"],"weather":"晴","activity":"雪山攀登","companion":"带客户3人"}',
 'PRIVATE', 0, 0, 0, '2026-08-01 18:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '这是我的第23次哈巴登顶，但这次不太一样。\n\n以前登顶都是一个人或者带老手，这次带的是三个第一次爬雪山的客户。看到他们站在5396米的那一刻，眼睛里的光芒比我第一次登顶的时候还要亮。\n\n有个客户在峰顶哭了。她说从来没有想过自己能站在这个高度。我递了杯热水给她，说："山一直都在，是你选择了来。"\n\n带人看世界——这可能比我自己看世界，更有意义。',
 '带他们站在5396米，比我自己登顶更骄傲', '哈巴雪山',
 '{"keywords":["登顶","客户","向导","成就感","雪山"],"mood":"骄傲而感动","style":"成长复盘风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-01 19:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 哈巴雪山：一座"入门级"雪山的不入门体验\n\n## 哈巴雪山是什么水平？\n\n很多人说哈巴是"入门级雪山"，但我要纠正一下——哈巴只是"技术难度入门"，但海拔和体能要求一点也不入门。5396米的海拔，从大本营到峰顶需要爬升近1300米，在-8°C的凌晨连续攀登近4小时。\n\n## 登顶日记\n\n凌晨3点出发，头灯的光束在雪地上画出一条路。星空极亮，银河清晰可见——这是城市里永远看不到的。\n\n走了大约一个小时后，第一个客户出现了轻度高反。我让她放慢节奏，按照"走十步歇一口"的频率来。在高海拔登山，比的不是谁快，而是谁能保持自己的节奏。\n\n天亮的时候我们刚好到达雪线。太阳从云海中升起，把整片雪地染成了金色。这是哈巴最美的时刻，也是我第23次看这个画面——但每次都不一样。\n\n6点48分，全队登顶。站在5396米俯瞰云海，玉龙雪山在远处若隐若现。有个客户拿出手机想拍照，我说别急，先用眼睛看三十秒，再拿设备。\n\n## 山教会我的事\n\n做户外教练十年，带过几百人登山。最大的感触是：山不会因为你厉害就对你客气，也不会因为你菜就不让你上。它只认一件事——你愿不愿意一步一步走。\n\n> 登顶攻略：①哈巴村出发→大本营（骑马/徒步4-5小时）→凌晨出发冲顶→下撤；②必备装备：高山靴、冰爪、冰镐、安全带、头盔、头灯、羽绒服；③最佳季节：4-6月和9-11月；④必须请向导，不要独自攀登。',
 '第23次站在哈巴之巅：一座入门雪山的不入门哲学', '哈巴雪山',
 '{"keywords":["哈巴雪山","登顶攻略","雪山攀登","向导经验","5396米"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合登顶技术日志和带队感悟日记，写一篇哈巴雪山深度攀登游记，包含攻略和人文感悟","style":"成长复盘风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-01 20:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u6 孙七 (美食博主, 湖南) — 长沙美食探索
-- ============================================================
SET @userId = 'u6';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年7月31日，长沙。探店路线：火宫殿（早餐）→ 太平街（小吃）→ 坡子街（午餐）→ 文和友（晚餐）。打卡菜品：臭豆腐（黑色经典）、糖油粑粑、口味虾、剁椒鱼头、茶颜悦色（幽兰拿铁）。共拍摄美食VR近景素材47组。花费：交通15元+餐饮286元。口味评价：臭豆腐外酥里嫩8.5分，口味虾辣度适中但虾肉偏老7分，剁椒鱼头鲜辣平衡9分。',
 NULL, '长沙火宫殿/太平街/文和友',
 '{"keywords":["长沙","美食探店","臭豆腐","口味虾","湘菜"],"activity":"美食探店","companion":"独自","spend":301}',
 'PRIVATE', 0, 0, 0, '2026-07-31 22:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '今天在太平街吃臭豆腐的时候，旁边坐着一个老奶奶带着孙子。小朋友咬了一口被辣得直吐舌头，老奶奶笑着说："慢慢吃，辣味是要品的，不是要躲的。"\n\n突然觉得这句话很对。长沙的食物是"凶"的——辣椒、花椒、蒜，每一口都像在挑战你的味蕾。但正是这种"凶"，让人吃完之后全身发热，觉得活着真好。\n\n湘菜教我的事：生活要够味，辣一点没关系。',
 '长沙教会我：辣一点没关系', '长沙太平街',
 '{"keywords":["长沙美食","辣","人生哲学","湘菜","市井烟火"],"mood":"热辣而温暖","style":"轻松口语风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-31 23:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 24小时吃遍长沙：一个美食博主的火辣日记\n\n## 长沙，一座为吃而生的城市\n\n如果说成都是"来了就不想走"，那长沙就是"来了就一直在吃"。从早上的臭豆腐到凌晨的小龙虾，这座城市的美食密度高得离谱。\n\n## 早餐：火宫殿（8:00-9:30）\n\n火宫殿与其说是餐厅，不如说是一个美食博物馆。早上八点就开始热闹，蒸笼冒着白气，空气里是辣椒和蒜的混合香味。\n\n必点：臭豆腐（黑色经典，外酥里嫩，配萝卜干绝了）、糖油粑粑（甜糯但不腻）、姊妹团子（猪肉和糖馅两种口味）。\n\n## 上午：太平街小吃之旅（10:00-12:00）\n\n太平街是长沙最有烟火气的地方。青石板路两边全是小吃摊，从街头走到街尾，嘴巴停不下来。\n\n强烈推荐：文和友老长沙大香肠（肉感十足）、刮凉粉（夏天吃太清爽了）、紫苏桃子姜（非常特别的风味组合）。\n\n## 午餐：坡子街剁椒鱼头（12:30-14:00）\n\n来长沙必须吃一顿正宗的剁椒鱼头。我选的是坡子街的一家老店——鱼头用的是胖头鱼，肉质嫩滑；剁椒是店家自己腌的，鲜辣不呛。鱼头上的肉蘸着汤汁吃，辣得恰到好处，米饭直接干掉了两碗。\n\n## 晚餐：文和友（18:00-20:00）\n\n文和友已经不只是一家餐厅，它是一个"老长沙"的沉浸式体验空间。六层楼高的复古街景，走进去像穿越回了八十年代。\n\n口味虾是招牌——虾的个头很大，蒜蓉口味比麻辣的更对我胃口。但说实话虾肉偏老了一点，可能今天批次的问题。\n\n## 在辣椒里悟出的人生\n\n坐在太平街吃臭豆腐的时候，旁边的老奶奶说了一句话让我记到现在："辣味是要品的，不是要躲的。"\n\n长沙的美食就是这样——它的辣不是要折磨你，是要你在冒汗和吸气的间隙里，尝到食材本身的鲜。生活也一样，该辣的时候别躲，辣过之后才会觉得：原来也没那么难。\n\n> 美食地图：火宫殿（天心区坡子街）→ 太平街（步行5分钟）→ 坡子街（步行10分钟）→ 文和友（打车15分钟至海信广场）。一天预算约300-400元。建议避开节假日，排队真的很恐怖。',
 '24小时吃遍长沙：从臭豆腐到剁椒鱼头的火辣之旅', '长沙市',
 '{"keywords":["长沙美食","探店攻略","臭豆腐","剁椒鱼头","文和友","湘菜"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合美食探店日志和美食感悟日记，写一篇长沙24小时美食游记，包含具体餐厅推荐和路线","style":"轻松口语风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-08-01 00:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u7 周八 (建筑师, 上海) — 苏州园林
-- ============================================================
SET @userId = 'u7';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年7月30日，苏州拙政园+留园。考察目的：研究古典园林的空间叙事手法对VR空间设计的启发。拙政园：游览3小时，测绘主要观景点12处，重点记录"借景"手法——北寺塔的框景、远香堂的对景。留园：游览2小时，重点记录"步移景异"的动线设计——每走几步就有新的构图出现。拍摄VR360参考素材86组。天气：阴有小雨，反而增加了园林的意境。',
 NULL, '苏州拙政园/留园',
 '{"keywords":["苏州园林","拙政园","留园","空间设计","建筑考察"],"weather":"阴雨","activity":"建筑考察","companion":"独自"}',
 'PRIVATE', 0, 0, 0, '2026-07-30 19:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '在拙政园的远香堂坐了一个小时，看雨滴落在荷叶上，滚一圈又滑进池塘。\n\n做了十年建筑设计，第一次真正理解了"移步换景"不是设计手法，是一种世界观。造园的人相信，美不是一下子全部给你的，而是让你一步步发现。每扇窗是一个取景框，每个拐角是一个新的开始。\n\n这让我想到做VR空间设计——好的VR体验也不应该一下子把所有东西都给你，而应该让你在移动中发现。古典园林里，藏着最好的UX设计。',
 '拙政园教会我的事：美是让你一步步发现的', '苏州拙政园',
 '{"keywords":["园林","空间哲学","建筑","VR设计","借景"],"mood":"启发性平静","style":"诗意散文风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-30 20:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 在苏州园林里，我找到了VR设计的终极答案\n\n## 一个建筑师为什么要去园林？\n\n苏州园林我来了不止一次。但这次不一样——我是带着VR眼镜来的。我想知道，五百年前的造园师和今天的VR设计师，是不是在解决同一个问题：如何在有限的空间里，创造无限的体验？\n\n## 拙政园：空间的魔术\n\n拙政园占地约52亩，不算特别大，但走进去会觉得它有无穷无尽的空间。为什么？\n\n因为造园师用了三个"魔术"：\n\n**第一，借景。**从远香堂看出去，北寺塔刚好被框在一扇花窗里——但北寺塔其实在园子外面一公里处。造园师把远处的塔"借"了进来，成为园中的一景。这在VR里就是"环境贴图"和"远景层次感"。\n\n**第二，遮挡。**拙政园没有一条路是直的。每走几步就有假山、廊桥、树木挡住视线，然后绕过障碍，新的画面突然展开。这在VR里就是"渐进式加载"——不要一次性展示所有内容，让用户自己探索。\n\n**第三，框景。**园中几乎每一扇窗都是一个"画框"，窗外的景色被精心构图。这在VR里就是"引导线"和"焦点设计"。\n\n## 留园：步步生景\n\n留园比拙政园小，但"步移景异"的手法用得更极致。从入口到主厅，短短50米的路，我走了40分钟——因为每走三五步，空间就变一个样。\n\n最妙的是"冠云峰"——一块太湖石，从不同角度看，形态完全不同。正面看像一位老者，侧面看像一座山峰。造园师没有告诉你"应该怎么看"，而是让你自己发现。\n\n## 园林给VR的启示\n\n回来的路上我一直在想：VR空间设计和园林设计，本质上都是"体验设计"。目标不是堆砌内容，而是引导用户在一个有限的空间里，产生"无限"的感觉。\n\n五百年前的匠人没有VR眼镜，但他们比我们更懂什么是"沉浸式体验"。\n\n> 游览建议：拙政园建议上午9点前入园避开人流，留园建议下午去光线更佳。两园相距约3公里，可步行+公交。建议请导游或者租讲解器，否则很多设计细节会错过。',
 '五百年了，苏州园林依然是沉浸式体验的最好教科书', '苏州拙政园/留园',
 '{"keywords":["苏州园林","建筑考察","VR空间设计","借景","沉浸式体验"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合建筑考察日志和园林感悟日记，写一篇从VR设计师视角解读苏州园林的游记","style":"诗意散文风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-30 21:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u8 吴九 (潜水教练, 海南) — 三亚蜈支洲岛
-- ============================================================
SET @userId = 'u8';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年7月29日，三亚蜈支洲岛。潜水日志：第一潜9:30，潜点"情人桥"，水深18米，水温27°C，能见度15米，潜水时间42分钟。第二潜11:45，潜点"珊瑚花园"，水深22米，水温26°C，能见度12米，潜水时间38分钟。观察到：鹿角珊瑚群、小丑鱼、海龟1只、鳐鱼2条。水下VR拍摄设备：防水壳+Insta360 X4，共拍摄水下VR素材32分钟。',
 NULL, '三亚蜈支洲岛',
 '{"keywords":["潜水","蜈支洲岛","珊瑚","水下摄影","VR"],"weather":"晴","water_temp":"27°C","visibility":"15米","activity":"潜水"}',
 'PRIVATE', 0, 0, 0, '2026-07-29 18:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '水下20米的世界是安静的。除了一呼一吸的气泡声，什么都没有。\n\n那只海龟从珊瑚礁后面游出来的时候，我们在水中对视了几秒。它的眼神很平静，像是在说："你又来了啊。"\n\n每次潜入海里，我都觉得陆地上的那些焦虑和烦恼变得很轻。不是消失了，而是——当你在一个比足球场还大的珊瑚礁面前，你会意识到自己多渺小，而世界多大。\n\n这是大海每次给我的礼物：放小自己，烦恼就小了。',
 '海龟看了我一眼，然后慢悠悠地游走了', '三亚蜈支洲岛',
 '{"keywords":["潜水","海龟","宁静","大海","渺小"],"mood":"宁静而开阔","style":"温柔治愈风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-29 19:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 潜入蜈支洲岛：在20米深的海底，我找到了真正的宁静\n\n## 为什么是蜈支洲岛？\n\n海南不缺潜水点，但蜈支洲岛是公认的"中国最佳潜水地"之一。这里水质清澈，珊瑚保育良好，最重要的是——海洋生物种类非常多。对于水下VR拍摄来说，丰富的前景和生动的海洋生物是绝佳素材。\n\n## 第一潜：情人桥（9:30-10:12）\n\n入水的那一刻，27°C的海水包裹全身，所有噪音瞬间消失。下潜到约15米的时候，第一片鹿角珊瑚群出现了——密密麻麻的珊瑚枝像一片水下森林，小丑鱼在枝丫间钻进钻出。\n\nVR相机在水下的表现出乎意料地好。防水壳没有影响拼接画质，360度的画面里，珊瑚、鱼群、从海面透下来的光束同时被记录下来。\n\n## 第二潜：珊瑚花园（11:45-12:23）\n\n这是我最喜欢的潜点。一片巨大的珊瑚礁从海底拔地而起，上面覆盖着各种颜色的软珊瑚和海葵。\n\n在水下待了大约20分钟后，一只海龟出现了。它从珊瑚礁后面慢悠悠地游出来，看了我一眼，然后朝着更深的海域游去。我用VR相机拍下了这个瞬间——虽然可能距离有点远，但那个画面太珍贵了。\n\n后来又看到两条鳐鱼，贴着海底滑行，姿态优雅得不像话。\n\n## 大海教我的事\n\n在水下的时候，你不能说话，不能刷手机，不能想今天还有什么任务没完成。你只能呼吸，只能看，只能存在于那一刻。\n\n这种"被迫的专注"，是陆地上永远体验不到的。\n\n> 潜水攻略：①蜈支洲岛潜水需提前一天预约；②初学者可以选择体验潜水（6-8米），不需潜水证；③水下拍摄建议使用红色滤镜矫正色差；④最佳潜水季节：4-10月，水温适宜能见度高；⑤注意保护珊瑚，不要触碰海洋生物。',
 '蔚蓝之下：蜈支洲岛潜水日记', '三亚蜈支洲岛',
 '{"keywords":["潜水攻略","蜈支洲岛","水下VR","珊瑚礁","海龟"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合潜水技术日志和海底感悟日记，写一篇蜈支洲岛潜水游记，包含潜水攻略和海洋保护意识","style":"温柔治愈风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-29 20:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u9 郑十 (历史教师, 陕西) — 兵马俑
-- ============================================================
SET @userId = 'u9';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年7月28日，西安秦始皇兵马俑博物馆。参观路线：一号坑→三号坑→二号坑→文物陈列厅。一号坑：东西长230米，宽62米，约有6000个陶俑，已修复约1000余件。重点观察了兵俑的面部细节——每个俑的面部表情和发髻都不同，印证了"千人千面"的说法。拍摄VR近景素材重点：铠甲纹理、发髻结构、排列阵型。三号坑较小但有指挥车，二号坑有彩色陶俑遗迹。',
 NULL, '秦始皇兵马俑博物馆',
 '{"keywords":["兵马俑","秦朝","考古","千人千面","历史"],"activity":"历史考察","companion":"独自"}',
 'PRIVATE', 0, 0, 0, '2026-07-28 20:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '站在一号坑前，看着那排列整齐的陶俑军队，两千多年的时间好像一下子被抹掉了。\n\n我盯着其中一个兵俑的脸看了很久——他的眉毛微微上挑，嘴唇紧闭，表情严肃但年轻。两千多年前，有一个真实的工匠，用他的手捏出了这张脸。他不知道这张脸会在两千年后被无数人注视。\n\n他可能只是一个普通的工匠，但他的作品比他活得更久。这让我想到：我们做的每一件认真的事，也许都会在某个遥远的未来，被某个素未谋面的人看见。',
 '两千年前的工匠，比我们想象的更懂"永恒"', '秦始皇兵马俑博物馆',
 '{"keywords":["兵马俑","工匠","永恒","历史","传承"],"mood":"敬畏而感动","style":"诗意散文风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-28 21:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 兵马俑：两千年前的"千人千面"，今天依然震撼\n\n## 序\n\n做了十五年历史教师，教过无数次"秦朝的兵马俑"，但每次真正站在它们面前，还是会觉得课本上的描述太苍白了。\n\n这一次，我带上了VR相机，想用360度的方式，把那种"被六千个陶俑注视"的感觉记录下来。\n\n## 一号坑：帝国的面孔\n\n一号坑是最大的一个，也是最先被发现的。东西长230米，宽62米——比两个足球场还大。站在看台上往下看，六千个陶俑列队站立，气势之恢弘让人本能地屏住了呼吸。\n\n但最震撼的不是"多"，而是——**每个俑的面部都不一样。**\n\n我用VR相机的近景模式拍了几组兵俑面部的照片。有的眉头紧锁，有的嘴角微扬，有的眼神坚毅，有的表情温和。这不仅仅是"千人千面"——这是两千年前的工匠，对每一个生命个体的尊重。\n\n他们没有把这些士兵当成"炮灰"，而是给每一张脸都赋予了独一无二的尊严。\n\n## 二号坑：色彩的遗憾\n\n二号坑最有名的是彩色陶俑。刚出土的时候，陶俑身上还保留着两千年前的彩绘——红色、绿色、紫色、蓝色。但接触空气后，颜料在几分钟内氧化褪色。\n\n讲解员说："我们现在的技术还不够好，所以很多区域暂停了挖掘——宁愿让它们多睡几年，也不要因为我们的心急，毁掉两千年的颜色。"\n\n这句话让我很感动。保护历史，有时候需要的不是技术，而是克制。\n\n## 三号坑：指挥部的秘密\n\n三号坑最小，但最有意思——它是整个军队的指挥部。坑中有一辆指挥车，周围站着手持武器的警卫。考古学家由此推断：这支陶俑军队不仅有士兵，还有完整的指挥体系。\n\n## 工匠与永恒\n\n走出博物馆的时候，我一直在想一个问题：那些制作兵马俑的工匠，他们知道自己做的东西会留存两千年吗？\n\n大概率不知道。他们可能只是在做一份"工作"——认真捏好每一张脸，刻好每一片甲片。但他们做出来的东西，比任何一个帝王的功绩碑都活得长久。\n\n这大概就是"永恒"的真正含义：不是刻意追求不朽，而是把眼前的事做好，好到时间也不忍心带走。\n\n> 游览攻略：①旺季（3-11月）门票120元，建议提前在公众号预约；②强烈建议请官方讲解员（150元/次），没有讲解会错过90%的细节；③参观顺序：一号坑→三号坑→二号坑→陈列厅；④VR拍摄建议使用中长焦镜头拍面部特写，广角拍全景阵列；⑤游览时间建议预留3-4小时。',
 '站在兵马俑前，我看到了两千年前的"工匠精神"', '秦始皇兵马俑博物馆',
 '{"keywords":["兵马俑","秦朝","工匠精神","历史旅行","西安"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合历史考察日志和个人感悟日记，写一篇兵马俑深度游记，包含历史文化解读和游览建议","style":"诗意散文风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-28 22:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- u10 钱一 (滑雪爱好者, 黑龙江) — 亚布力滑雪
-- ============================================================
SET @userId = 'u10';
SET @logId = UUID(); SET @diaryId = UUID(); SET @travelogueId = UUID();

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@logId, @userId, 'NOTE', 'LOG', NULL,
 '2026年7月27日，亚布力滑雪场（夏季旱雪道）。训练内容：高级道技巧练习——大回转+小回转+急停。天气：晴，28°C。训练时间3小时。使用装备：Atomic Redster S9滑雪板+Atomic Hawx Ultra 130雪鞋。VR拍摄：头盔GoPro Max拍摄第一视角VR素材共45分钟，完整记录了高级道全程。滑行数据：最高时速72km/h，共完成12趟。',
 NULL, '亚布力滑雪场',
 '{"keywords":["滑雪","亚布力","高级道","训练","VR第一视角"],"weather":"晴","activity":"滑雪训练","speed":"72km/h","companion":"独自"}',
 'PRIVATE', 0, 0, 0, '2026-07-27 17:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@diaryId, @userId, 'NOTE', 'DIARY', @logId,
 '今天在高级道冲下来的时候，速度到了72。风在耳边呼啸，整个世界只剩下我和雪道。\n\n有人说滑雪是"白色鸦片"——上瘾。但对我来说，上瘾的不是速度本身，是在高速中必须保持的那种"绝对的专注"。生活中很少有这样的时刻：你必须百分之百地活在当下，因为一秒钟的分神就可能摔出去。\n\n这种专注，让我从所有的压力和焦虑中解脱出来。在雪道上，我不需要想任何事——只需要感受风和重力，还有自己呼吸的节奏。',
 '时速72公里的自由：滑雪教我的绝对专注', '亚布力滑雪场',
 '{"keywords":["滑雪","速度","专注","自由","极限运动"],"mood":"兴奋而专注","style":"轻松口语风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-27 18:00:00');

INSERT INTO posts (id, author_id, post_type, content_level, parent_post_id, content, title, location_name, vr_metadata, visibility, like_count, comment_count, view_count, created_at) VALUES
(@travelogueId, @userId, 'NOTE', 'TRAVELOGUE', @diaryId,
 '# 在亚布力追逐速度：一个滑雪爱好者的72km/h日记\n\n## 夏天也能滑雪？\n\n很多人以为滑雪只是冬天的运动，其实亚布力有全国最好的旱雪道——一种特殊材料模拟雪地滑行感觉，夏天也能训练。\n\n## 训练日记\n\n今天的目标是高级道大回转+小回转组合练习。\n\n热身两趟之后正式开始。第一趟大回转——从山顶出发，身体压低，膝盖弯曲，雪板切过弯道的感觉干脆利落。头盔上的GoPro Max在拍第一视角VR，画面应该很有沉浸感——希望看的人能感受到那种"人在画中"的速度感。\n\n第五趟挑战了全速。从山顶直冲而下，最高时速到了72公里。在这个速度上，你的视野会变窄，只剩下前方的雪道和自己的呼吸声。是一种非常奇妙的体验——不是恐惧，是一种"被清空"的感觉。\n\n## 为什么我热爱滑雪\n\n有人问过我："摔了不疼吗？"\n\n当然疼。但每一次摔跤之后站起来继续滑，那种"我还能行"的感觉，比摔倒本身强烈一百倍。\n\n滑雪和生活很像——重要的不是你摔倒了几次，而是你有没有从雪地上爬起来，说一句"再来一趟"。\n\n> 滑雪攻略：①亚布力滑雪场距哈尔滨约3小时车程；②初学者建议请教练，2小时约400元，比医院便宜；③夏季旱雪道同样适合训练，人还少；④VR第一视角拍摄建议使用头盔固定支架，画面更稳定；⑤必备装备：头盔（必须戴！）、护膝、护臀、滑雪镜。',
 '夏天在亚布力滑雪是一种什么体验？', '亚布力滑雪场',
 '{"keywords":["亚布力","滑雪攻略","旱雪","VR第一视角","极限运动"],"sourceLogs":["__LOG_ID__"],"sourceDiaries":["__DIARY_ID__"],"prompt":"结合滑雪训练日志和运动感悟日记，写一篇亚布力滑雪游记，包含夏季滑雪攻略和极限运动感悟","style":"轻松口语风","aiGenerated":true}',
 'PUBLIC', 0, 0, 0, '2026-07-27 19:00:00');

UPDATE posts SET vr_metadata = REPLACE(REPLACE(vr_metadata, '"__LOG_ID__"', CONCAT('"', @logId, '"')), '"__DIARY_ID__"', CONCAT('"', @diaryId, '"')) WHERE id = @travelogueId;

-- ============================================================
-- 游记(TRAVELOGUE) → 话题(post_topics) 关联
-- 按作者映射到对应旅行话题，让公开游记进入社区话题流
-- ============================================================
INSERT INTO post_topics (id, post_id, topic_id)
SELECT UUID(), p.id, t.topic_id
FROM posts p
JOIN (
  SELECT 'u2' AS author_id, 'topic-003' AS topic_id UNION ALL  -- 漓江光影 → VR拍摄技巧
  SELECT 'u3', 'topic-003' UNION ALL                            -- 西湖VR → VR拍摄技巧
  SELECT 'u4', 'topic-007' UNION ALL                            -- 稻城亚丁 → 徒步挑战
  SELECT 'u5', 'topic-007' UNION ALL                            -- 哈巴雪山 → 徒步挑战
  SELECT 'u6', 'topic-008' UNION ALL                            -- 长沙美食 → 美食地图
  SELECT 'u7', 'topic-005' UNION ALL                            -- 苏州园林 → 古镇探秘
  SELECT 'u8', 'topic-006' UNION ALL                            -- 蜈支洲岛 → 海岛度假
  SELECT 'u9', 'topic-005' UNION ALL                            -- 兵马俑 → 古镇探秘
  SELECT 'u10', 'topic-007'                                     -- 亚布力 → 徒步挑战
) t ON p.author_id = t.author_id
WHERE p.content_level = 'TRAVELOGUE';

UPDATE topics SET post_count = (SELECT COUNT(*) FROM post_topics WHERE topic_id = topics.id);

SELECT 'Seed LOG + DIARY + TRAVELOGUE data inserted for u2-u10!' AS result;
