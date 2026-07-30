# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-user-flow.spec.ts >> 普通用户功能 >> 浏览信息流 (Feed)
- Location: e2e\02-user-flow.spec.ts:10:7

# Error details

```
Test timeout of 60000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="邮箱"]')

```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=f1e3]:
      - generic [ref=f1e4]:
        - navigation [ref=f1e6]:
          - button [disabled] [ref=f1e7]:
            - img "previous" [ref=f1e8]
          - generic [ref=f1e10]:
            - generic [ref=f1e11]: 1/
            - text: "1"
          - button [disabled] [ref=f1e12]:
            - img "next" [ref=f1e13]
        - link "Next.js 16.2.9 (stale) Turbopack" [ref=f1e16] [cursor=pointer]:
          - /url: https://nextjs.org/docs/messages/version-staleness
          - generic "There is a newer version (16.2.12) available, upgrade recommended!" [ref=f1e19]: Next.js 16.2.9 (stale)
          - generic [ref=f1e20]: Turbopack
      - dialog "Build Error" [ref=f1e22]:
        - generic [ref=f1e25]:
          - generic [ref=f1e26]:
            - generic [ref=f1e27]:
              - generic [ref=f1e28]: Build Error
              - generic [ref=f1e30]:
                - button "Copy Error Info" [ref=f1e31] [cursor=pointer]
                - button "No related documentation found" [disabled] [ref=f1e34]
                - button "Attach Node.js inspector" [ref=f1e37] [cursor=pointer]
            - generic [ref=f1e46]: Export MoodType doesn't exist in target module
          - generic [ref=f1e49]:
            - generic [ref=f1e51]:
              - generic [ref=f1e56]: ./src/app/(main)/upload/page.tsx (18:1)
              - button "Open in editor" [ref=f1e57] [cursor=pointer]
            - generic [ref=f1e62]:
              - generic [ref=f1e63]: Export MoodType doesn't exist in target module
              - generic [ref=f1e64]: 16 |
              - generic [ref=f1e65]: ...
              - text: atePostPayload
              - generic [ref=f1e66]: "}"
              - text: from '@/lib/post-api'
              - generic [ref=f1e67]: ;
              - generic [ref=f1e68]: 17 |
              - generic [ref=f1e69]: "...{"
              - text: VrFormat
              - generic [ref=f1e70]: ","
              - text: Topic
              - generic [ref=f1e71]: ","
              - text: Community
              - generic [ref=f1e72]: ","
              - text: Visibility
              - generic [ref=f1e73]: ","
              - text: MoodType
              - generic [ref=f1e74]: ","
              - text: WeatherType
              - generic [ref=f1e75]: "}"
              - text: from '@/types'
              - generic [ref=f1e76]: ;
              - text: ">"
              - generic [ref=f1e77]: 18 |
              - generic [ref=f1e78]: ...
              - text: dEmoji
              - generic [ref=f1e79]: ","
              - text: WeatherEmoji
              - generic [ref=f1e80]: ","
              - text: MoodType as MoodTypeArray
              - generic [ref=f1e81]: ","
              - text: WeatherType as WeatherTypeArray
              - generic [ref=f1e82]: "}"
              - text: from...
              - generic [ref=f1e83]: "|"
              - text: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              - generic [ref=f1e84]: 19 |
              - generic [ref=f1e85]: "...}"
              - text: from '@/lib/utils'
              - generic [ref=f1e86]: ;
              - generic [ref=f1e87]: 20 |
              - generic [ref=f1e88]: ...
              - text: tiImageUploader
              - generic [ref=f1e89]: ","
              - text: UploadedImage
              - generic [ref=f1e90]: "}"
              - text: from '@/components/upload/multi-image-uploader'
              - generic [ref=f1e91]: ;
              - generic [ref=f1e92]: 21 |
              - generic [ref=f1e93]: ...
              - text: hGuard
              - generic [ref=f1e94]: "}"
              - text: from '@/components/auth-guard'
              - generic [ref=f1e95]: "; The export MoodType was not found in module [project]/src/types/index.ts [app-client] (ecmascript). Did you mean to import MoodLabel? All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist. Import traces: Client Component Browser: ./src/app/(main)/upload/page.tsx [Client Component Browser] ./src/app/(main)/upload/page.tsx [Server Component] Client Component SSR: ./src/app/(main)/upload/page.tsx [Client Component SSR] ./src/app/(main)/upload/page.tsx [Server Component]"
        - generic [ref=f1e96]: "1"
        - generic [ref=f1e97]: "2"
    - button "Open issues overlay" [ref=f1e104] [cursor=pointer]:
      - generic [ref=f1e108]:
        - generic [ref=f1e109]: "0"
        - generic [ref=f1e110]: "1"
      - generic [ref=f1e111]: Issue
  - alert [ref=f1e112]
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
> 14 |   await page.fill('input[placeholder*="邮箱"]', account);
     |              ^ Error: page.fill: Test timeout of 60000ms exceeded.
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