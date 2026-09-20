// Browser audit for the generated diary/travelogue chain.
// Reuses docs/core-chain-evidence-2026-09-18.json and only mutates that test account's posts.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium, expect } from '../web/node_modules/@playwright/test/index.mjs';

const api = 'http://localhost:3001/api';
const web = 'http://localhost:3000';
const password = 'ChainCheck_2026!';
const evidencePath = 'docs/core-chain-evidence-2026-09-18.json';
const requestedKind = (process.argv[2] || '').toUpperCase();
const outPath = `docs/browser-publish-chain-evidence-2026-09-20-${(requestedKind || 'all').toLowerCase()}.json`;

const source = JSON.parse(await readFile(evidencePath, 'utf8'));
const authorName = source.accounts?.[0]?.username;
const readerName = source.accounts?.[1]?.username;
const diaryId = source.aiDiary?.id;
const travelogueId = source.travelogue?.id;

const report = {
  sourceEvidence: evidencePath,
  run: source.run,
  startedAt: new Date().toISOString(),
  checks: [],
  bugs: [],
  pages: [],
  requestedKind: requestedKind || 'ALL',
};

async function save() {
  await mkdir('docs', { recursive: true });
  await writeFile(outPath, JSON.stringify(report, null, 2));
}

async function check(label, pass, detail = {}) {
  const row = { label, pass, detail };
  report.checks.push(row);
  if (!pass) report.bugs.push(row);
  console.log(`${pass ? 'PASS' : 'BUG'} ${label}`);
}

