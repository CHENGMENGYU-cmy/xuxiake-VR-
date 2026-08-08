const base = 'http://localhost:3001/api';
async function j(url, opts = {}) {
  const r = await fetch(base + url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  const b = await r.json().catch(() => ({}));
  return { status: r.status, body: b };
}
(async () => {
  const cap = await j('/auth/captcha');
  const lr = await j('/auth/login', { method: 'POST', body: JSON.stringify({ account: 'sunqi', password: 'password123', captchaKey: cap.body.data.key, captchaCode: 'TEST1234' }) });
  const token = lr.body?.data?.tokens?.accessToken;
  const H = { Authorization: 'Bearer ' + token };

  const r = await j('/users/sunqi/posts?limit=200', { headers: H });
  const data = r.body.data || [];
  console.log('total:', r.body.total, '| 返回 data 数:', data.length);
  const dist = {};
  for (const p of data) {
    const key = `${p.contentLevel}:${p.author?.username}`;
    dist[key] = (dist[key] || 0) + 1;
  }
  console.log('data contentLevel:author 分布:', JSON.stringify(dist));
  // 检查 author
  const authors = new Set(data.map(p => p.author?.username));
  console.log('返回帖子的作者:', [...authors]);
  // 样例
  if (data[0]) console.log('样例:', JSON.stringify({ id: data[0].id, author: data[0].author?.username, contentLevel: data[0].contentLevel, content: (data[0].content || '').slice(0, 20) }));
})();
