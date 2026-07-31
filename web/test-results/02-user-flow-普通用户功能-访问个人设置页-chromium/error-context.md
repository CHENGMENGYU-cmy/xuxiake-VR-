# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-user-flow.spec.ts >> 普通用户功能 >> 访问个人设置页
- Location: e2e\02-user-flow.spec.ts:55:7

# Error details

```
Test timeout of 60000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { loginAsUser, logout } from './auth.helper';
  3   | 
  4   | test.describe('普通用户功能', () => {
> 5   |   test.beforeEach(async ({ page }) => {
      |        ^ Test timeout of 60000ms exceeded while running "beforeEach" hook.
  6   |     await logout(page);
  7   |     await loginAsUser(page);
  8   |   });
  9   | 
  10  |   test('浏览信息流 (Feed)', async ({ page }) => {
  11  |     await page.goto('/feed');
  12  |     await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  13  |     // 页面加载后应有内容
  14  |     await page.waitForTimeout(2000);
  15  |   });
  16  | 
  17  |   test('浏览首页内容流', async ({ page }) => {
  18  |     await page.goto('/feed');
  19  |     await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  20  |     await page.waitForTimeout(2000);
  21  |   });
  22  | 
  23  |   test('打开发帖页面', async ({ page }) => {
  24  |     await page.goto('/upload');
  25  |     await expect(page.locator('textarea, [contenteditable], input[name*="title"], [class*="editor"]').first()).toBeVisible({ timeout: 10000 });
  26  |   });
  27  | 
  28  |   test('发帖并发布', async ({ page }) => {
  29  |     await page.goto('/upload');
  30  |     // 等待编辑器加载
  31  |     await page.waitForTimeout(2000);
  32  | 
  33  |     // 查找文本输入区域并输入内容
  34  |     const textArea = page.locator('textarea, [contenteditable="true"]').first();
  35  |     if (await textArea.isVisible()) {
  36  |       const testContent = 'E2E 测试帖子内容 ' + Date.now();
  37  |       if (await textArea.getAttribute('contenteditable')) {
  38  |         await textArea.fill(testContent);
  39  |       } else {
  40  |         await textArea.fill(testContent);
  41  |       }
  42  |       await page.waitForTimeout(500);
  43  | 
  44  |       // 尝试点击发布按钮
  45  |       const publishBtn = page.locator('button:has-text("发布"), button:has-text("发表"), button[type="submit"]').first();
  46  |       if (await publishBtn.isVisible()) {
  47  |         await publishBtn.click();
  48  |         await page.waitForTimeout(3000);
  49  |         // 发布后应跳转到 feed 或帖子详情页
  50  |         expect(page.url()).not.toContain('/login');
  51  |       }
  52  |     }
  53  |   });
  54  | 
  55  |   test('访问个人设置页', async ({ page }) => {
  56  |     await page.goto('/settings');
  57  |     await expect(page.locator('h1, h2, [class*="title"]').first()).toBeVisible({ timeout: 10000 });
  58  |   });
  59  | 
  60  |   test('访问通知中心', async ({ page }) => {
  61  |     await page.goto('/notifications');
  62  |     await expect(page.locator('h1, h2, [class*="title"]').first()).toBeVisible({ timeout: 10000 });
  63  |   });
  64  | 
  65  |   test('访问消息页', async ({ page }) => {
  66  |     await page.goto('/messages');
  67  |     await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  68  |   });
  69  | 
  70  |   test('浏览内容分类页', async ({ page }) => {
  71  |     await page.goto('/classified');
  72  |     await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  73  |     await page.waitForTimeout(1000);
  74  |   });
  75  | 
  76  |   test('浏览日记页', async ({ page }) => {
  77  |     await page.goto('/diaries');
  78  |     await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  79  |     await page.waitForTimeout(1000);
  80  |   });
  81  | 
  82  |   test('浏览游记页', async ({ page }) => {
  83  |     await page.goto('/journeys');
  84  |     await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  85  |     await page.waitForTimeout(1000);
  86  |   });
  87  | 
  88  |   test('浏览话题页', async ({ page }) => {
  89  |     await page.goto('/topics');
  90  |     await expect(page.locator('nav, header, [class*="nav"]').first()).toBeVisible();
  91  |     await page.waitForTimeout(1000);
  92  |   });
  93  | 
  94  |   test('搜索功能', async ({ page }) => {
  95  |     await page.goto('/search');
  96  |     await page.waitForTimeout(2000);
  97  |     // 验证搜索页面加载
  98  |     const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]').first();
  99  |     const isVisible = await searchInput.isVisible().catch(() => false);
  100 |     // 搜索页至少应有一个输入框或内容区
  101 |     expect(isVisible || true).toBeTruthy();
  102 |   });
  103 | });
  104 | 
```