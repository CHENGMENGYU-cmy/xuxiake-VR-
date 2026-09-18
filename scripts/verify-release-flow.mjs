// 本机首发验收：新建专用内容，浏览器发布，第二账号读取/互动，最终撤回并软删除。
// 不调用付费 AI，不发布已有私密内容。软删除记录与互动通知可能保留用于审计。
import { chromium, expect } from '../web/node_modules/@playwright/test/index.mjs';

const api = 'http://localhost:3001';
const web = 'http://localhost:3000';
const marker = `首发验收_${Date.now()}`;
const fixtures = [];
const checks = [];
let browser;
let author;
let reader;
function check(label, ok) {
  if (!ok) throw new Error(label);
  checks.push(label);
  console.log(`PASS ${label}`);
}
async function request(path, token, body, method = body === undefined ? 'GET' : 'POST', allowed = []) {
  const res = await fetch(`${api}/api${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000),
  });
  const json = await res.json();
  if (allowed.includes(res.status)) return { status: res.status, json };
  if (!res.ok || json.success === false) throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(json)}`);
  return json;
}
async function login(account) {
  const captcha = await request('/auth/captcha');
  const result = await request('/auth/login', null, { account, password: 'password123', captchaKey: captcha.data.key, captchaCode: 'TEST1234' });
  return { ...result.data, token: result.data.tokens.accessToken };
}
const rows = (json) => Array.isArray(json.data) ? json.data : json.data?.posts || json.data?.list || [];
async function publicLists(id, visible) {
  for (const path of [
    '/posts?contentLevel=DIARY,TRAVELOGUE,ESSAY&limit=100',
    '/social/communities/com1/posts?limit=100',
    '/users/zhangshan/posts?limit=100',
    `/posts/search?q=${encodeURIComponent(marker)}&limit=100`,
  ]) {
    check(`${visible ? '公开可见' : '私密隐藏'} ${path}`, rows(await request(path, reader.token)).some(p => p.id === id) === visible);
  }
}
try {
  author = await login('zhangshan');
  reader = await login('wangwu');
  check('使用两个不同账号', author.user.id !== reader.user.id);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: web, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
  await page.goto('/login');
  for (const name of ['手机号（暂未开放）', '微信登录（暂未开放）', '支付宝登录（暂未开放）']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled();
  }
  await page.goto('/register');
  await expect(page.getByRole('button', { name: '手机号（暂未开放）', exact: true })).toBeDisabled();
  check('登录和注册未开放入口不可点击', true);
  await page.goto('/login');
  await page.getByPlaceholder('输入邮箱或用户名').fill('zhangshan');
  await page.getByPlaceholder('输入密码', { exact: true }).fill('password123');
  await expect(page.locator('img[alt="验证码"]')).toBeVisible();
  await page.getByPlaceholder('请输入4位验证码').fill('TEST1234');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.waitForURL('**/feed');
  check('浏览器账号密码登录成功', true);

  const community = (await request('/social/communities/com1', author.token)).data;
  for (const level of ['DIARY', 'TRAVELOGUE']) {
    const content = `${marker}_${level}：验证社区发布与互动。`;
    const created = level === 'DIARY'
      ? await request('/posts/diary/save', author.token, { title: content, content, visibility: 'PRIVATE', status: 'private' })
      : await request('/posts', author.token, { postType: 'JOURNEY', contentLevel: level, content, visibility: 'PRIVATE', journey: { title: content, summary: content, stops: [] } });
    const id = created.data.id;
    const fixture = { id, level, commentId: null, liked: false };
    fixtures.push(fixture);
    await publicLists(id, false);
    const denied = await request(`/posts/${id}`, reader.token, undefined, 'GET', [403, 404]);
    check(`${level} 私密详情拒绝另一账号`, [403, 404].includes(denied.status));
    const missingCommunity = await request(`/posts/${id}/publish`, author.token, { visibility: 'PUBLIC' }, 'POST', [400]);
    check(`${level} 未选社区不能发布`, missingCommunity.status === 400);
    const wrongAuthor = await request(`/posts/${id}/publish`, reader.token, { visibility: 'PUBLIC', communityId: 'com1' }, 'POST', [403, 404]);
    check(`${level} 另一账号不能代为发布`, [403, 404].includes(wrongAuthor.status));

    await page.goto(`/${level === 'DIARY' ? 'diaries' : 'journeys'}/${id}`);
    await page.getByRole('button', { name: level === 'DIARY' ? '公开' : '发布', exact: true }).click();
    await page.getByRole('button', { name: community.name, exact: false }).click();
    const published = page.waitForResponse(r => r.url().endsWith(`/posts/${id}/publish`) && r.request().method() === 'POST');
    await page.getByRole('button', { name: '确认发布', exact: true }).click();
    check(`${level} 浏览器选择社区并发布`, (await published).ok());
    await publicLists(id, true);
    for (const path of ['/feed', '/communities/com1', '/profile/zhangshan']) {
      await page.goto(path);
      await expect(page.getByText(content, { exact: false }).first()).toBeVisible();
      check(`${level} 页面显示 ${path}`, true);
    }
    await request(`/posts/${id}/like`, reader.token, {});
    fixture.liked = true;
    const detail = (await request(`/posts/${id}`, reader.token)).data;
    check(`${level} 第二账号点赞生效`, detail.likeCount === 1);
    fixture.commentId = (await request(`/posts/${id}/comments`, reader.token, { content: `${marker} 互动评论` })).data.id;
    check(`${level} 第二账号评论可读取`, rows(await request(`/posts/${id}/comments`, reader.token)).some(c => c.id === fixture.commentId));
    await request(`/posts/comments/${fixture.commentId}`, reader.token, undefined, 'DELETE');
    fixture.commentId = null;
    await request(`/posts/${id}/like`, reader.token, undefined, 'DELETE');
    fixture.liked = false;
    await request(`/posts/${id}/unpublish`, author.token, {});
    await publicLists(id, false);
    check(`${level} 撤回后详情不可访问`, [403, 404].includes((await request(`/posts/${id}`, reader.token, undefined, 'GET', [403, 404])).status));
  }
  check('浏览器无运行时错误', pageErrors.length === 0);
} finally {
  const cleanupErrors = [];
  for (const item of fixtures) {
    for (const action of [
      ...(item.commentId ? [() => request(`/posts/comments/${item.commentId}`, reader.token, undefined, 'DELETE')] : []),
      ...(item.liked ? [() => request(`/posts/${item.id}/like`, reader.token, undefined, 'DELETE')] : []),
      () => request(`/posts/${item.id}/unpublish`, author.token, {}),
      () => request(`/posts/${item.id}`, author.token, undefined, 'DELETE'),
    ]) {
      try { await action(); } catch (err) { cleanupErrors.push(String(err)); }
    }
  }
  await browser?.close();
  console.log(JSON.stringify({ marker, checks: checks.length, fixtures: fixtures.map(({ id, level }) => ({ id, level })), cleanupErrors }, null, 2));
  if (cleanupErrors.length) throw new Error(`验收内容清理失败: ${cleanupErrors.join('; ')}`);
}
