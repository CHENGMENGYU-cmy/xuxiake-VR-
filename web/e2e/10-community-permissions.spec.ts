import { test, expect } from '@playwright/test';

// Isolated role fixtures: these tests never change real community roles or content.
for (const role of ['CREATOR', 'ADMIN', 'MODERATOR', 'MEMBER', 'VISITOR'] as const) {
  test(`${role}: 社群管理入口遵循角色权限`, async ({ page }) => {
    const user = { id: role === 'CREATOR' ? 'owner' : 'viewer', username: 'viewer', displayName: '测试用户', role: 'USER' };
    const isCreator = role === 'CREATOR';
    const isAdmin = isCreator || role === 'ADMIN';
    const isModerator = isAdmin || role === 'MODERATOR';
    await page.addInitScript((user) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'isolated-test-token');
    }, user);
    const community = {
      id: 'permission-test', name: '权限测试社群', conversationId: 'test-chat',
      memberCount: 2, maxMembers: 100, isPublic: true, status: 'ACTIVE',
      createdAt: '2026-09-09T00:00:00Z',
      creator: { id: 'owner', username: 'owner', displayName: '创建者' },
      members: [{ id: 'member', username: 'member', displayName: '普通成员' }],
      tags: [], isMember: role !== 'VISITOR', isCreator, isAdmin, isModerator,
    };
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname;
      const data = path === '/api/users/profile' ? user
        : path === '/api/social/communities/permission-test' ? community
        : [];
      await route.fulfill({ json: { success: true, data, unreadCount: 0 } });
    });

    await page.goto('/communities/permission-test');
    await expect(page.getByRole('heading', { name: '权限测试社群' })).toBeVisible();
    const settings = page.locator('a[href="/communities/permission-test/settings"]');
    if (isAdmin) await expect(settings).toBeVisible();
    else await expect(settings).toHaveCount(0);
    await page.getByRole('tab', { name: '公告' }).click();
    await expect(page.getByRole('button', { name: '发布公告', exact: true })).toHaveCount(isModerator ? 1 : 0);
    await page.getByRole('tab', { name: '挑战' }).click();
    if (isModerator) await expect(page.getByRole('button', { name: '创建挑战', exact: true })).toBeVisible();
    else await expect(page.getByRole('button', { name: '创建挑战', exact: true })).toHaveCount(0);

    await page.goto('/communities/permission-test/settings');
    if (isAdmin) {
      await expect(page.getByRole('button', { name: '保存设置' })).toBeVisible();
      await expect(page.getByRole('button', { name: '解散社群' })).toHaveCount(isCreator ? 1 : 0);
      await page.getByRole('tab', { name: '成员管理' }).click();
      if (isCreator) await expect(page.getByRole('combobox', { name: '普通成员的社群角色' })).toBeEnabled();
      else await expect(page.getByRole('combobox', { name: '普通成员的社群角色' })).toBeDisabled();
    } else {
      await expect(page.getByText('仅社群创建者或管理员可管理设置')).toBeVisible();
      await expect(page.getByRole('button', { name: '保存设置' })).toHaveCount(0);
    }
  });
}
