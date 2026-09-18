// Cleanup helper for the 2026-09-18 core-chain test account.
import { readFile } from 'node:fs/promises';

const api = 'http://localhost:3001/api';
const password = 'ChainCheck_2026!';
const evidence = JSON.parse(await readFile('docs/core-chain-evidence-2026-09-18.json', 'utf8'));
const authorName = evidence.accounts?.[0]?.username;
const readerName = evidence.accounts?.[1]?.username;
const postIds = [evidence.aiDiary?.id, evidence.travelogue?.id].filter(Boolean);

async function request(path, token, body, method = body === undefined ? 'GET' : 'POST', allowed = []) {
  const res = await fetch(`${api}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (allowed.includes(res.status)) return { status: res.status, ...json };
  if (!res.ok || json.success === false) throw new Error(`${method} ${path}: ${res.status} ${text}`);
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
  return result.data.tokens.accessToken;
}

const authorToken = await login(authorName);
const readerToken = await login(readerName);
const cleanup = [];

for (const id of postIds) {
  const comments = await request(`/posts/${id}/comments`, readerToken, undefined, 'GET', [200, 403, 404]);
  for (const comment of comments.data || []) {
    if (comment.content?.includes(evidence.run)) {
      await request(`/posts/comments/${comment.id}`, readerToken, undefined, 'DELETE', [200, 403, 404]);
      cleanup.push({ id, action: 'delete-comment', commentId: comment.id });
    }
  }
  await request(`/posts/${id}/like`, readerToken, undefined, 'DELETE', [200, 400, 403, 404]);
  cleanup.push({ id, action: 'unlike-reader' });
  await request(`/posts/${id}/unpublish`, authorToken, {}, 'POST', [200, 400, 403, 404]);
  cleanup.push({ id, action: 'unpublish' });
}

console.log(JSON.stringify({ cleanup }, null, 2));
