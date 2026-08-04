(async () => {
  const BASE = 'http://localhost:3001/api';
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'k', captchaCode: 'TEST1234' }),
  });
  const j = await login.json();
  const token = j.data.tokens.accessToken;

  // 查日志
  const logs = await fetch(BASE + '/posts/logs', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json());
  console.log('📥 日志数:', (logs.data || []).length);
  (logs.data || []).forEach((l, i) => {
    console.log(`  [${i}] ${l.locationName} | 媒体${l.mediaItems?.length || 0}个 | 封面: ${l.mediaItems?.[0]?.thumbnailUrl || l.vrMetadata?.image ? '✅' : '❌'}`);
  });

  // 查日记
  const di = await fetch(BASE + '/posts/diaries', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json());
  console.log('\n📥 日记数:', (di.data || []).length);
  (di.data || []).forEach((d, i) => {
    console.log(`  [${i}] ${d.title} | 媒体${d.mediaItems?.length || 0}个`);
  });
})().catch(e => console.error('ERR', e.message));
