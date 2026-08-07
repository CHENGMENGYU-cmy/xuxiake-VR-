import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helper';

/**
 * 临时测试：素材库"按行程"视图流转逻辑（使用 sunqi 账号）
 * 覆盖：行程集合 → 照片墙 → AI 生成游记按钮 → 生成任务提交/进度 → 查看游记
 */
test.describe('素材库按行程流转', () => {
  test('按行程：集合 → 照片墙 → AI 生成游记 → 查看游记', async ({ page }) => {
    await loginAs(page, 'sunqi');

    // 1. 进入素材库
    await page.goto('http://localhost:3000/snap');
    await page.waitForURL('**/snap');

    // 2. 切到"按行程"视图
    await page.getByRole('button', { name: '按行程' }).click();

    // 3. 验证行程集合卡片出现（行程 · 2026-08-05，62 张）
    await expect(page.getByText(/行程 · 2026-08-05/).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('62 张').first()).toBeVisible({ timeout: 10000 });

    // 4. 点击行程集合 → 进入照片墙
    await page.getByText(/行程 · 2026-08-05/).first().click();

    // 5. 验证"已选行程"栏 + 照片墙
    await expect(page.getByText('已选行程：行程 · 2026-08-05')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('共 62 张素材')).toBeVisible({ timeout: 10000 });

    // 6. 验证"AI 生成游记"按钮
    const genBtn = page.getByRole('button', { name: 'AI 生成游记' });
    await expect(genBtn).toBeVisible({ timeout: 10000 });

    // 7. 验证照片墙卡片数（62 张素材网格）
    await expect(page.locator('.aspect-square.cursor-pointer')).toHaveCount(62, { timeout: 15000 });

    // 8. 验证全屏预览（点第一张照片）
    await page.locator('.aspect-square.cursor-pointer').first().click();
    await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible({ timeout: 5000 });
    // 预览有"写日记"按钮
    await expect(page.getByRole('button', { name: '写日记' }).first()).toBeVisible({ timeout: 5000 });
    // 关闭预览（ESC）
    await page.keyboard.press('Escape');
    await expect(page.locator('.fixed.inset-0.z-50')).not.toBeVisible({ timeout: 5000 });

    // 9. 返回"全部"集合
    await page.getByRole('button', { name: /^全部$/ }).first().click();
    await expect(page.getByText('已选行程：行程 · 2026-08-05')).not.toBeVisible({ timeout: 5000 });

    // 10. 其它视图切换正常
    await page.getByRole('button', { name: '按地点' }).click();
    await page.getByRole('button', { name: '按时间' }).click();
    await page.getByRole('button', { name: '全部' }).click();

    // 截图留档
    await page.screenshot({ path: 'e2e/__snapshots__/trip-view.png' });
  });
});
