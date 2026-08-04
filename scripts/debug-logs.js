(async () => {
  const BASE = 'http://localhost:3001/api';
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'k', captchaCode: 'TEST1234' }),
  });
  const j = await login.json();
  if (!j.success) { console.log('登录失败:', JSON.stringify(j)); process.exit(1); }
  const token = j.data.tokens.accessToken;
  console.log('✅ 登录成功: zhangshan');

  // 查日志
  const logsRes = await fetch(BASE + '/posts/logs', { headers: { 'Authorization': 'Bearer ' + token } });
  const logsJson = await logsRes.json();
  console.log('\n📥 /posts/logs 状态:', logsRes.status);
  console.log('日志数量:', (logsJson.data || []).length);
  (logsJson.data || []).forEach((l, i) => {
    console.log(`  [${i}] id=${l.id} | loc=${l.locationName} | content=${(l.content || '').slice(0, 40)}`);
  });

  // 查日记
  const diariesRes = await fetch(BASE + '/posts/diaries', { headers: { 'Authorization': 'Bearer ' + token } });
  const diariesJson = await diariesRes.json();
  console.log('\n📥 /posts/diaries 状态:', diariesRes.status);
  console.log('日记数量:', (diariesJson.data || []).length);

  // 查该用户的 contentLevel 分布
  const usersRes = await fetch(BASE + '/users/zhangshan/posts?limit=100', { headers: { 'Authorization': 'Bearer ' + token } });
  const usersJson = await usersRes.json();
  const posts = usersJson.data || [];
  const byLevel = {};
  posts.forEach(p => { byLevel[p.contentLevel] = (byLevel[p.contentLevel] || 0) + 1; });
  console.log('\n📥 用户帖子 contentLevel 分布:', JSON.stringify(byLevel));
})().catch(e => console.error('ERR', e.message));
