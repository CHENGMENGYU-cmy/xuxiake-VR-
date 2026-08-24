import { test, expect } from '@playwright/test';
import { loginAsUser, loginAsAdmin, logout } from './auth.helper';

const VIEWPORTS = {
  mobile: { width: 390, height: 844, name: '手机 (iPhone 14)' },
  tablet: { width: 834, height: 1194, name: '平板 (iPad Pro)' },
  desktop: { width: 1440, height: 900, name: '桌面' },
};

const PAGES_TO_TEST = [
  { path: '/login', name: '登录页', needAuth: false },
  { path: '/feed', name: '信息流', needAuth: true },
  { path: '/feed', name: '发帖页', needAuth: true },
  { path: '/settings', name: '设置页', needAuth: true },
  { path: '/topics', name: '话题页', needAuth: true },
  { path: '/diaries', name: '日记页', needAuth: true },
  { path: '/journeys', name: '游记页', needAuth: true },
];

test.describe('响应式视口适配', () => {
  for (const [key, vp] of Object.entries(VIEWPORTS)) {
    test.describe(vp.name, () => {
      for (const pageInfo of PAGES_TO_TEST) {
        test(`${pageInfo.name} — 无溢出/可交互`, async ({ browser }) => {
          const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
          const page = await context.newPage();

          if (pageInfo.needAuth) {
            await loginAsUser(page);
          }
          await page.goto(pageInfo.path);
          await page.waitForTimeout(2000);

          // 检查页面没有水平溢出
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          const viewportWidth = await page.evaluate(() => window.innerWidth);
          const hasOverflow = bodyWidth > viewportWidth + 5; // 5px tolerance

          // 检查关键交互元素可见（auth 页面可能没有 nav）
          const hasNav = await page.locator('nav, header, [class*="nav"]').first().isVisible().catch(() => false);
          const isAuthPage = pageInfo.path === '/login' || pageInfo.path === '/register';
          const hasForm = isAuthPage
            ? await page.locator('form, button[type="submit"], input').first().isVisible().catch(() => false)
            : true;

          // 截图留念
          const safeName = pageInfo.name.replace(/[\/\\]/g, '-');
          await page.screenshot({
            path: `test-results/responsive-${safeName}-${key}.png`,
            fullPage: false,
          });

          await context.close();

          expect(hasOverflow).toBeFalsy();
          if (isAuthPage) {
            expect(hasForm).toBeTruthy();
          } else {
            expect(hasNav).toBeTruthy();
          }
        });
      }
    });
  }
});

test.describe('关键交互响应式', () => {
  test('手机端 — 登录表单按钮可达', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto('/login');
    await page.waitForTimeout(1500);

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    // 确保按钮在可视区域内（不需要滚动）
    const isInView = await submitBtn.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    expect(isInView).toBeTruthy();
    await context.close();
  });

  test('平板端 — 管理仪表板布局正常', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 834, height: 1194 } });
    const page = await context.newPage();
    await loginAsAdmin(page);
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);

    // 卡片区域应该有内容
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();
    // 至少有一些卡片
    expect(cardCount).toBeGreaterThan(0);
    await context.close();
  });

  test('手机端 — 发帖编辑器可用', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await loginAsUser(page);
    await page.goto('/feed');
    await page.waitForTimeout(2000);

    // PostComposer 编辑器区域应存在
    const editor = page.locator('textarea, [contenteditable], [class*="composer"]').first();
    const isVisible = await editor.isVisible().catch(() => false);
    expect(isVisible).toBeTruthy();
    await context.close();
  });
});
