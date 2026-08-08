import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helper';

test.describe('个人主页帖子数最终验证', () => {
  test('帖子数=8 且日记筛选不含草稿', async ({ page }) => {
    test.setTimeout(90000);
    await loginAs(page, 'sunqi');

    // 1. 个人主页帖子数应为 8（5 日记非草稿 + 3 游记）
    await page.goto('http://localhost:3000/profile/sunqi');
    await page.waitForURL('**/profile/sunqi');
    await expect(page.locator('strong').first()).toBeVisible({ timeout: 15000 });
    const postCount = Number(await page.locator('strong').first().textContent());
    console.log('个人主页帖子数:', postCount);
    expect(postCount).toBe(8);

    // 2. 切到「日记」筛选，草稿（八月的光与影）不应出现
    await page.getByRole('button', { name: '日记', exact: true }).click();
    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').innerText();
    console.log('含草稿"八月的光与影":', bodyText.includes('八月的光与影'));
    expect(bodyText.includes('八月的光与影')).toBe(false);
    console.log('含正常日记"从一束光开始":', bodyText.includes('从一束光开始'));
    expect(bodyText.includes('从一束光开始')).toBe(true);
  });
});
