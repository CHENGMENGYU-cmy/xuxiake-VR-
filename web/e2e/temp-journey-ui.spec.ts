import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helper';

test.describe('图文叙事章节式游记', () => {
  test('手写章节式游记 → 发布 → 详情渲染 → 列表卡片', async ({ page }) => {
    test.setTimeout(120000);
    await loginAs(page, 'sunqi');

    // 1. 进入章节式编辑器
    await page.goto('http://localhost:3000/upload/journey-creator');
    await page.waitForURL('**/journey-creator');
    await expect(page.getByRole('heading', { name: '写游记' })).toBeVisible({ timeout: 15000 });

    // 2. 标题 + 导语
    await page.getByPlaceholder('给你的游记起个名字...').fill('测试·漓江晨雾三日行');
    await page.getByPlaceholder('如：在漓江晨雾里醒来，用三天把桂林的山水与烟火装进行囊').fill('在漓江晨雾里醒来，用三天把桂林装进心里');

    // 3. 信息卡
    await page.getByPlaceholder('如：云南大理').fill('广西桂林');
    await page.getByPlaceholder('如：3000元').fill('2500元');
    await page.locator('select').nth(0).selectOption('高铁');
    await page.locator('select').nth(1).selectOption('自然');

    // 4. 添加 Day 1
    await page.getByRole('button', { name: '添加 Day' }).click();
    await expect(page.getByText('D1').first()).toBeVisible();
    await page.getByPlaceholder('地点名称').fill('兴坪古镇');
    await page.getByPlaceholder('这一天的旅程故事、所见所感...').fill('清晨六点，我在漓江边等日出，晨雾像纱一样飘过山头。');

    // 5. 从素材库选图
    await page.getByRole('button', { name: '从素材库选图' }).click();
    await expect(page.getByRole('heading', { name: '选择素材' })).toBeVisible({ timeout: 10000 });
    await page.locator('.grid.grid-cols-4 button').first().click();
    await page.getByRole('button', { name: /确认（1\/12）/ }).click();
    // 章节图片出现
    await expect(page.locator('.grid.grid-cols-4 button, img')).toBeVisible({ timeout: 5000 });

    // 6. 结尾感悟
    await page.getByPlaceholder('给这次旅程一个温暖的收尾...').fill('山水有相逢，来日方长。');

    // 7. 发布 → 跳详情页
    await page.getByRole('button', { name: '发布游记' }).click();
    await page.waitForURL(/\/journeys\/[0-9a-f-]{36}$/, { timeout: 15000 });
    await expect(page.getByText('已发布到社区').or(page.getByText('私密内容'))).toBeVisible({ timeout: 10000 });

    // 8. 详情页图文渲染
    await expect(page.getByRole('heading', { name: '测试·漓江晨雾三日行' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('在漓江晨雾里醒来，用三天把桂林装进心里')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('广西桂林')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('高铁')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('D1').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('兴坪古镇').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('清晨六点，我在漓江边等日出')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('山水有相逢，来日方长。')).toBeVisible({ timeout: 5000 });

    const postUrl = page.url();

    // 9. 列表页卡片渲染（封面 + 目的地 + 天数）
    await page.goto('http://localhost:3000/journeys');
    await page.waitForURL('**/journeys');
    await expect(page.getByText('测试·漓江晨雾三日行').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('广西桂林').first()).toBeVisible({ timeout: 5000 });

    // 10. 详情页"编辑"按钮跳回章节式编辑器（回填数据）
    await page.goto(postUrl);
    await page.getByRole('button', { name: '编辑' }).click();
    await page.waitForURL(/\/journey-creator\?edit=/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: '编辑游记' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder('给你的游记起个名字...')).toHaveValue('测试·漓江晨雾三日行', { timeout: 5000 });
  });
});
