# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-permissions.spec.ts >> 权限边界测试 >> 普通用户访问管理仪表板被拦截
- Location: e2e\04-permissions.spec.ts:10:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=f2e1]:
  - generic [active]:
    - generic [ref=f2e4]:
      - generic [ref=f2e5]:
        - navigation [ref=f2e7]:
          - button [disabled] [ref=f2e8]:
            - img "previous" [ref=f2e9]
          - generic [ref=f2e11]:
            - generic [ref=f2e12]: 1/
            - text: "2"
          - button [ref=f2e13] [cursor=pointer]:
            - img "next" [ref=f2e14]
        - link "Next.js 16.2.9 (stale) Turbopack" [ref=f2e17] [cursor=pointer]:
          - /url: https://nextjs.org/docs/messages/version-staleness
          - generic "There is a newer version (16.2.12) available, upgrade recommended!" [ref=f2e20]: Next.js 16.2.9 (stale)
          - generic [ref=f2e21]: Turbopack
      - generic [ref=f2e22]:
        - dialog "Console Error" [ref=f2e23]:
          - generic [ref=f2e26]:
            - generic [ref=f2e27]:
              - generic [ref=f2e28]:
                - generic [ref=f2e29]: Console Error
                - generic [ref=f2e31]:
                  - button "Copy Error Info" [ref=f2e32] [cursor=pointer]
                  - link "Go to related documentation" [ref=f2e35] [cursor=pointer]:
                    - /url: https://react.dev/link/rules-of-hooks
                  - button "Attach Node.js inspector" [ref=f2e38] [cursor=pointer]
              - generic [ref=f2e47]:
                - generic [ref=f2e48]:
                  - text: "React has detected a change in the order of Hooks called by RightPanel. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks:"
                  - link "https://react.dev/link/rules-of-hooks" [ref=f2e49] [cursor=pointer]:
                    - /url: https://react.dev/link/rules-of-hooks
                  - text: Previous render Next render ------------------------------------------------------ 1. useCallback useCallback 2. useCallback useCallback 3. useSyncExternalStore useSyncExternalStore 4. useDebugValue useDebugValue 5. useCallback useCallback 6. useCallback useCallback 7. useSyncExternalStore useSyncExternalStore 8. useDebugValue useDebugValue 9. useState useState 10. useEffect useEffect 11. undefined useState ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                - button "Show More" [ref=f2e51] [cursor=pointer]
            - generic [ref=f2e52]:
              - generic [ref=f2e53]:
                - paragraph [ref=f2e55]:
                  - generic [ref=f2e60]: src\app\(main)\layout.tsx (21:9) @ MainLayout
                  - button "Open in editor" [ref=f2e61] [cursor=pointer]
                - generic [ref=f2e66]:
                  - generic [ref=f2e67]: 19 | </div>
                  - generic [ref=f2e68]: 20 | </main>
                  - generic [ref=f2e69]: "> 21 | <RightPanel />"
                  - generic [ref=f2e70]: "| ^"
                  - generic [ref=f2e71]: 22 | </div>
                  - generic [ref=f2e72]: 23 | <MobileNav />
                  - generic [ref=f2e73]: 24 | </>
              - generic [ref=f2e74]:
                - paragraph [ref=f2e76]:
                  - text: Call Stack
                  - generic [ref=f2e77]: "22"
                - generic [ref=f2e78]:
                  - generic [ref=f2e79]:
                    - text: createConsoleError
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e80] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_1ybzpk2._.js (2379:71)
                - generic [ref=f2e83]:
                  - generic [ref=f2e84]:
                    - text: handleConsoleError
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e85] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_1ybzpk2._.js (3165:54)
                - generic [ref=f2e88]:
                  - generic [ref=f2e89]:
                    - text: console.error
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e90] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_1ybzpk2._.js (3312:57)
                - generic [ref=f2e93]:
                  - generic [ref=f2e94]:
                    - text: updateHookTypesDev
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e95] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (4587:25)
                - generic [ref=f2e98]:
                  - generic [ref=f2e99]:
                    - text: Object.useState
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e100] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (15488:13)
                - generic [ref=f2e103]:
                  - generic [ref=f2e104]:
                    - text: exports.useState
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e105] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_1amofcm._.js (1754:36)
                - generic [ref=f2e108]:
                  - generic [ref=f2e109]:
                    - text: RightPanel
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e110] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/src_1-jyi74._.js (4183:239)
                - generic [ref=f2e113]:
                  - generic [ref=f2e114]:
                    - text: Object.react_stack_bottom_frame
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e115] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (15037:24)
                - generic [ref=f2e118]:
                  - generic [ref=f2e119]:
                    - text: renderWithHooks
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e120] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (4620:24)
                - generic [ref=f2e123]:
                  - generic [ref=f2e124]:
                    - text: updateFunctionComponent
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e125] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (6081:21)
                - generic [ref=f2e128]:
                  - generic [ref=f2e129]:
                    - text: beginWork
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e130] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (6691:24)
                - generic [ref=f2e133]:
                  - generic [ref=f2e134]:
                    - text: runWithFiberInDEV
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e135] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (965:74)
                - generic [ref=f2e138]:
                  - generic [ref=f2e139]:
                    - text: performUnitOfWork
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e140] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (9555:97)
                - generic [ref=f2e143]:
                  - generic [ref=f2e144]:
                    - text: workLoopSync
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e145] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (9449:40)
                - generic [ref=f2e148]:
                  - generic [ref=f2e149]:
                    - text: renderRootSync
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e150] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (9433:13)
                - generic [ref=f2e153]:
                  - generic [ref=f2e154]:
                    - text: performWorkOnRoot
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e155] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (9061:186)
                - generic [ref=f2e158]:
                  - generic [ref=f2e159]:
                    - text: performSyncWorkOnRoot
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e160] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (10263:9)
                - generic [ref=f2e163]:
                  - generic [ref=f2e164]:
                    - text: flushSyncWorkAcrossRoots_impl
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e165] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (10179:316)
                - generic [ref=f2e168]:
                  - generic [ref=f2e169]:
                    - text: flushPassiveEffects
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e170] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (10008:13)
                - generic [ref=f2e173]:
                  - generic [ref=f2e174]:
                    - text: <unknown>
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e175] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_react-dom_096_9a-._.js (9724:13)
                - generic [ref=f2e178]:
                  - generic [ref=f2e179]:
                    - text: MessagePort.performWorkUntilDeadline
                    - button "Sourcemapping failed. Click to log cause of error." [ref=f2e180] [cursor=pointer]
                  - text: file:///D:/Other/Cluade%20CodeProjects/XuXiaKe/web/.next/dev/static/chunks/node_modules_next_dist_compiled_1amofcm._.js (2647:64)
                - generic [ref=f2e183]:
                  - generic [ref=f2e184]:
                    - text: MainLayout
                    - button "Open MainLayout in editor" [ref=f2e185] [cursor=pointer]
                  - text: src\app\(main)\layout.tsx (21:9)
          - generic [ref=f2e188]: "1"
          - generic [ref=f2e189]: "2"
        - contentinfo [ref=f2e190]:
          - region "Error feedback" [ref=f2e191]:
            - paragraph [ref=f2e192]:
              - link "Was this helpful?" [ref=f2e193] [cursor=pointer]:
                - /url: https://nextjs.org/telemetry#error-feedback
            - button "Mark as helpful" [ref=f2e194] [cursor=pointer]
            - button "Mark as not helpful" [ref=f2e198] [cursor=pointer]
    - generic [ref=f2e206] [cursor=pointer]:
      - button "Open issues overlay" [ref=f2e207]:
        - generic [ref=f2e211]:
          - generic [ref=f2e212]: "1"
          - generic [ref=f2e213]: "2"
        - generic [ref=f2e214]:
          - text: Issue
          - generic [ref=f2e215]: s
      - button "Collapse issues badge" [ref=f2e216]
  - generic [ref=f2e220]:
    - heading "This page couldn’t load" [level=1] [ref=f2e223]
    - paragraph [ref=f2e224]: Reload to try again, or go back.
    - generic [ref=f2e225]:
      - button "Reload" [ref=f2e227] [cursor=pointer]
      - button "Back" [ref=f2e228] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { loginAsUser, logout } from './auth.helper';
  3  | 
  4  | test.describe('权限边界测试', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await logout(page);
  7  |     await loginAsUser(page);
  8  |   });
  9  | 
  10 |   test('普通用户访问管理仪表板被拦截', async ({ page }) => {
  11 |     await page.goto('/admin/dashboard');
  12 |     // 等待重定向或页面渲染完成
  13 |     try {
  14 |       await page.waitForURL((url) => !url.pathname.includes('/admin/dashboard'), { timeout: 8000 });
  15 |     } catch {
  16 |       // 如果 8 秒后仍未重定向，检查页面是否显示了权限不足的提示
  17 |     }
  18 |     // 最终 URL 不应在 admin 页面，或者在 admin 页面但显示了空/拒绝内容
  19 |     const isRedirected = !page.url().includes('/admin/dashboard');
  20 |     const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
> 21 |     expect(isRedirected || hasNoAccess).toBeTruthy();
     |                                         ^ Error: expect(received).toBeTruthy()
  22 |   });
  23 | 
  24 |   test('普通用户访问用户管理被拦截', async ({ page }) => {
  25 |     await page.goto('/admin/users');
  26 |     try {
  27 |       await page.waitForURL((url) => !url.pathname.includes('/admin/users'), { timeout: 8000 });
  28 |     } catch {}
  29 |     const isRedirected = !page.url().includes('/admin/users');
  30 |     const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
  31 |     expect(isRedirected || hasNoAccess).toBeTruthy();
  32 |   });
  33 | 
  34 |   test('普通用户访问审核页被拦截', async ({ page }) => {
  35 |     await page.goto('/admin/reviews');
  36 |     try {
  37 |       await page.waitForURL((url) => !url.pathname.includes('/admin/reviews'), { timeout: 8000 });
  38 |     } catch {}
  39 |     const isRedirected = !page.url().includes('/admin/reviews');
  40 |     const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
  41 |     expect(isRedirected || hasNoAccess).toBeTruthy();
  42 |   });
  43 | 
  44 |   test('普通用户访问举报管理被拦截', async ({ page }) => {
  45 |     await page.goto('/admin/reports');
  46 |     try {
  47 |       await page.waitForURL((url) => !url.pathname.includes('/admin/reports'), { timeout: 8000 });
  48 |     } catch {}
  49 |     const isRedirected = !page.url().includes('/admin/reports');
  50 |     const hasNoAccess = await page.getByText('无权', '没有权限').isVisible().catch(() => false);
  51 |     expect(isRedirected || hasNoAccess).toBeTruthy();
  52 |   });
  53 | });
  54 | 
```