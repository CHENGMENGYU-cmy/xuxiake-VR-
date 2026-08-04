(async () => {
  const BASE = 'http://localhost:3001/api';
  const login = await fetch(BASE + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account: 'zhangshan', password: 'password123', captchaKey: 'k', captchaCode: 'TEST1234' }),
  });
  const j = await login.json();
  const token = j.data.tokens.accessToken;

  const r = await fetch(BASE + '/posts/p22', { headers: { 'Authorization': 'Bearer ' + token } });
  console.log('p22 status:', r.status);
  const p = await r.json();
  if (p.data) {
    console.log('author:', p.data.author?.username, '| level:', p.data.contentLevel, '| type:', p.data.postType);
    console.log('title:', p.data.title?.slice(0, 40));
    console.log('content:', (p.data.content || '').slice(0, 60));
  } else {
    console.log('body:', JSON.stringify(p));
  }
})().catch(e => console.error('ERR', e.message));
