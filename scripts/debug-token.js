(async () => {
  const BASE = 'http://localhost:3001/api';
  const loginRes = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'test-key', captchaCode: 'TEST1234' }),
  });
  const loginJson = await loginRes.json();
  console.log('登录 success:', loginJson.success);
  const data = loginJson.data || {};
  console.log('data keys:', Object.keys(data));
  const token = data.accessToken || data.tokens?.accessToken;
  console.log('token 前20:', token?.slice(0, 20));
  const me = await fetch(BASE + '/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
  console.log('/auth/me 状态:', me.status);
})().catch(e => console.error(e));
