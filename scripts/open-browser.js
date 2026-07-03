const { exec } = require('child_process');
const url = 'http://localhost:3000';

function checkAndOpen() {
  const http = require('http');
  const req = http.get(url, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304) {
      exec('cmd /c start "" "http://localhost:3000"');
      req.destroy();
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
