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

  const post = (await j('/posts/fde24594-6f21-4d4e-b4f3-ba704c76e6a3', { headers: H })).body?.data;
  const jj = post?.journey;
  console.log('title:', jj?.title);
  console.log('summary:', jj?.summary);
  console.log('destination:', jj?.destination, '| start:', jj?.startDate, '| end:', jj?.endDate);
  console.log('transport:', jj?.transport, '| budget:', jj?.budget, '| theme:', jj?.theme);
  console.log('insight:', jj?.insight);
  console.log('coverUrl:', jj?.coverUrl);
  console.log('stops count:', jj?.stops?.length);
  jj?.stops?.forEach((s, i) => {
    console.log(`  stop${i}: day=${s.dayNumber} date=${s.dayDate} loc=${s.locationName} desc=${(s.description || '').slice(0, 30)} mediaItems=${s.mediaItems?.length}`);
  });
})();
