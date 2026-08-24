import { test, expect } from '@playwright/test';
import { loginAsUser, loginAsAdmin, loginAsModerator, logout } from './auth.helper';

test.describe('视觉快照对比', () => {
  test.describe.configure({ mode: 'serial' });

  test('登录页快照', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('注册页快照', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('register-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('信息流页快照 (已登录)', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/feed');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('feed-page.png', { fullPage: true, maxDiffPixels: 50000 });
  });

  test('探索页快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/discover');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('discover-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('发帖页快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/upload');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('upload-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('管理仪表板快照 (管理员)', async ({ page }) => {
    await logout(page);
    await loginAsAdmin(page);
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('admin-dashboard.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('审核队列快照 (审核员)', async ({ page }) => {
    await logout(page);
    await loginAsModerator(page);
    await page.goto('/admin/reviews');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('admin-reviews.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('用户管理页快照 (管理员)', async ({ page }) => {
    await logout(page);
    await loginAsAdmin(page);
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('admin-users.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('通知中心快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/notifications');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('notifications-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('个人设置快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/settings');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('settings-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('话题页快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/topics');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('topics-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('内容分类页快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/classified');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('classified-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('日记页快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/diaries');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('diaries-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });

  test('游记页快照', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/journeys');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('journeys-page.png', { fullPage: true, maxDiffPixels: 5000 });
  });
});
