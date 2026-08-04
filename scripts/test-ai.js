// 测试 AI API 连接
const API_KEY = process.env.AI_API_KEY;
if (!API_KEY) {
  console.error('请设置 AI_API_KEY 环境变量');
  console.error('  PowerShell: $env:AI_API_KEY="sk-xxx"');
  console.error('  或读取 server/.env 中的配置');
  process.exit(1);
}
const BASE_URL = 'https://api.deepseek.com/v1';
const MODEL = 'deepseek-chat';

async function test() {
  console.log('Testing DeepSeek API...');
  console.log(`URL: ${BASE_URL}/chat/completions`);
  console.log(`Model: ${MODEL}`);

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'user', content: '用一句话介绍你自己' },
      ],
      max_tokens: 100,
    }),
  });

  console.log(`Status: ${res.status}`);
  const json = await res.json();

  if (json.choices?.[0]?.message?.content) {
    console.log('Response:', json.choices[0].message.content);
    console.log('Usage:', JSON.stringify(json.usage));
    console.log('\nSUCCESS — AI API 连接正常');
  } else {
    console.log('ERROR:', JSON.stringify(json).slice(0, 300));
  }
}

test().catch(err => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
