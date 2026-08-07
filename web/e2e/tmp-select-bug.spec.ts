import { test, expect } from '@playwright/test';
import { loginAsUser } from './auth.helper';

test('复现：集合视图多选点圆圈勾不上', async ({ page }) => {
  await loginAsUser(page);

  // 进入素材库
  await page.locator('a[href="/snap"]', { hasText: '素材库' }).click();
  await page.waitForURL('**/snap', { timeout: 15000 });

  // 点击当天集合卡片进入集合视图
  await page.getByText(/2026年8月\d+日\s*1 张/).click();
  await expect(page.locator('.aspect-square.cursor-pointer')).toHaveCount(1);

  // 进入多选模式
  await page.getByRole('button', { name: '多选' }).click();

  // 计算素材卡片的位置，点击右下角圆圈区域
  const card = page.locator('.aspect-square.cursor-pointer').first();
  const box = await card.boundingBox();
  console.log('CARD BOX:', JSON.stringify(box));

  // 截图：多选模式下的初始状态
  await page.screenshot({ path: 'test-results/select-bug-before.png' });

  // 点击卡片中心（对照组）
  await card.click();
  await page.waitForTimeout(300);
  const selectedText = await page.getByText('已选 1 张').count();
  console.log('AFTER CENTER CLICK, 已选 1 张 count =', selectedText);
  await page.screenshot({ path: 'test-results/select-bug-after-center.png' });

  // 取消，再点右下角（圆圈位置）
  if (selectedText > 0) {
    await page.getByRole('button', { name: '取消' }).click();
    await page.getByRole('button', { name: '多选' }).click();
  }

  if (box) {
    // 右下角圆圈区域：右下角偏内 20px
    const x = box.x + box.width - 12;
    const y = box.y + box.height - 12;
    await page.mouse.click(x, y);
    await page.waitForTimeout(300);
    const cnt = await page.getByText('已选 1 张').count();
    console.log('AFTER CORNER CLICK, 已选 1 张 count =', cnt);
    await page.screenshot({ path: 'test-results/select-bug-after-corner.png' });
  }
});
