import { test, expect } from '@playwright/test';
import { loginAsUser } from './auth.helper';

/** 左侧菜单栏素材库功能专项测试（zhangshan 有 1 条日志素材） */
test.describe('素材库（左侧菜单栏 → 素材库）', () => {
  test('浏览、分类筛选、集合、预览、多选 全链路', async ({ page }) => {
    await loginAsUser(page);

    // 分类 Tab 行内的"全部"按钮（DOM 顺序先于集合视图返回按钮）
    const tabAll = () => page.getByRole('button', { name: '全部', exact: true }).first();

    // 1. 左侧菜单栏有"素材库"入口
    const sidebarItem = page.locator('a[href="/snap"]', { hasText: '素材库' });
    await expect(sidebarItem).toBeVisible({ timeout: 10000 });

    // 2. 点击进入素材库页面
    await sidebarItem.click();
    await page.waitForURL('**/snap', { timeout: 15000 });

    // 3. 页面标题与副标题
    await expect(page.getByRole('heading', { name: '素材库' })).toBeVisible();
    await expect(page.getByText('你的闪拍和日志素材')).toBeVisible();

    // 4. 分类 Tab：全部 / 按地点 / 按时间 / 按行程
    for (const tab of ['全部', '按地点', '按时间', '按行程']) {
      await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible();
    }

    // 5. 素材计数 badge 显示"1 条"
    await expect(page.locator('span', { hasText: /^\d+ 条$/ })).toHaveText(/^1 条$/);

    // 6. "全部"视图默认按天分组，显示集合卡片（2026年8月4日 1 张）
    const dayCard = page.getByText(/2026年8月4日\s*1 张/);
    await expect(dayCard).toBeVisible();

    // 7. 点击集合卡片 → 打开集合视图，出现素材卡片（带"日志"徽章）
    await dayCard.click();
    const snapCard = page.locator('.aspect-square.cursor-pointer').first();
    await expect(snapCard).toBeVisible();
    await expect(snapCard.getByText('日志')).toBeVisible();

    // 8. 点击素材卡片 → 打开全屏预览（相册式 1/1），ESC 关闭
    await snapCard.click();
    await expect(page.locator('text=1 / 1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 写日记' }).first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('text=1 / 1')).not.toBeVisible();

    // 9. 返回全部视图
    await tabAll().click();
    await expect(page.getByRole('heading', { name: '素材库' })).toBeVisible();

    // 10. 按地点视图：显示地点集合卡片 → 点击打开集合 → 素材卡片 1 张
    await page.getByRole('button', { name: '按地点' }).click();
    const locCard = page.getByText('阳朔兴坪镇漓江边');
    await expect(locCard).toBeVisible();
    await expect(page.getByText('1 张').first()).toBeVisible();
    await locCard.click();
    await expect(page.locator('.aspect-square.cursor-pointer')).toHaveCount(1);
    await tabAll().click();

    // 11. 按时间视图：显示按天集合
    await page.getByRole('button', { name: '按时间' }).click();
    await expect(page.getByText(/2026年8月4日/)).toBeVisible();

    // 12. 按行程视图（zhangshan 无行程数据，应显示空提示）
    await page.getByRole('button', { name: '按行程' }).click();
    await expect(page.getByText('暂无闪拍记录').or(page.getByText('该分类下暂无记录'))).toBeVisible({ timeout: 10000 });

    // 13. 回到全部视图，进入当天集合，测试多选模式
    await tabAll().click();
    await page.getByText(/2026年8月4日\s*1 张/).click();
    await expect(page.locator('.aspect-square.cursor-pointer')).toHaveCount(1);

    await page.getByRole('button', { name: '多选' }).click();
    await page.locator('.aspect-square.cursor-pointer').first().click();
    await expect(page.getByText('已选 1 张')).toBeVisible();
    await page.getByRole('button', { name: '取消' }).click();
    await expect(page.getByText('已选 1 张')).not.toBeVisible();

    // 14. AI 写日记主按钮存在且可用
    const aiBtn = page.getByRole('button', { name: 'AI 写日记' }).first();
    await expect(aiBtn).toBeVisible();
    await expect(aiBtn).toBeEnabled();
  });
});
