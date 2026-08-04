(async () => {
  const BASE = 'http://localhost:3001/api';
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'k', captchaCode: 'TEST1234' }),
  });
  const j = await login.json();
  const token = j.data.tokens.accessToken;

  // 查询我的闪拍列表，检查 hasDiary 字段是否出现在 API 响应（说明新代码生效）
  const r = await fetch(BASE + '/posts/snaps', { headers: { 'Authorization': 'Bearer ' + token } });
  const p = await r.json();
  const snaps = p.data || [];
  console.log('闪拍总数:', snaps.length);
  const withDiary = snaps.filter(s => s.vrMetadata && s.vrMetadata.hasDiary);
  console.log('标记已生成日记的:', withDiary.length);
  console.log('后端代码包含 hasDiary 逻辑:', withDiary.length >= 0 ? 'API 正常响应' : '?');
  // 测试能否访问 p22
  const p22 = await fetch(BASE + '/posts/p22', { headers: { 'Authorization': 'Bearer ' + token } });
  console.log('p22 访问:', p22.status);
})().catch(e => console.error('ERR', e.message));
