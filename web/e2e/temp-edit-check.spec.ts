import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helper';

test.describe('游记编辑回填检查', () => {
  test('编辑 fde24594 回填是否完整', async ({ page }) => {
    test.setTimeout(90000);
    await loginAs(page, 'sunqi');
    await page.goto('http://localhost:3000/upload/journey-creator?edit=fde24594-6f21-4d4e-b4f3-ba704c76e6a3');
    await page.waitForURL(/journey-creator\?edit=/);
    await expect(page.getByRole('heading', { name: '编辑游记' })).toBeVisible({ timeout: 15000 });

    // 标题
    const titleVal = await page.getByPlaceholder('给你的游记起个名字...').first().inputValue();
    console.log('标题:', titleVal);
    // 导语
    const summaryVal = await page.getByPlaceholder('如：在漓江晨雾里醒来，用三天把桂林的山水与烟火装进行囊').first().inputValue();
    console.log('导语:', summaryVal);
    // 目的地
    const destVal = await page.getByPlaceholder('如：云南大理').first().inputValue();
    console.log('目的地:', destVal);
    // 出行方式 select
    const transport = await page.locator('select').nth(0).inputValue();
    console.log('出行方式:', transport);
    // 主题 select
    const theme = await page.locator('select').nth(1).inputValue();
    console.log('主题:', theme);
    // 结尾感悟
    const insightVal = await page.getByPlaceholder('给这次旅程一个温暖的收尾...').first().inputValue();
    console.log('结尾:', insightVal.slice(0, 30));

    // Day 章节数
    const dayCards = page.locator('.rounded-lg.border.bg-card.p-4');
    const dayCount = await dayCards.count();
    console.log('Day 章节卡片数:', dayCount);
    // 每章图片数
    for (let i = 0; i < dayCount; i++) {
      const imgs = dayCards.nth(i).locator('img');
      console.log(`  Day${i + 1} 图片数:`, await imgs.count());
    }
    // 封面是否显示
    const coverVisible = await page.locator('img[src*="changsha-LOG"]').count();
    console.log('封面图存在:', coverVisible > 0);
  });
});
