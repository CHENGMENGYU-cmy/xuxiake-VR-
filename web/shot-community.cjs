/* 将 徐霞客社区系统框架图.html 渲染为高清 PNG（deviceScaleFactor=2, fullPage） */
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const htmlPath = 'file://' + path.join(root, '徐霞客社区系统框架图.html').replace(/\\/g, '/');
  const outPath = path.join(root, '徐霞客社区系统框架图.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1500, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.goto(htmlPath);
  await page.waitForTimeout(700);
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('OK:', outPath);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
