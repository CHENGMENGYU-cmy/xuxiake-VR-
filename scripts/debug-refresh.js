(async () => {
  const BASE = 'http://localhost:3001/api';

  // 1. 登录
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'k', captchaCode: 'TEST1234' }),
  });
  const j = await login.json();
  const { accessToken, refreshToken } = j.data.tokens;
  console.log('✅ 登录成功, accessToken 前10:', accessToken.slice(0, 10));

  // 2. 模拟刷新页面：用 access token 访问 profile
  const me1 = await fetch(BASE + '/users/profile', { headers: { 'Authorization': 'Bearer ' + accessToken } });
  console.log('访问 profile (原token):', me1.status);

  // 3. 调用 refresh 接口
  const ref = await fetch(BASE + '/auth/refresh', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const refJson = await ref.json();
  console.log('refresh 接口:', ref.status, refJson.success ? '成功' : JSON.stringify(refJson));
  if (refJson.success) {
    const newToken = refJson.data.accessToken;
    console.log('新 accessToken 前10:', newToken.slice(0, 10));

    // 4. 用新 token 访问 profile
    const me2 = await fetch(BASE + '/users/profile', { headers: { 'Authorization': 'Bearer ' + newToken } });
    console.log('访问 profile (新token):', me2.status);
  }
})().catch(e => console.error('ERR', e.message));
