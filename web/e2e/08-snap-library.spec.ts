import { test, expect, Page } from '@playwright/test';
import { loginAsUser } from './auth.helper';

/** 左侧菜单栏素材库功能专项测试 */
test.describe('素材库（左侧菜单栏 → 素材库）', () => {
  test('浏览、分类筛选、集合、预览、多选 全链路', async ({ page }) => {
    await loginAsUser(page);

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
      await expect(page.getByRole('button', { name: tab })).toBeVisible();
    }

    // 5. 素材计数 badge 显示"1 条"（zhangshan 有 1 条日志素材）
    await expect(page.locator('span', { hasText: /^\d+ 条$/ })).toHaveText(/^1 条$/);

    // 6. 存在素材卡片，且带"日志"徽章
    const card = page.locator('.aspect-square.cursor-pointer').first();
    await expect(card).toBeVisible();
    await expect(card.getByText('日志')).toBeVisible();

    // 7. 切到"按地点"，出现地点集合卡片
    await page.getByRole('button', { name: '按地点' }).click();
    await expect(page.getByText('阳朔兴坪镇漓江边')).toBeVisible();
    await expect(page.getByText('1 张').first()).toBeVisible();

    // 8. 点击地点集合 → 打开集合视图，返回按钮 + 标题 + 计数
    await page.getByText('阳朔兴坪镇漓江边').click();
    await expect(page.getByRole('button', { name: '全部' })).toBeVisible();
    await expect(page.getByText('1 张', { exact: true })).toBeVisible();
    await expect(page.locator('.aspect-square.cursor-pointer')).toHaveCount(1);

    // 9. 返回全部视图
    await page.getByRole('button', { name: '全部' }).click();
    await expect(page.getByRole('heading', { name: '素材库' })).toBeVisible();

    // 10. 切到"按时间"视图，出现月份集合
    await page.getByRole('button', { name: '按时间' }).click();
    await expect(page.getByText('2026年8月6日').or(page.getByText('2026年8月5日')).or(page.getByText(/2026年8月\d+日/))).toBeVisible();

    // 11. 切到"按行程"视图（zhangshan 无行程数据，应显示空提示）
    await page.getByRole('button', { name: '按行程' }).click();
    await expect(page.getByText('该分类下暂无记录').or(page.getByText('暂无闪拍记录'))).toBeVisible({ timeout: 10000 });

    // 12. 回到"全部"视图
    await page.getByRole('button', { name: '全部' }).click();

    // 13. 点击素材卡片 → 打开全屏预览（相册式）
    await page.locator('.aspect-square.cursor-pointer').first().click();
    await expect(page.locator('text=1 / 1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 写日记' })).toBeVisible();
    // ESC 关闭预览
    await page.keyboard.press('Escape');
    await expect(page.locator('text=1 / 1')).not.toBeVisible();

    // 14. 多选模式：进入 → 勾选 → 已选 1 张 → 取消
    await page.getByRole('button', { name: '多选' }).click();
    await page.locator('.aspect-square.cursor-pointer').first().click();
    await expect(page.getByText('已选 1 张')).toBeVisible();
    await page.getByRole('button', { name: '取消' }).click();
    await expect(page.getByText('已选 1 张')).not.toBeVisible();

    // 15. AI 写日记主按钮存在且可用
    const aiBtn = page.getByRole('button', { name: 'AI 写日记' }).first();
    await expect(aiBtn).toBeVisible();
    await expect(aiBtn).toBeEnabled();
  });
});
