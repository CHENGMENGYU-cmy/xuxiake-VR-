const { exec } = require('child_process');
const url = 'http://localhost:3000';

function checkAndOpen() {
  const http = require('http');
  http.get(url, (res) => {
    if (res.statusCode === 200 || res.statusCode === 304) {
      exec(`explorer "${url}"`);
    } else {
      setTimeout(checkAndOpen, 1000);
    }
  }).on('error', () => {
    setTimeout(checkAndOpen, 1000);
  });
}

checkAndOpen();
