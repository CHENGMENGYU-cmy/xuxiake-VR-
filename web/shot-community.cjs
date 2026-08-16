/* 将 徐霞客社区系统框架图.html 渲染为高清 PNG（按内容实际尺寸，deviceScaleFactor=1） */
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..');
  const htmlPath = 'file://' + path.join(root, '徐霞客社区系统框架图.html').replace(/\\/g, '/');
  const outPath = path.join(root, '徐霞客社区系统框架图.png');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(htmlPath);
  await page.waitForTimeout(700);
  const dims = await page.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight }));
  await page.setViewportSize({ width: dims.w, height: dims.h });
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('OK:', outPath, dims.w + 'x' + dims.h);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
