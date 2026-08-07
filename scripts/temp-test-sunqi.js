const base = 'http://localhost:3001/api';
async function j(url, opts = {}) {
  const r = await fetch(base + url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const body = await r.json().catch(() => ({}));
  return { status: r.status, body };
}
(async () => {
  const cap = await j('/auth/captcha');
  const key = cap.body?.data?.key;
  console.log('captcha key:', key);
  const login = await j('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ account: 'sunqi', password: 'password123', captchaKey: key, captchaCode: 'TEST1234' }),
  });
  console.log('login status:', login.status);
  console.log('login body:', JSON.stringify(login.body).slice(0, 400));
  const token = login.body?.data?.tokens?.accessToken;
  if (!token) return;
  console.log('token len:', token.length);

  const trips = await j('/posts/trips', { headers: { Authorization: `Bearer ${token}` } });
  console.log('trips:', JSON.stringify(trips.body).slice(0, 500));

  const dims = await j('/posts/classified/dimensions', { headers: { Authorization: `Bearer ${token}` } });
  console.log('dimensions byTrip:', JSON.stringify(dims.body?.data?.byTrip).slice(0, 300));
  console.log('dimensions byLocation:', JSON.stringify(dims.body?.data?.byLocation).slice(0, 300));

  const snaps = await j('/posts/snaps', { headers: { Authorization: `Bearer ${token}` } });
  const withTrip = (snaps.body?.data || []).filter(s => s.tripId);
  console.log('snaps total:', (snaps.body?.data || []).length, ', with tripId:', withTrip.length);
  console.log('sample trip snap:', JSON.stringify(withTrip[0], (k, v) => k === 'author' ? undefined : v).slice(0, 600));
})();
