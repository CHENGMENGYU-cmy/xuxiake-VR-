const base = 'http://localhost:3001/api';
async function req(url, opts = {}) {
  const r = await fetch(base + url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const body = await r.json().catch(() => ({}));
  return { status: r.status, body };
}
(async () => {
  const cap = await req('/auth/captcha');
  const login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ account: 'sunqi', password: 'password123', captchaKey: cap.body.data.key, captchaCode: 'TEST1234' }),
  });
  const token = login.body?.data?.tokens?.accessToken;
  if (!token) { console.log('LOGIN FAIL', login.status); return; }
  const H = { Authorization: `Bearer ${token}` };

  const payload = {
    content: '# 桂林三日游测试\n\n> 测试导语\n\n目的地：桂林 · 3天\n\n## Day 1｜漓江\n\n竹筏上的清晨\n\n## Day 2｜阳朔\n\n西街的夜晚\n\n## 写在最后\n\n值得再来',
    visibility: 'PRIVATE',
    postType: 'JOURNEY',
    contentLevel: 'ESSAY',
    journey: {
      title: '桂林三日游测试',
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      destination: '桂林',
      coverUrl: 'https://picsum.photos/seed/cover1/800/600',
      summary: '测试导语',
      transport: '高铁',
      budget: '3000元',
      theme: '自然',
      insight: '值得再来',
      stops: [
        { dayNumber: 1, dayDate: '2026-08-01', locationName: '漓江', description: '竹筏清晨', mediaItems: [{ url: 'https://picsum.photos/seed/d1a/800/600' }, { url: 'https://picsum.photos/seed/d1b/800/600' }] },
        { dayNumber: 2, dayDate: '2026-08-02', locationName: '阳朔', description: '西街夜晚', mediaItems: [{ url: 'https://picsum.photos/seed/d2a/800/600' }] },
      ],
    },
  };

  const created = await req('/posts', { method: 'POST', headers: H, body: JSON.stringify(payload) });
  console.log('create status:', created.status);
  const post = created.body?.data;
  if (!post?.id) { console.log('CREATE FAIL', JSON.stringify(created.body).slice(0, 300)); return; }
  console.log('created id:', post.id, 'title:', post.journey?.title);
  console.log('summary:', post.journey?.summary, '| transport:', post.journey?.transport);
  console.log('stops:', post.journey?.stops?.length);
  const stop0 = post.journey?.stops?.[0];
  console.log('stop1:', stop0?.locationName, '| dayDate:', stop0?.dayDate, '| mediaItems:', stop0?.mediaItems?.length);

  // getPostById 验证
  const got = await req(`/posts/${post.id}`, { headers: H });
  const gj = got.body?.data?.journey;
  console.log('getById journey stops:', gj?.stops?.length, '| stop0 mediaItems:', gj?.stops?.[0]?.mediaItems?.length);

  // updatePost 更新 journey
  const upd = await req(`/posts/${post.id}`, {
    method: 'PUT',
    headers: H,
    body: JSON.stringify({ content: '更新内容', journey: { ...payload.journey, summary: '更新后的导语', transport: '自驾', stops: payload.journey.stops.slice(0, 1) } }),
  });
  const uj = upd.body?.data?.journey;
  console.log('update summary:', uj?.summary, '| transport:', uj?.transport, '| stops:', uj?.stops?.length);

  console.log('TEST_POST_ID=' + post.id);
})();
