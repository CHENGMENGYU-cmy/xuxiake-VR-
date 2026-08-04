(async () => {
  const BASE = 'http://localhost:3001/api';
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'k', captchaCode: 'TEST1234' }),
  });
  const j = await login.json();
  const token = j.data.tokens.accessToken;
  console.log('✅ 登录 zhangshan');

  // 查该用户所有帖子
  const r = await fetch(BASE + '/users/zhangshan/posts?limit=100', { headers: { 'Authorization': 'Bearer ' + token } });
  const json = await r.json();
  const posts = json.data || [];
  const byLevel = {};
  posts.forEach(p => { byLevel[p.contentLevel] = (byLevel[p.contentLevel] || 0) + 1; });
  console.log('📊 zhangshan 帖子 contentLevel 分布:', JSON.stringify(byLevel));

  // 查闪拍
  const snaps = await fetch(BASE + '/posts/snaps', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json());
  console.log('闪拍数:', (snaps.data || []).length);

  // 查日志
  const logs = await fetch(BASE + '/posts/logs', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json());
  console.log('日志数:', (logs.data || []).length);

  // 查日记
  const di = await fetch(BASE + '/posts/diaries', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json());
  console.log('日记数:', (di.data || []).length);

  // 查游记
  const tv = await fetch(BASE + '/posts/travelogues', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json());
  console.log('游记数:', (tv.data || []).length);
})().catch(e => console.error('ERR', e.message));
