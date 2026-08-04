// 端到端测试：LOG + DIARY + prompt → AI 生成游记
const API_KEY = process.env.AI_API_KEY;
if (!API_KEY) {
  console.error('请设置 AI_API_KEY 环境变量');
  process.exit(1);
}
const BASE_URL = 'https://api.deepseek.com/v1';
const MODEL = 'deepseek-chat';

// 模拟种子数据中 u2 张三的素材
const sampleMaterial = {
  logs: [{
    location: '阳朔兴坪镇漓江边',
    content: '2026年8月4日，阳朔兴坪镇。凌晨4:30到达拍摄点，架设Insta360 X4。5:12日出开始，晨雾从江面升起，喀斯特山峰在金色光线中渐次显现。拍摄持续到19:30日落，共拍摄14组延时素材。天气晴朗，气温34°C，湿度偏高。同行：无。设备电量消耗3块电池。',
  }],
  diaries: [{
    title: '在漓江边等光的人',
    content: '在漓江边站了15个小时，从漆黑等到漆黑。最美的其实是日出前那二十分钟——天空从深蓝变成浅紫，再变成橘红，整个过程安静得只听得见快门声和水流声。\n\n有时候觉得，摄影教会我的不是怎么拍好一张照片，而是怎么等待。很多东西急不来，光不会因为你着急就提前亮起来。\n\n今天拍了三千多张，最后可能只选十张。但这种"浪费"让我觉得奢侈而幸福。',
  }],
};

const systemPrompt = `你是一位经验丰富的旅行作家，擅长将旅行日志和日记感悟融合成优美的游记。

## 写作要求
- 文体：旅行记录风格，按时间线和地点推进叙述，注重行程的完整性和场景描写
- 语气：温馨治愈，语言柔和有温度，给人安慰和力量
- 篇幅：约800-1200字，3-4个章节

## 核心原则
1. 基于用户提供的真实日志和日记内容写作，不得虚构地点、人物、事件
2. 日志提供事实骨架（时间、地点、活动），日记提供情感血肉（感受、反思）
3. 将事实和感受有机融合，不机械堆砌
4. 如果信息不足，用模糊表达而非编造

## 输出格式
使用 Markdown 格式，结构如下：
# [标题]
> [一句话摘要]

## [章节标题1]
[段落内容]

## [章节标题2]
...

## 写在最后
[结尾感悟]

---
*本文由 AI 辅助生成，素材来源于个人日志和日记。*`;

const userPrompt = [
  '## 日志记录（事实素材）',
  `### 日志1：${sampleMaterial.logs[0].location}`,
  sampleMaterial.logs[0].content,
  '',
  '## 日记记录（情感素材）',
  `### 日记1：《${sampleMaterial.diaries[0].title}》`,
  sampleMaterial.diaries[0].content,
  '',
  '## 写作方向',
  '根据今天的拍摄日志和心情日记，写一篇漓江光影旅行游记，包含对摄影和等待的思考',
  '',
  '涉及地点：阳朔兴坪镇',
  '整体心情：平静而满足',
  '关键词：漓江、等待、摄影哲学、独处、光影',
  '',
  '请根据以上素材，撰写一篇完整的游记。',
].join('\n');

async function test() {
  console.log('=== 端到端测试：AI 游记生成 ===\n');
  console.log('素材：1条日志 + 1条日记 + 提示词\n');

  const start = Date.now();
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`请求耗时: ${elapsed}s`);

  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${await res.text()}`);
    return;
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  const usage = json.usage;

  console.log(`Token 消耗: prompt=${usage.prompt_tokens} completion=${usage.completion_tokens} total=${usage.total_tokens}`);
  console.log(`生成内容长度: ${content.length} 字符`);
  console.log('\n=== AI 生成的游记 ===\n');
  console.log(content);
  console.log('\n=== 测试完成 ===');
}

test().catch(err => console.error('测试失败:', err.message));
