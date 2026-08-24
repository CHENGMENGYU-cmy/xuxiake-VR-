import { test, expect } from '@playwright/test';
import { loginAsUser } from './auth.helper';

/**
 * 素材库多选 → 批量编辑页 流转测试
 * 验证：素材选择 → 批量创作页加载 → 风格选择 → 生成按钮可用
 * 注：AI 生成依赖外部 API，不在此测试中验证完整生成流程
 */
test.describe('素材库多选日记流转', () => {
  test('多选 → 批量编辑 → 风格选择 → 生成可用', async ({ page }) => {
    test.setTimeout(60000);
    await loginAsUser(page);

    // 0. 先通过 API 同步 3 条闪拍素材
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const now = Date.now();
    const syncResp = await page.request.post('http://localhost:3001/api/sync/snapshots', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        moments: [
          { id: `e2e-diary-${now}-1`, capturedAt: now, mediaType: 'photo', photoPath: '/uploads/test/snap1.jpg', gpsLat: 30.25, gpsLng: 120.15, locationName: '西湖断桥' },
          { id: `e2e-diary-${now}-2`, capturedAt: now - 60000, mediaType: 'photo', photoPath: '/uploads/test/snap2.jpg', gpsLat: 24.75, gpsLng: 110.4, locationName: '阳朔遇龙河' },
          { id: `e2e-diary-${now}-3`, capturedAt: now - 120000, mediaType: 'photo', photoPath: '/uploads/test/snap3.jpg', gpsLat: 29.56, gpsLng: 106.55, locationName: '重庆洪崖洞' },
        ],
      },
    });
    const syncResult = await syncResp.json();
    console.log('Sync result:', JSON.stringify(syncResult));

    // 1. 进入素材库
    await page.goto('/snap');
    await page.waitForURL('**/snap', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // 2. 全部视图应显示素材集合卡片，点击第一个进入
    const firstGroupCard = page.locator('[class*="cursor-pointer"]').filter({ hasText: /张/ }).first();
    const hasGroup = await firstGroupCard.isVisible().catch(() => false);
    if (hasGroup) {
      await firstGroupCard.click();
      await page.waitForTimeout(1000);
    }

    // 3. 集合视图中应有素材卡片
    const snapCards = page.locator('.aspect-square.cursor-pointer');
    const snapCount = await snapCards.count();
    expect(snapCount).toBeGreaterThanOrEqual(1);

    // 4. 多选：勾选可用素材
    const selectCount = Math.min(snapCount, 3);
    await page.getByRole('button', { name: '多选' }).click();
    for (let i = 0; i < selectCount; i++) {
      await snapCards.nth(i).click();
    }
    await expect(page.getByText(new RegExp(`已选 ${selectCount} 张`))).toBeVisible();

    // 5. 点底部"写日记" → 打开创作引导 → 选"AI帮我写" → 跳批量编辑页
    await page.locator('.fixed.inset-x-0.bottom-0').getByRole('button', { name: '写日记' }).click();
    await page.getByRole('button', { name: /AI 帮我写/ }).click();
    await page.waitForURL(/\/snap\/generate\/batch\?ids=/, { timeout: 15000 });

    // 6. 批量编辑页加载成功
    await expect(page.getByRole('heading', { name: '批量日记创作' })).toBeVisible();
    await expect(page.getByText(/从 \d+ 张素材智能生成一篇日记/)).toBeVisible();

    // 7. 风格选择区域可见
    await expect(page.getByText('选择日记风格')).toBeVisible();
    // 至少有一个风格按钮可选
    const styleButtons = page.locator('button').filter({ hasText: /风/ });
    expect(await styleButtons.count()).toBeGreaterThanOrEqual(3);

    // 8. 生成按钮可见且可点击
    const generateBtn = page.getByRole('button', { name: /生成日记/ });
    await expect(generateBtn).toBeVisible();
    await expect(generateBtn).toBeEnabled();

    // 9. 素材墙显示已选素材缩略图
    await expect(page.getByText('已选素材')).toBeVisible();
  });
});
