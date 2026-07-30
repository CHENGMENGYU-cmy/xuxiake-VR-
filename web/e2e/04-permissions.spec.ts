import { test, expect } from '@playwright/test';
import { loginAsUser, logout } from './auth.helper';

test.describe('权限边界测试', () => {
  test.beforeEach(async ({ page }) => {
    await logout(page);
    await loginAsUser(page);
  });

  test('普通用户访问管理仪表板被拦截', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // 等待重定向或页面渲染完成
    try {
      await page.waitForURL((url) => !url.pathname.includes('/admin/dashboard'), { timeout: 8000 });
    } catch {
      // 如果 8 秒后仍未重定向，检查页面是否显示了权限不足的提示
    }
    // 最终 URL 不应在 admin 页面，或者在 admin 页面但显示了空/拒绝内容
    const isRedirected = !page.url().includes('/admin/dashboard');
    const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
    expect(isRedirected || hasNoAccess).toBeTruthy();
  });

  test('普通用户访问用户管理被拦截', async ({ page }) => {
    await page.goto('/admin/users');
    try {
      await page.waitForURL((url) => !url.pathname.includes('/admin/users'), { timeout: 8000 });
    } catch {}
    const isRedirected = !page.url().includes('/admin/users');
    const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
    expect(isRedirected || hasNoAccess).toBeTruthy();
  });

  test('普通用户访问审核页被拦截', async ({ page }) => {
    await page.goto('/admin/reviews');
    try {
      await page.waitForURL((url) => !url.pathname.includes('/admin/reviews'), { timeout: 8000 });
    } catch {}
    const isRedirected = !page.url().includes('/admin/reviews');
    const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
    expect(isRedirected || hasNoAccess).toBeTruthy();
  });

  test('普通用户访问举报管理被拦截', async ({ page }) => {
    await page.goto('/admin/reports');
    try {
      await page.waitForURL((url) => !url.pathname.includes('/admin/reports'), { timeout: 8000 });
    } catch {}
    const isRedirected = !page.url().includes('/admin/reports');
    const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
    expect(isRedirected || hasNoAccess).toBeTruthy();
  });
});
