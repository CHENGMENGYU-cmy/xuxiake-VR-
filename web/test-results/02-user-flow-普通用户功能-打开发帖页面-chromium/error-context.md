# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-user-flow.spec.ts >> 普通用户功能 >> 打开发帖页面
- Location: e2e\02-user-flow.spec.ts:23:7

# Error details

```
Error: page.evaluate: Execution context was destroyed, most likely because of a navigation
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | 
  3  | /** 使用 TEST1234 万能验证码登录 */
  4  | export async function loginAs(page: Page, account: string, password = 'password123') {
  5  |   await page.goto('/login');
  6  |   // 获取验证码 key (直接调用后端 API)
  7  |   const captchaResp = await page.evaluate(async () => {
  8  |     const res = await fetch('http://localhost:3001/api/auth/captcha');
  9  |     const data = await res.json();
  10 |     return data.data.key;
  11 |   });
  12 | 
  13 |   // 填写表单
  14 |   await page.fill('input[placeholder*="邮箱"]', account);
  15 |   await page.fill('input[placeholder*="密码"]', password);
  16 |   await page.fill('input[placeholder*="验证码"]', 'TEST1234');
  17 | 
  18 |   // 提交登录 — 对验证码输入框按 Enter，触发表单提交
  19 |   await page.locator('input[placeholder*="验证码"]').press('Enter');
  20 |   await page.waitForTimeout(2000);
  21 | 
  22 |   // 等待跳转到首页 (feed)
  23 |   await page.waitForURL('**/feed', { timeout: 15000 }).catch(() => {
  24 |     // 可能跳转到 explore 或其他页面
  25 |   });
  26 | 
  27 |   // 验证已登录 — 检查页面不再在 /login
  28 |   expect(page.url()).not.toContain('/login');
  29 | 
  30 |   // 将 captcha key 存到 localStorage 以防后续 API 调用需要 (不需要，直接用 token)
  31 |   return captchaResp;
  32 | }
  33 | 
  34 | /** 清除登录状态 */
  35 | export async function logout(page: Page) {
  36 |   // 先导航到基准 URL，确保有可操作的 document
  37 |   await page.goto('/login', { waitUntil: 'domcontentloaded' }).catch(() => {});
> 38 |   await page.evaluate(() => {
     |              ^ Error: page.evaluate: Execution context was destroyed, most likely because of a navigation
  39 |     try { localStorage.clear(); } catch {}
  40 |     try { sessionStorage.clear(); } catch {}
  41 |   });
  42 |   await page.context().clearCookies();
  43 | }
  44 | 
  45 | /** 普通用户登录 */
  46 | export async function loginAsUser(page: Page) {
  47 |   await loginAs(page, 'zhangshan');
  48 | }
  49 | 
  50 | /** 审核员登录 */
  51 | export async function loginAsModerator(page: Page) {
  52 |   await loginAs(page, 'lisi');
  53 | }
  54 | 
  55 | /** 管理员登录 */
  56 | export async function loginAsAdmin(page: Page) {
  57 |   await loginAs(page, 'xuxiake');
  58 | }
  59 | 
```