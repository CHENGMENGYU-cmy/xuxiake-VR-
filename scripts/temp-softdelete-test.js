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

  // 1. 帖子数（应排除草稿）：sunqi 4 日记 + 3 游记 = 7
  const all = await j('/users/sunqi/posts?limit=1', { headers: H });
  console.log('帖子数 total:', all.body.total, '（预期 7 = 4 日记不含草稿 + 3 游记）');

  // 2. 创建临时日记 → total+1
  const created = await j('/posts', { method: 'POST', headers: H, body: JSON.stringify({ content: '软删测试临时日记', visibility: 'PRIVATE', contentLevel: 'DIARY', postType: 'NOTE' }) });
  const newId = created.body?.data?.id;
  console.log('创建临时日记:', newId);
  const before = await j('/users/sunqi/posts?limit=50&contentLevel=DIARY', { headers: H });
  console.log('软删前 日记 total:', before.body.total, '含新?', before.body.data?.some(p => p.id === newId));

  // 3. 软删该日记
  const del = await j(`/posts/${newId}`, { method: 'DELETE', headers: H });
  console.log('软删 status:', del.status);

  // 4. 软删后 getPostById 应 404（TypeORM 自动过滤）
  const got = await j(`/posts/${newId}`, { headers: H });
  console.log('软删后 getPostById status:', got.status, '（预期 404）');

  // 5. getUserPosts 不含软删
  const after = await j('/users/sunqi/posts?limit=50&contentLevel=DIARY', { headers: H });
  console.log('软删后 日记 total:', after.body.total, '仍含?', after.body.data?.some(p => p.id === newId));

  // 6. 数据库确认 deleted_at 已置
  console.log('--- 待 mysql 确认 deleted_at ---');
})();
