(async () => {
  for (const [port, url] of [[3001, 'http://localhost:3001/api/feed'], [3000, 'http://localhost:3000']]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
      console.log(`${port}: ${r.status} ${(r.headers.get('content-type') || '').slice(0, 30)}`);
    } catch (e) {
      console.log(`${port}: ERROR ${e.name || e.message}`);
    }
  }
})();
