-- ============================================================
-- 统一日记 vr_metadata 字段
-- 补齐 mood(枚举) / weather(枚举) / insight / status
-- mood 映射：free-text → MoodType enum
-- ============================================================

USE xuxiake;
SET NAMES utf8mb4;

-- u2 张三：漓江 — calm + sunny
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'calm'
        ),
        '$.weather', 'sunny'
      ),
      '$.insight', '摄影教会我的不是怎么拍好一张照片，而是怎么等待。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u2' AND content_level = 'DIARY';

-- u3 李四：西湖 — calm + cloudy
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'calm'
        ),
        '$.weather', 'cloudy'
      ),
      '$.insight', '科技一直在进步，但西湖还是那个西湖。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u3' AND content_level = 'DIARY';

-- u4 王五：稻城亚丁 — excited + sunny
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'excited'
        ),
        '$.weather', 'rainy'
      ),
      '$.insight', '有些画面，镜头装不下。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u4' AND content_level = 'DIARY';

-- u5 赵六：哈巴雪山 — excited + sunny
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'excited'
        ),
        '$.weather', 'sunny'
      ),
      '$.insight', '带人看世界，可能比我自己看世界，更有意义。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u5' AND content_level = 'DIARY';

-- u6 孙七：长沙美食 — happy + sunny
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'happy'
        ),
        '$.weather', 'sunny'
      ),
      '$.insight', '生活要够味，辣一点没关系。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u6' AND content_level = 'DIARY';

-- u7 周八：苏州园林 — calm + rainy
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'calm'
        ),
        '$.weather', 'rainy'
      ),
      '$.insight', '古典园林里，藏着最好的UX设计。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u7' AND content_level = 'DIARY';

-- u8 吴九：蜈支洲岛 — calm + sunny
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'calm'
        ),
        '$.weather', 'sunny'
      ),
      '$.insight', '放小自己，烦恼就小了。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u8' AND content_level = 'DIARY';

-- u9 郑十：兵马俑 — calm + cloudy
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'calm'
        ),
        '$.weather', 'cloudy'
      ),
      '$.insight', '我们做的每一件认真的事，也许都会在某个遥远的未来被看见。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u9' AND content_level = 'DIARY';

-- u10 钱一：亚布力滑雪 — excited + sunny
UPDATE posts SET vr_metadata = JSON_SET(
  JSON_SET(
    JSON_SET(
      JSON_SET(
        JSON_SET(
          JSON_REMOVE(vr_metadata, '$.mood'),
          '$.mood', 'excited'
        ),
        '$.weather', 'sunny'
      ),
      '$.insight', '在雪道上，我不需要想任何事——只需要感受风和重力。'
    ),
    '$.status', 'public'
  ),
  '$.aiGenerated', true
) WHERE author_id = 'u10' AND content_level = 'DIARY';

-- 验证结果
SELECT
  u.display_name AS user_name,
  p.title,
  JSON_UNQUOTE(JSON_EXTRACT(p.vr_metadata, '$.mood')) AS mood,
  JSON_UNQUOTE(JSON_EXTRACT(p.vr_metadata, '$.weather')) AS weather,
  JSON_UNQUOTE(JSON_EXTRACT(p.vr_metadata, '$.insight')) AS insight,
  JSON_UNQUOTE(JSON_EXTRACT(p.vr_metadata, '$.status')) AS status
FROM posts p
JOIN users u ON u.id = p.author_id
WHERE p.content_level = 'DIARY'
ORDER BY u.display_name;
