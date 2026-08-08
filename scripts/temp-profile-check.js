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
  const auth = { headers: H };

  // 1. 创建一篇测试日记
  const created = await j('/posts', {
    method: 'POST', headers: H,
    body: JSON.stringify({ content: '测试删除同步的日记', visibility: 'PRIVATE', contentLevel: 'DIARY', postType: 'NOTE' }),
  });
  const newId = created.body?.data?.id;
  console.log('创建日记 id:', newId);
  const before = await j('/users/sunqi/posts?limit=50&contentLevel=DIARY', auth);
  console.log('删除前 日记 total:', before.body.total, '含新日记?', before.body.data?.some(p => p.id === newId));

  // 2. 删除该日记
  const del = await j(`/posts/${newId}`, { method: 'DELETE', headers: H });
  console.log('删除 status:', del.status, del.body?.message);

  // 3. 删除后再查
  const after = await j('/users/sunqi/posts?limit=50&contentLevel=DIARY', auth);
  console.log('删除后 日记 total:', after.body.total, '仍含新日记?', after.body.data?.some(p => p.id === newId));
})();
