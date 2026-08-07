import { test, expect } from '@playwright/test';
import { loginAsUser } from './auth.helper';

// 临时验证：写日记统一创作流程（素材库入口 → 手写；我的日记入口 → AI）
test('统一创作流程·素材库入口→选素材→手写→配图引用', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('http://localhost:3000/snap');
  await page.waitForURL('**/snap');

  // 右上角"写日记"（原"AI 写日记"）
  await expect(page.getByRole('button', { name: '写日记' }).first()).toBeVisible();
  await page.getByRole('button', { name: '写日记' }).first().click();

  // 引导弹层 material 步（未选素材）
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog.getByRole('heading', { name: '选择素材' })).toBeVisible();

  // 素材网格出现素材卡片
  const card = dialog.locator('button.aspect-square').first();
  await expect(card).toBeVisible({ timeout: 15000 });

  // 勾选第一张 → 下一步 → mode 步
  await card.click();
  await dialog.getByRole('button', { name: /下一步/ }).click();
  await expect(dialog.getByRole('heading', { name: '选择创作方式' })).toBeVisible();

  // 点"自己写" → 跳 upload 带 snapIds
  await dialog.getByRole('button', { name: /自己写/ }).click();
  await page.waitForURL(/\/upload\?level=DIARY&snapIds=/, { timeout: 15000 });

  // upload 页：从素材库选择按钮 + 引用素材已加载为配图（严格断言 1/9）
  await expect(page.getByRole('button', { name: '从素材库选择' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('图片 (1/9)')).toBeVisible({ timeout: 15000 });
});

test('统一创作流程·我的日记入口→选素材→AI帮我写→batch', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('http://localhost:3000/diaries');
  await page.waitForURL('**/diaries');

  // 我的日记右上角"写日记"
  await page.getByRole('button', { name: '写日记' }).click();
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog.getByRole('heading', { name: '选择素材' })).toBeVisible();

  // 勾选一张 → 下一步 → AI 帮我写 → 跳 batch
  const card = dialog.locator('button.aspect-square').first();
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.click();
  await dialog.getByRole('button', { name: /下一步/ }).click();
  await dialog.getByRole('button', { name: /AI 帮我写/ }).click();
  await page.waitForURL(/\/snap\/generate\/batch\?ids=/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: '批量日记创作' })).toBeVisible({ timeout: 15000 });
});

test('统一创作流程·素材库多选→直接进模式步→AI', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('http://localhost:3000/snap');
  await page.waitForURL('**/snap');

  // 进入集合视图（点"2026年8月4日 1 张"集合卡片），出现素材卡片
  await page.getByText(/2026年8月4日\s*1 张/).click();
  await expect(page.locator('.aspect-square.cursor-pointer')).toHaveCount(1);

  // 多选勾选素材
  await page.getByRole('button', { name: '多选' }).click();
  await page.locator('.aspect-square.cursor-pointer').first().click();
  await expect(page.getByText('已选 1 张')).toBeVisible();

  // 底部"写日记" → 引导直接进 mode 步（已选素材，跳过选素材）
  await page.locator('.fixed.inset-x-0.bottom-0').getByRole('button', { name: '写日记' }).click();
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog.getByRole('heading', { name: '选择创作方式' })).toBeVisible();
  await dialog.getByRole('button', { name: /AI 帮我写/ }).click();
  await page.waitForURL(/\/snap\/generate\/batch\?ids=/, { timeout: 15000 });
});

test('手写编辑器·从素材库选择补充配图', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('http://localhost:3000/upload?level=DIARY');
  await page.waitForURL('**/upload?level=DIARY');

  // "从素材库选择"按钮 → 弹选择器 → 勾选 → 确认 → 配图增加
  await expect(page.getByRole('button', { name: '从素材库选择' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: '从素材库选择' }).click();
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog.getByRole('heading', { name: '选择素材' })).toBeVisible();
  const card = dialog.locator('button.aspect-square').first();
  await expect(card).toBeVisible({ timeout: 15000 });
  await card.click();
  await dialog.getByRole('button', { name: /确认/ }).click();
  await expect(page.getByText('图片 (1/9)')).toBeVisible({ timeout: 15000 });
});
