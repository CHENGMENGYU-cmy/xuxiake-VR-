// 测试 AI API 连接
const API_KEY = process.env.AI_API_KEY || 'sk-6baa1e0616284546aaa6120fd665b806';
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
