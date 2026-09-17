import { chromium } from '../web/node_modules/@playwright/test/index.mjs';

const apiBase = process.env.XXK_API_BASE_URL || 'http://localhost:3001';
const webBase = process.env.XXK_WEB_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${apiBase}${path}`, options);
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${path} returned non-JSON ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!res.ok || json?.success === false) {
    throw new Error(`${path} failed ${res.status}: ${JSON.stringify(json).slice(0, 600)}`);
  }
  return json;
}

async function login() {
  const captcha = await request('/api/auth/captcha');
  const body = {
    account: process.env.XXK_TEST_ACCOUNT || 'zhangshan',
    password: process.env.XXK_TEST_PASSWORD || 'password123',
    captchaKey: captcha.data.key,
    captchaCode: 'TEST1234',
  };
  const result = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return result.data;
}

function extractRows(json) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.items)) return json.data.items;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  return [];
}

function responseAppliesToPage(url, pageKind) {
  if (pageKind === 'feed') return url.includes('/api/posts?');
  if (pageKind === 'community') return url.includes('/api/social/communities/com1/posts?');
  if (pageKind === 'profile') return url.includes('/api/users/zhangshan/posts?');
  return false;
}

function expectedFor(label) {
  if (label === '全部') return { levels: ['DIARY', 'TRAVELOGUE', 'ESSAY'] };
  if (label === '日记') return { levels: ['DIARY'] };
  if (label === '游记') return { levels: ['TRAVELOGUE', 'ESSAY'] };
  return {};
}

function assertRowsMatch(label, rows) {
  const expected = expectedFor(label);
  if (!rows.length) return;
  if (expected.levels) {
    const invalid = rows.filter((row) => !expected.levels.includes(row.contentLevel));
    if (invalid.length) {
      throw new Error(`${label} mixed unexpected contentLevel: ${invalid.map((row) => `${row.id}:${row.contentLevel}`).join(', ')}`);
    }
  }
  if (expected.postTypes) {
    const invalid = rows.filter((row) => !expected.postTypes.includes(row.postType));
    if (invalid.length) {
      throw new Error(`${label} mixed unexpected postType: ${invalid.map((row) => `${row.id}:${row.postType}`).join(', ')}`);
    }
  }
}

async function waitForCategoryResponse(page, pageKind, action) {
  const responsePromise = page.waitForResponse(
    (response) => response.status() < 500 && responseAppliesToPage(response.url(), pageKind),
    { timeout: 15000 },
  ).catch(() => null);
  await action();
  const response = await responsePromise;
  if (!response) return { rows: [], status: null, url: null };
  const json = await response.json();
  return { rows: extractRows(json), status: response.status(), url: response.url() };
}

async function browseCategory(page, pageKind, label) {
  const result = await waitForCategoryResponse(page, pageKind, async () => {
    await page.getByRole('button', { name: label, exact: true }).click();
  });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const bodyText = await page.locator('body').innerText({ timeout: 10000 });
  if (/Application error|Unhandled Runtime Error|Internal Server Error|HTTP 500|status 500/.test(bodyText)) {
    throw new Error(`${pageKind}/${label} rendered error page`);
  }
  assertRowsMatch(label, result.rows);
  const summary = {
    label,
    apiStatus: result.status,
    count: result.rows.length,
    levels: [...new Set(result.rows.map((row) => row.contentLevel).filter(Boolean))],
    postTypes: [...new Set(result.rows.map((row) => row.postType).filter(Boolean))],
    sampleIds: result.rows.slice(0, 3).map((row) => row.id),
    renderedNonCorePost:
      bodyText.includes('刚试完 Insta360 X4 的低光拍摄') ||
      bodyText.includes('把苏州园林的“框景”逻辑') ||
      bodyText.includes('周末准备轻装走一段香山') ||
      bodyText.includes('什刹海夜景 VR180 试拍'),
  };
  if (summary.renderedNonCorePost) {
    throw new Error(`${pageKind}/${label} rendered non-core POST or VR content`);
  }
  return summary;
}

async function verifyPage(page, pageKind, path, labels) {
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  if (page.url().includes('/login')) throw new Error(`${path} redirected to login`);
  const bodyText = await page.locator('body').innerText({ timeout: 10000 });
  for (const label of ['全部', '日记', '游记']) {
    if (!bodyText.includes(label)) throw new Error(`${path} missing category label ${label}`);
  }
  for (const removedLabel of ['随笔', 'VR内容']) {
    if (bodyText.includes(removedLabel)) throw new Error(`${path} still shows removed category label ${removedLabel}`);
  }
  const categories = [];
  for (const label of labels) {
    categories.push(await browseCategory(page, pageKind, label));
  }
  return { path, finalUrl: page.url(), categories };
}

const { user, tokens } = await login();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  baseURL: webBase,
  storageState: {
    cookies: [
      {
        name: 'auth_token',
        value: tokens.accessToken,
        url: webBase,
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) + 86400,
      },
    ],
    origins: [
      {
        origin: webBase,
        localStorage: [
          { name: 'accessToken', value: tokens.accessToken },
          { name: 'refreshToken', value: tokens.refreshToken },
          { name: 'user', value: JSON.stringify(user) },
        ],
      },
    ],
  },
});

const page = await context.newPage();
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));

const labels = ['日记', '游记', '全部'];
const results = [
  await verifyPage(page, 'feed', '/feed', labels),
  await verifyPage(page, 'community', '/communities/com1', labels),
  await verifyPage(page, 'profile', '/profile/zhangshan', labels),
];

await browser.close();

const severeConsoleErrors = consoleErrors.filter((error) => /Unhandled|Runtime|Network Error|TypeError|ReferenceError/.test(error));
if (severeConsoleErrors.length) {
  throw new Error(`console/page errors: ${severeConsoleErrors.slice(0, 5).join(' | ')}`);
}

console.log(
  JSON.stringify(
    {
      webBase,
      apiBase,
      user: { id: user.id, username: user.username },
      results,
      consoleErrorCount: consoleErrors.length,
    },
    null,
    2,
  ),
);
