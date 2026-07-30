# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-user-flow.spec.ts >> 普通用户功能 >> 发帖并发布
- Location: e2e\02-user-flow.spec.ts:28:7

# Error details

```
Test timeout of 60000ms exceeded while running "beforeEach" hook.
```

```
Error: expect(received).not.toContain(expected) // indexOf

Expected substring: not "/login"
Received string:        "http://localhost:3000/login"
```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - generic [ref=f3e4]:
    - generic [ref=f3e5]:
      - link "徐 徐霞客" [ref=f3e6] [cursor=pointer]:
        - /url: /
        - generic [ref=f3e7]: 徐
        - generic [ref=f3e9]: 徐霞客
      - paragraph [ref=f3e10]: 戴智能眼镜，连接志同道合的探索者
    - generic [ref=f3e11]:
      - generic [ref=f3e12]: 登录徐霞客系统
      - generic [ref=f3e14]:
        - generic [ref=f3e15]:
          - button "邮箱/用户名" [ref=f3e16]
          - button "手机号登录" [ref=f3e17]
        - generic [ref=f3e18]:
          - generic [ref=f3e19]:
            - text: 邮箱或用户名
            - textbox "输入邮箱或用户名" [ref=f3e24]
          - generic [ref=f3e25]:
            - text: 密码
            - generic [ref=f3e26]:
              - textbox "输入密码" [ref=f3e30]
              - button [ref=f3e31]
          - generic [ref=f3e35]:
            - text: 验证码
            - generic [ref=f3e36]:
              - textbox "请输入4位验证码" [ref=f3e40]
              - button [ref=f3e41]:
                - img "验证码" [ref=f3e42]
          - button "登录" [ref=f3e49]
          - generic [ref=f3e50]: 其他登录方式
          - generic [ref=f3e55]:
            - button "微信登录" [ref=f3e56]
            - button "支付宝登录" [ref=f3e59]
      - paragraph [ref=f3e63]:
        - text: 还没有账号？
        - link "立即注册" [ref=f3e64] [cursor=pointer]:
          - /url: /register
  - region "Notifications alt+T"
  - alert [ref=f3e65]
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
> 28 |   expect(page.url()).not.toContain('/login');
     |                          ^ Error: expect(received).not.toContain(expected) // indexOf
  29 | 
  30 |   // 将 captcha key 存到 localStorage 以防后续 API 调用需要 (不需要，直接用 token)
  31 |   return captchaResp;
  32 | }
  33 | 
  34 | /** 清除登录状态 */
  35 | export async function logout(page: Page) {
  36 |   // 先导航到基准 URL，确保有可操作的 document
  37 |   await page.goto('/login', { waitUntil: 'networkidle' }).catch(() => {});
  38 |   // 等待页面稳定
  39 |   await page.waitForTimeout(500);
  40 |   await page.evaluate(() => {
  41 |     try { localStorage.clear(); } catch {}
  42 |     try { sessionStorage.clear(); } catch {}
  43 |   });
  44 |   await page.context().clearCookies();
  45 | }
  46 | 
  47 | /** 普通用户登录 */
  48 | export async function loginAsUser(page: Page) {
  49 |   await loginAs(page, 'zhangshan');
  50 | }
  51 | 
  52 | /** 审核员登录 */
  53 | export async function loginAsModerator(page: Page) {
  54 |   await loginAs(page, 'lisi');
  55 | }
  56 | 
  57 | /** 管理员登录 */
  58 | export async function loginAsAdmin(page: Page) {
  59 |   await loginAs(page, 'xuxiake');
  60 | }
  61 | 
```