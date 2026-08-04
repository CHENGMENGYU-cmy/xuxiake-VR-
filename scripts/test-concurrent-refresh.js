// 模拟页面加载时多个请求同时 401 的并发场景
(async () => {
  const BASE = 'http://localhost:3001/api';

  // 1. 登录获取 token
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'k', captchaCode: 'TEST1234' }),
  });
  const j = await login.json();
  const { accessToken, refreshToken } = j.data.tokens;
  console.log('✅ 登录成功');

  // 2. 伪造过期场景：用错误的 token 访问，然后用 refresh token 刷新
  // 实际测试：直接用 refresh token 调用 refresh 接口，看后端是否接受
  console.log('\n=== 测试并发 refresh ===');
  const refreshPromises = Array.from({ length: 5 }, async (_, i) => {
    const r = await fetch(BASE + '/auth/refresh', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const rj = await r.json();
    return { i, status: r.status, success: rj.success };
  });
  const results = await Promise.all(refreshPromises);
  console.log('5个并发 refresh 结果:');
  results.forEach(r => console.log(`  [${r.i}] ${r.status} ${r.success ? '✅' : '❌'}`));
  const allSuccess = results.every(r => r.success);
  console.log(allSuccess ? '✅ 全部成功（后端支持并发 refresh）' : '❌ 部分失败');

  // 3. 用最后一个 refresh 返回的新 token 测试访问
  const lastRefresh = await fetch(BASE + '/auth/refresh', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const lastJson = await lastRefresh.json();
  const newToken = lastJson.data.accessToken;
  const me = await fetch(BASE + '/users/profile', { headers: { 'Authorization': 'Bearer ' + newToken } });
  console.log('\n新 token 访问 profile:', me.status === 200 ? '✅ 200' : '❌ ' + me.status);
})().catch(e => console.error('ERR', e.message));
