import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helper';

/**
 * 复现：删除日记后，个人主页是否还残留
 * 流程：创建测试日记 → 打开 profile 记录帖子数 → API 删除日记 → 重新打开 profile 检查
 */
test.describe('个人主页删除日记同步', () => {
  test('删除日记后个人主页帖子数与列表同步', async ({ page }) => {
    test.setTimeout(120000);
    await loginAs(page, 'sunqi');

    // 1. 通过 API 创建一篇测试日记
    const capResp = await page.evaluate(async () => (await fetch('http://localhost:3001/api/auth/captcha')).json());
    const loginResp = await page.evaluate(async (key) => {
      const r = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: 'sunqi', password: 'password123', captchaKey: key, captchaCode: 'TEST1234' }),
      });
      return r.json();
    }, capResp.data.key);
    const token = loginResp.data.tokens.accessToken;

    const createResp = await page.evaluate(async (tok) => {
      const r = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ content: '临时测试日记-待删除', visibility: 'PRIVATE', contentLevel: 'DIARY', postType: 'NOTE' }),
      });
      return r.json();
    }, token);
    const newDiaryId = createResp.data.id;
    console.log('创建测试日记:', newDiaryId);

    // 2. 打开个人主页「在路上」，记录帖子数
    await page.goto('http://localhost:3000/profile/sunqi');
    await page.waitForURL('**/profile/sunqi');
    const countBefore = await page.locator('strong').first().textContent();
    console.log('删除前帖子数:', countBefore);

    // 3. API 删除该日记
    await page.evaluate(async ({ tok, id }) => {
      await fetch(`http://localhost:3001/api/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
    }, { tok: token, id: newDiaryId });

    // 4. 离开再回来（模拟刷新个人主页）
    await page.goto('http://localhost:3000/feed');
    await page.waitForURL('**/feed');
    await page.goto('http://localhost:3000/profile/sunqi');
    await page.waitForURL('**/profile/sunqi');

    const countAfter = await page.locator('strong').first().textContent();
    console.log('删除后帖子数:', countAfter);
    expect(Number(countAfter)).toBe(Number(countBefore) - 1);
  });
});
