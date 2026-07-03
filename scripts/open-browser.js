const http = require('http');
const url = 'http://localhost:3000';

async function checkAndOpen() {
  const req = http.get(url, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304) {
      req.destroy();
      import('open').then(({ default: open }) => {
        open(url);
        console.log('Browser opened: ' + url);
      });
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
