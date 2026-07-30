import { Page, expect } from '@playwright/test';

/** 使用 TEST1234 万能验证码登录 */
export async function loginAs(page: Page, account: string, password = 'password123') {
  await page.goto('/login');
  // 获取验证码 key (直接调用后端 API)
  const captchaResp = await page.evaluate(async () => {
    const res = await fetch('http://localhost:3001/api/auth/captcha');
    const data = await res.json();
    return data.data.key;
  });

  // 填写表单
  await page.fill('input[placeholder*="邮箱"]', account);
  await page.fill('input[placeholder*="密码"]', password);
  await page.fill('input[placeholder*="验证码"]', 'TEST1234');

  // 提交登录 — 对验证码输入框按 Enter，触发表单提交
  await page.locator('input[placeholder*="验证码"]').press('Enter');
  await page.waitForTimeout(2000);

  // 等待跳转到首页 (feed)
  await page.waitForURL('**/feed', { timeout: 15000 }).catch(() => {
    // 可能跳转到 explore 或其他页面
  });

  // 验证已登录 — 检查页面不再在 /login
  expect(page.url()).not.toContain('/login');

  // 将 captcha key 存到 localStorage 以防后续 API 调用需要 (不需要，直接用 token)
  return captchaResp;
}

/** 清除登录状态 */
export async function logout(page: Page) {
  // 先导航到基准 URL，确保有可操作的 document
  await page.goto('/login', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.evaluate(() => {
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}
  });
  await page.context().clearCookies();
}

/** 普通用户登录 */
export async function loginAsUser(page: Page) {
  await loginAs(page, 'zhangshan');
}

/** 审核员登录 */
export async function loginAsModerator(page: Page) {
  await loginAs(page, 'lisi');
}

/** 管理员登录 */
export async function loginAsAdmin(page: Page) {
  await loginAs(page, 'xuxiake');
}
