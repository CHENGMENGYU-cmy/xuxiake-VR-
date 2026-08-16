/* 将 系统框架图.html 渲染为高清 PNG（用项目已装的 playwright chromium） */
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const htmlPath = 'file://' + path.join(root, '系统框架图.html').replace(/\\/g, '/');
  const outPath = path.join(root, '系统框架图.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1200 },
    deviceScaleFactor: 2,
  });
  await page.goto(htmlPath);
  await page.waitForTimeout(600);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('OK:', outPath);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
