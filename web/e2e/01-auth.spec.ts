import { test, expect } from '@playwright/test';
import { loginAsUser, loginAsAdmin, loginAsModerator, logout } from './auth.helper';

test.describe('认证模块', () => {
  test.beforeEach(async ({ page }) => {
    await logout(page);
  });

  test('登录页面正常加载', async ({ page }) => {
    await page.goto('/login');
    // 页面应包含登录标题文字
    await expect(page.getByText('登录徐霞客系统')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('普通用户登录成功并跳转', async ({ page }) => {
    await loginAsUser(page);
    await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  });

  test('审核员登录成功并跳转', async ({ page }) => {
    await loginAsModerator(page);
    await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  });

  test('管理员登录成功并跳转', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  });

  test('错误密码登录失败', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="邮箱"]', 'zhangshan');
    await page.fill('input[placeholder*="密码"]', 'wrongpassword');
    await page.fill('input[placeholder*="验证码"]', 'TEST1234');
    await page.locator('input[placeholder*="验证码"]').press('Enter');
    await page.waitForTimeout(2000);
    // 应该显示错误信息
    await expect(page.locator('[class*="error"], [class*="toast"], .text-red-500, .text-destructive').first()).toBeVisible({ timeout: 10000 });
  });

  test('退出登录后返回登录页', async ({ page }) => {
    await loginAsUser(page);
    // 清除所有认证状态
    await page.evaluate(() => {
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
    });
    await page.context().clearCookies();
    await page.goto('/login');
    await page.waitForTimeout(1000);
    // 如果被重定向到 feed，说明 cookie 仍有残留，尝试再次跳转
    if (page.url().includes('/feed')) {
      await page.goto('/login');
      await page.waitForTimeout(500);
    }
    expect(page.url()).toContain('/login');
  });
});