async function request(path, token, body, method = body === undefined ? 'GET' : 'POST', allowed = []) {
  const res = await fetch(`${api}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (allowed.includes(res.status)) return { status: res.status, ...json };
  if (!res.ok || json.success === false) {
    throw new Error(`${method} ${path}: ${res.status} ${text}`);
  }
  return { status: res.status, ...json };
}

async function login(account) {
  const captcha = await request('/auth/captcha');
  const result = await request('/auth/login', null, {
    account,
    password,
    captchaKey: captcha.data.key,
    captchaCode: 'TEST1234',
  });
  return {
    user: result.data.user,
    token: result.data.tokens.accessToken,
    refreshToken: result.data.tokens.refreshToken,
  };
}

function rows(json) {
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.data?.posts)) return json.data.posts;
  if (Array.isArray(json.posts)) return json.posts;
  return [];
}

async function publicVisible(postId, token, username, communityId) {
  const paths = [
    `/posts?limit=100`,
    `/social/communities/${communityId}/posts?limit=100`,
    `/users/${username}/posts?limit=100`,
  ];
  const results = [];
  for (const path of paths) {
    const found = rows(await request(path, token)).some((p) => p.id === postId);
    results.push({ path, found });
  }
  return results;
}

async function getPostTitle(postId, token) {
  const post = (await request(`/posts/${postId}`, token)).data;
  return {
    title: post.title || post.journey?.title || post.content?.slice(0, 30) || postId,
    contentSnippet: post.content?.slice(0, 60) || '',
    journeyTitle: post.journey?.title || '',
  };
}

if (!authorName || !readerName || !diaryId || !travelogueId) {
  throw new Error('Missing account or generated post ids in core-chain evidence.');
}

let browser;
try {
  const author = await login(authorName);
  const reader = await login(readerName);
  const community = (await request('/social/communities/com1', author.token)).data;

  report.accounts = {
    author: { id: author.user.id, username: author.user.username },
    reader: { id: reader.user.id, username: reader.user.username },
  };
  report.community = { id: community.id, name: community.name };

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: web, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('dialog', (dialog) => dialog.accept());

  await page.goto('/login');
  await page.getByPlaceholder('输入邮箱或用户名').fill(authorName);
  await page.getByPlaceholder('输入密码', { exact: true }).fill(password);
  await expect(page.locator('img[alt="验证码"]')).toBeVisible();
  await page.getByPlaceholder('请输入4位验证码').fill('TEST1234');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.waitForURL('**/feed');
  await check('专用测试账号可通过网页登录', true, { username: authorName });

  let targets = [
    { id: diaryId, kind: 'DIARY', path: `/diaries/${diaryId}`, publishButton: '公开', retractButton: '私密' },
    { id: travelogueId, kind: 'TRAVELOGUE', path: `/journeys/${travelogueId}`, publishButton: '发布', retractButton: '撤回' },
  ];
  if (requestedKind) targets = targets.filter((target) => target.kind === requestedKind);
  if (targets.length === 0) throw new Error(`No target matched ${requestedKind}`);

  for (const target of targets) {
    const display = await getPostTitle(target.id, author.token);
    await request(`/posts/${target.id}/unpublish`, author.token, {}, 'POST', [200, 400, 404]);
    await check(`${target.kind} 发布前对另一账号隐藏`, (await request(`/posts/${target.id}`, reader.token, undefined, 'GET', [403, 404])).status >= 400, { id: target.id });

    await page.goto(target.path);
    await expect(page.getByText(display.title, { exact: false }).first()).toBeVisible();
    await check(`${target.kind} 详情页可打开`, true, { id: target.id, title: display.title });

    await page.getByRole('button', { name: target.publishButton, exact: true }).click();
    await expect(page.getByText('发布到社区', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: community.name, exact: false }).click();
    const publishResponse = page.waitForResponse((r) => r.url().endsWith(`/posts/${target.id}/publish`) && r.request().method() === 'POST');
    await page.getByRole('button', { name: '确认发布', exact: true }).click();
    const publishOk = (await publishResponse).ok();
    await check(`${target.kind} 浏览器选择社区并发布`, publishOk, { id: target.id, community: community.id });

    const visibleRows = await publicVisible(target.id, reader.token, authorName, community.id);
    await check(`${target.kind} 发布后进入公开列表`, visibleRows.every((row) => row.found), visibleRows);

    for (const path of ['/feed', `/communities/${community.id}`, `/profile/${authorName}`]) {
      await page.goto(path);
      const titleVisible = await page.getByText(display.title, { exact: false }).first().isVisible().catch(() => false);
      const journeyTitleVisible = display.journeyTitle
        ? await page.getByText(display.journeyTitle, { exact: false }).first().isVisible().catch(() => false)
        : false;
      const contentVisible = display.contentSnippet
        ? await page.getByText(display.contentSnippet.slice(0, 30), { exact: false }).first().isVisible().catch(() => false)
        : false;
      const visible = titleVisible || journeyTitleVisible || contentVisible;
      report.pages.push({
        postId: target.id,
        kind: target.kind,
        path,
        title: display.title,
        titleVisible,
        journeyTitleVisible,
        contentVisible,
        visible,
      });
      await check(`${target.kind} 页面展示 ${path}`, visible, {
        title: display.title,
        titleVisible,
        journeyTitleVisible,
        contentVisible,
      });
    }

    await request(`/posts/${target.id}/like`, reader.token, {});
    const comment = (await request(`/posts/${target.id}/comments`, reader.token, { content: `${source.run} 浏览器链路互动评论` })).data;
    const detailAfterInteraction = (await request(`/posts/${target.id}`, reader.token)).data;
    await check(`${target.kind} 第二账号点赞评论生效`, detailAfterInteraction.likeCount >= 1, { likeCount: detailAfterInteraction.likeCount, commentId: comment.id });

    await request(`/posts/comments/${comment.id}`, reader.token, undefined, 'DELETE');
    await request(`/posts/${target.id}/like`, reader.token, undefined, 'DELETE');

    if (target.kind === 'TRAVELOGUE') {
      await page.goto(target.path);
      await page.getByRole('button', { name: target.retractButton, exact: true }).click();
      await expect(page.getByText('私密内容', { exact: true })).toBeVisible();
    } else {
      await page.goto(target.path);
      await page.getByRole('button', { name: target.retractButton, exact: true }).click();
      await expect(page.getByText('这是你的私密日记，仅自己可见', { exact: true })).toBeVisible();
    }

    const hiddenRows = await publicVisible(target.id, reader.token, authorName, community.id);
    const readerDenied = await request(`/posts/${target.id}`, reader.token, undefined, 'GET', [403, 404]);
    await check(`${target.kind} 撤回后公开列表与详情隐藏`, hiddenRows.every((row) => !row.found) && readerDenied.status >= 400, { hiddenRows, readerDetailStatus: readerDenied.status });
  }

  await check('浏览器运行时无页面错误', pageErrors.length === 0, { pageErrors });
} finally {
  await browser?.close();
  report.finishedAt = new Date().toISOString();
  await save();
  console.log(JSON.stringify({ report: outPath, checks: report.checks.length, bugs: report.bugs.length }, null, 2));
}
