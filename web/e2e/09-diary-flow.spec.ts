import { test, expect } from '@playwright/test';
import { loginAsUser } from './auth.helper';

/**
 * 素材库多选 → 批量编辑页 → 存草稿 → 草稿箱 → 编辑 → 发布
 * 验证方案 A：统一流转（不再直接从素材库"发布"）
 */
test.describe('素材库多选日记流转', () => {
  test('多选 → 批量编辑 → 存草稿 → 草稿箱 → 发布 全链路', async ({ page }) => {
    await loginAsUser(page);

    // 1. 进入素材库
    await page.locator('a[href="/snap"]', { hasText: '素材库' }).click();
    await page.waitForURL('**/snap', { timeout: 15000 });

    // 2. 全部视图显示"今天"集合（刚同步的 3 条闪拍）
    await expect(page.getByText(/今天\s*3 张/)).toBeVisible({ timeout: 15000 });

    // 3. 进入"今天"集合视图（3 张闪拍素材卡片）
    await page.getByText(/今天\s*3 张/).click();
    await expect(page.locator('.aspect-square.cursor-pointer')).toHaveCount(3);

    // 4. 多选：勾选 3 张
    await page.getByRole('button', { name: '多选' }).click();
    for (let i = 0; i < 3; i++) {
      await page.locator('.aspect-square.cursor-pointer').nth(i).click();
    }
    await expect(page.getByText('已选 3 张')).toBeVisible();

    // 5. 点底部"写日记" → 打开创作引导 → 选"AI帮我写" → 跳批量编辑页（已选素材直接进模式步）
    await page.locator('.fixed.inset-x-0.bottom-0').getByRole('button', { name: '写日记' }).click();
    await page.getByRole('button', { name: /AI 帮我写/ }).click();
    await page.waitForURL(/\/snap\/generate\/batch\?ids=/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: '批量日记创作' })).toBeVisible();

    // 6. 素材墙展示 3 张缩略图
    await expect(page.getByText(/从 3 张素材智能生成一篇日记/)).toBeVisible();

    // 7. 等待 AI 生成草稿完成（编辑器正文出现）
    const contentArea = page.locator('textarea').first();
    await expect(contentArea).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(1000);
    const bodyText = await contentArea.inputValue();
    console.log('AI 生成正文长度:', bodyText.length);
    expect(bodyText.length).toBeGreaterThan(0);

    // 8. 修改标题后存草稿
    const titleInput = page.getByPlaceholder('给这篇日记起个标题...');
    await titleInput.fill('三座城的清晨与夜晚');
    await page.getByRole('button', { name: '存草稿' }).click();
    await expect(page.locator('text=草稿已保存').first()).toBeVisible({ timeout: 10000 });

    // 9. 跳转"我的日记" → 草稿 tab 出现草稿卡片（带"草稿"标签 + 虚线边框）
    await page.goto('http://localhost:3000/diaries');
    await page.waitForURL('**/diaries');
    await page.getByRole('button', { name: /草稿/ }).click();
    await expect(page.getByText('草稿', { exact: true }).first()).toBeVisible({ timeout: 15000 });
    const draftCard = page.locator('.border-dashed').first();
    await expect(draftCard).toBeVisible({ timeout: 10000 });

    // 10. 点击草稿卡片 → 回到批量编辑页（带 postId），标题为存草稿时保存的"三座城的清晨与夜晚"
    await draftCard.click();
    await page.waitForURL(/\/snap\/generate\/batch\?ids=.*postId=/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: '批量日记创作' })).toBeVisible();
    await expect(page.getByPlaceholder('给这篇日记起个标题...')).toHaveValue('三座城的清晨与夜晚', { timeout: 10000 });
    await expect(page.locator('textarea').first()).toHaveValue(/西湖|遇龙河|洪崖洞|晨雾|灯火/, { timeout: 10000 });

    // 11. 发布 → 跳日记广场
    await page.getByRole('button', { name: '发布' }).click();
    await page.waitForURL('**/snap/square', { timeout: 15000 });
    await expect(page.getByText('已发布到日记广场')).toBeVisible({ timeout: 10000 });
  });
});
