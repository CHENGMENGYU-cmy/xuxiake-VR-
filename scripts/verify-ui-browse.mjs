import { chromium } from '../web/node_modules/@playwright/test/index.mjs';

const apiBase = process.env.XXK_API_BASE_URL || 'http://localhost:3001';
const webBase = process.env.XXK_WEB_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${apiBase}${path}`, options);
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; }
  catch { throw new Error(`${path} returned non-JSON ${res.status}: ${text.slice(0, 300)}`); }
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
  const { user, tokens } = result.data;
  return { user, tokens };
}

const { user, tokens } = await login();
const failures = [];
const consoleErrors = [];
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
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('response', (response) => {
  const url = response.url();
  if ((url.includes('/api/posts/snaps') || url.includes('/api/posts/diaries') || url.includes('/api/posts/travelogues') || url.includes('/api/posts/hierarchy')) && response.status() >= 400) {
    failures.push(`${response.status()} ${url}`);
  }
});
page.on('pageerror', (err) => consoleErrors.push(err.message));

const pages = [
  { path: '/snap', label: '素材库' },
  { path: '/diaries', label: '日记列表' },
  { path: '/journeys', label: '游记列表', afterLoad: async (page) => { await page.getByRole('button', { name: '我的（私密）' }).click(); await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {}); } },
];
const results = [];
for (const item of pages) {
  await page.goto(item.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForSelector('body', { timeout: 10000 });
  if (item.afterLoad) await item.afterLoad(page);
  const url = page.url();
  const bodyText = (await page.locator('body').innerText({ timeout: 10000 })).slice(0, 1000);
  if (url.includes('/login')) throw new Error(`${item.label} redirected to login`);
  if (/Application error|Unhandled Runtime Error|Internal Server Error|500/.test(bodyText)) {
    throw new Error(`${item.label} rendered an error page: ${bodyText.slice(0, 300)}`);
  }
  results.push({ label: item.label, path: item.path, finalUrl: url, textSample: bodyText.replace(/\s+/g, ' ').slice(0, 180) });
}
await browser.close();

if (failures.length > 0) throw new Error(`core API failures while browsing: ${failures.join('; ')}`);
if (consoleErrors.some((e) => /Error|Exception|Unhandled|Network Error/.test(e))) {
  throw new Error(`console/page errors: ${consoleErrors.slice(0, 5).join(' | ')}`);
}
console.log(JSON.stringify({ webBase, apiBase, user: { id: user.id, username: user.username }, pages: results, consoleErrorCount: consoleErrors.length }, null, 2));

