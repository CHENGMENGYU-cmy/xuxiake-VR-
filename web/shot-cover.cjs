/* 将 工作总结封面.html 渲染为高清 PNG（4:3 封面，deviceScaleFactor=2） */
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const htmlPath = 'file://' + path.join(root, '工作总结封面.html').replace(/\\/g, '/');
  const outPath = path.join(root, '工作总结封面.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 1050 },
    deviceScaleFactor: 2,
  });
  await page.goto(htmlPath);
  await page.waitForTimeout(600);
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log('OK:', outPath);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
