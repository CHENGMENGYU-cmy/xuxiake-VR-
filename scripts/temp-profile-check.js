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
  const all = await j('/users/sunqi/posts?limit=1', { headers: H });
  console.log('全部 tab: total=', all.body.total, '| data len=', all.body.data?.length);
  const diary = await j('/users/sunqi/posts?limit=50&contentLevel=DIARY', { headers: H });
  console.log('日记 tab: total=', diary.body.total, '| 返回条数=', diary.body.data?.length);
  console.log('日记 id 列表:', diary.body.data?.map(p => p.id));
  const travel = await j('/users/sunqi/posts?limit=50&contentLevel=TRAVELOGUE,ESSAY', { headers: H });
  console.log('游记 tab: total=', travel.body.total, '| 返回条数=', travel.body.data?.length);
})();
