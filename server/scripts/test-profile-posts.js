const BASE = 'http://localhost:3001/api';

async function main() {
  const cap = await (await fetch(BASE + '/auth/captcha')).json();
  const login = await (await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'sunqi', password: 'password123', captchaKey: cap.data.key, captchaCode: 'TEST1234' }),
  })).json();
  if (!login.data) { console.log('登录失败:', JSON.stringify(login)); return; }
  const token = login.data.tokens.accessToken;
  const userId = login.data.user.id;
  console.log('登录成功, userId =', userId, ', token长度 =', token.length);

  const noAuth = await (await fetch(BASE + '/users/sunqi/posts?limit=100')).json();
  console.log('无token: total =', noAuth.total, 'posts =', noAuth.data.length);

  const withAuth = await (await fetch(BASE + '/users/sunqi/posts?limit=100', {
    headers: { Authorization: 'Bearer ' + token },
  })).json();
  console.log('有token: total =', withAuth.total, 'posts =', withAuth.data.length);
  withAuth.data.forEach(p => console.log('  -', p.id, '|', p.contentLevel, '|', p.visibility));
}

main().catch(e => console.error('ERR', e.message));
