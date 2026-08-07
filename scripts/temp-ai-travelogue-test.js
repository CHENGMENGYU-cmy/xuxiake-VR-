const base = 'http://localhost:3001/api';
async function req(url, opts = {}) {
  const r = await fetch(base + url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  const body = await r.json().catch(() => ({}));
  return { status: r.status, body };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const cap = await req('/auth/captcha');
  const login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ account: 'sunqi', password: 'password123', captchaKey: cap.body.data.key, captchaCode: 'TEST1234' }),
  });
  const token = login.body?.data?.tokens?.accessToken;
  if (!token) { console.log('LOGIN FAIL'); return; }
  const H = { Authorization: `Bearer ${token}` };

  const snaps = (await req('/posts/snaps', { headers: H })).body?.data || [];
  const diaries = (await req('/posts/diaries', { headers: H })).body?.data || [];
  console.log('snaps:', snaps.length, 'diaries:', diaries.length);

  const logIds = snaps.slice(0, 3).map((s) => s.id);
  const diaryIds = [diaries[0]?.id].filter(Boolean);
  console.log('logIds:', logIds.length, 'diaryIds:', diaryIds.length);

  const gen = await req('/posts/travelogue/generate', {
    method: 'POST', headers: H,
    body: JSON.stringify({ logIds, diaryIds, style: '游记', tone: '温暖', length: '标准' }),
  });
  const jobId = gen.body?.data?.jobId;
  if (!jobId) { console.log('GEN FAIL', JSON.stringify(gen.body).slice(0, 300)); return; }
  console.log('jobId:', jobId);

  let job;
  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    job = (await req(`/posts/travelogue/job/${jobId}`, { headers: H })).body?.data;
    console.log(`poll ${i}:`, job?.status, job?.progress + '%');
    if (job?.status === 'DONE' || job?.status === 'ERROR') break;
  }
  if (job?.status !== 'DONE') { console.log('NOT DONE', job?.error); return; }

  const post = (await req(`/posts/${job.postId}`, { headers: H })).body?.data;
  const j = post?.journey;
  console.log('RESULT title:', j?.title);
  console.log('RESULT summary:', j?.summary);
  console.log('RESULT destination:', j?.destination, '| transport:', j?.transport, '| theme:', j?.theme);
  console.log('RESULT stops:', j?.stops?.length);
  j?.stops?.forEach((s, i) => {
    console.log(`  Day${s.dayNumber}: ${s.locationName} | ${s.dayDate} | media=${s.mediaItems?.length} | desc=${(s.description || '').slice(0, 40)}`);
  });
  console.log('RESULT insight:', (j?.insight || '').slice(0, 40));
  console.log('TEST_POST_ID=' + job.postId);
})();
