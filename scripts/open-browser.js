const http = require('http');
const url = 'http://localhost:3000';

function checkAndOpen() {
  const req = http.get(url, (res) => {
    req.destroy();
    if (res.statusCode === 200 || res.statusCode === 304) {
      import('open').then(mod => mod.default(url, { app: { name: 'chrome' } }));
    } else {
      setTimeout(checkAndOpen, 1000);
    }
  });
  req.on('error', () => {
    setTimeout(checkAndOpen, 1000);
  });
  req.setTimeout(2000, () => {
    req.destroy();
    setTimeout(checkAndOpen, 1000);
  });
}

checkAndOpen();
