/**
 * 发布链路验收（对应《第一版社区出版设计方案-2026-09-17》§7 第一步 ④-⑧ 与 §8 验收标准）
 *
 * verify-core-chain.mjs 止步于“生成游记”；本脚本接续验证“发布到社区”之后的可见性与互动：
 *   ④ 发布后是否写入统一帖子数据
 *   ⑤ 发布后是否出现在首页信息流
 *   ⑥ 发布后是否出现在对应社区主页
 *   ⑦ 发布后是否出现在用户个人主页
 *   ⑧ 点赞、评论是否能对新发布内容生效
 *
 * 默认「发布 → 验证 → 撤回」，全程可逆；加 --keep 则保留发布结果。
 *
 *   node scripts/verify-publish-chain.mjs
 *   node scripts/verify-publish-chain.mjs --keep
 *   COMMUNITY_ID=com2 node scripts/verify-publish-chain.mjs
 */
const baseUrl = process.env.XXK_API_BASE_URL || 'http://localhost:3001';
const communityId = process.env.COMMUNITY_ID || 'com1';
const keepPublished = process.argv.includes('--keep');

const account = process.env.XXK_ACCOUNT || 'zhangshan';
const password = process.env.XXK_PASSWORD || 'password123';

const results = [];
let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, options);
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${options.method || 'GET'} ${path} returned non-JSON ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!res.ok || json?.success === false) {
    throw new Error(`${options.method || 'GET'} ${path} failed ${res.status}: ${JSON.stringify(json).slice(0, 600)}`);
  }
  return json;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function jsonRequest(path, token, body, method = 'POST') {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** 记录一条检查结果 */
function check(label, ok, detail) {
  results.push({ label, ok, detail });
  if (!ok) failed++;
  console.log(`${ok ? '  ✅' : '  ❌'} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function login() {
  const captcha = await request('/api/auth/captcha');
  const captchaKey = captcha?.data?.key;
  assert(captchaKey, 'captcha key missing');
  const res = await jsonRequest('/api/auth/login', null, {
    account,
    password,
    captchaKey,
    captchaCode: 'TEST1234',
  });
  const data = res.data;
  const token = data?.tokens?.accessToken || data?.accessToken;
  assert(token, 'access token missing');
  return { token, user: data?.user };
}

/** 首页信息流用的查询（与 feed 页一致：contentLevel 逗号分隔） */
const FEED_QUERY = 'contentLevel=DIARY,TRAVELOGUE,ESSAY&limit=100';

async function verifyPublished(target, token) {
  const { id, kind, title } = target;
  console.log(`\n── ${kind}｜${title}`);

  // ④ 统一帖子数据
  const detail = await request(`/api/posts/${id}`, { headers: authHeaders(token) });
  const post = detail.data;
  check('④ 写入统一帖子数据', post?.visibility === 'PUBLIC' && post?.communityId === communityId,
    `visibility=${post?.visibility} communityId=${post?.communityId} contentLevel=${post?.contentLevel}`);

  // ⑤ 首页信息流（游客视角，验证真的对外可见）
  const feed = await request(`/api/posts?${FEED_QUERY}`);
  const inFeed = (feed.data || []).some((p) => p.id === id);
  check('⑤ 出现在首页信息流', inFeed, `信息流共 ${(feed.data || []).length} 条`);

  // ⑥ 社区主页
  const community = await request(`/api/social/communities/${communityId}/posts?limit=100`, {
    headers: authHeaders(token),
  });
  const inCommunity = (community.data?.posts || community.data || []).some((p) => p.id === id);
  check(`⑥ 出现在社区主页(${communityId})`, inCommunity,
    `社区页共 ${(community.data?.posts || community.data || []).length} 条`);

  // ⑦ 个人主页
  const profile = await request(`/api/users/${account}/posts?limit=100`, { headers: authHeaders(token) });
  const inProfile = (profile.data || []).some((p) => p.id === id);
  check('⑦ 出现在个人主页', inProfile, `个人主页共 ${(profile.data || []).length} 条`);

  // ⑧-1 点赞
  const before = await request(`/api/posts/${id}`, { headers: authHeaders(token) });
  const likeBefore = before.data?.likeCount ?? 0;
  await jsonRequest(`/api/posts/${id}/like`, token);
  const afterLike = await request(`/api/posts/${id}`, { headers: authHeaders(token) });
  const likeAfter = afterLike.data?.likeCount ?? 0;
  check('⑧a 点赞生效', likeAfter === likeBefore + 1, `${likeBefore} → ${likeAfter}`);

  // ⑧-2 评论
  const marker = `发布链路验收评论 ${new Date().toISOString()}`;
  const created = await jsonRequest(`/api/posts/${id}/comments`, token, { content: marker });
  const commentId = created.data?.id;
  const comments = await request(`/api/posts/${id}/comments`, { headers: authHeaders(token) });
  const commentList = comments.data?.list || comments.data || [];
  const inComments = commentList.some((c) => c.id === commentId);
  check('⑧b 评论生效', Boolean(commentId) && inComments, `评论区共 ${commentList.length} 条`);

  // 回滚互动痕迹
  if (commentId) await request(`/api/posts/comments/${commentId}`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});
  await request(`/api/posts/${id}/like`, { method: 'DELETE', headers: authHeaders(token) }).catch(() => {});

  return { id, kind, title, commentId };
}

async function revert(target, token) {
  const { id, kind } = target;
  await jsonRequest(`/api/posts/${id}/unpublish`, token, {});
  const detail = await request(`/api/posts/${id}`, { headers: authHeaders(token) });
  const post = detail.data;
  const feed = await request(`/api/posts?${FEED_QUERY}`);
  const goneFromFeed = !(feed.data || []).some((p) => p.id === id);
  check(`↩︎  ${kind} 已撤回并恢复原状`, post?.visibility === 'PRIVATE' && post?.communityId === null && goneFromFeed,
    `visibility=${post?.visibility} communityId=${post?.communityId} 已离开信息流=${goneFromFeed}`);
}

async function pickTargets(token) {
  const diaries = await request('/api/posts/diaries', { headers: authHeaders(token) });
  const travelogues = await request('/api/posts/travelogues', { headers: authHeaders(token) });

  const privateDiary = (diaries.data || []).find((p) => p.visibility === 'PRIVATE');
  const privateTravelogue = (travelogues.data || []).find((p) => p.visibility === 'PRIVATE');

  const targets = [];
  if (privateDiary) targets.push({ id: privateDiary.id, kind: '日记', title: privateDiary.title || '(无标题)' });
  if (privateTravelogue) targets.push({ id: privateTravelogue.id, kind: '游记', title: privateTravelogue.title || '(无标题)' });

  if (!targets.length) {
    throw new Error('未找到处于 PRIVATE 状态的日记/游记，无法验证发布链路。请先准备一篇未发布内容。');
  }
  return targets;
}

const { token, user } = await login();
console.log(`账号：${account}（${user?.id}）`);
console.log(`目标社区：${communityId}`);
console.log(`模式：${keepPublished ? '发布并保留' : '发布→验证→撤回（可逆）'}`);

const targets = await pickTargets(token);
console.log(`待验证内容：${targets.map((t) => `${t.kind}《${t.title}》`).join('、')}`);

const published = [];
for (const target of targets) {
  await jsonRequest(`/api/posts/${target.id}/publish`, token, {
    locationPrecision: 'city',
    visibility: 'PUBLIC',
    communityId,
  });
  published.push(await verifyPublished(target, token));
}

if (!keepPublished) {
  console.log('\n── 回滚');
  for (const target of targets) {
    await revert(target, token);
  }
}

const summary = {
  baseUrl,
  account,
  communityId,
  mode: keepPublished ? 'keep' : 'revert',
  checks: results,
  passed: results.length - failed,
  failed,
};

console.log('\n' + JSON.stringify(summary, null, 2));
if (failed > 0) {
  console.error(`\n发布链路验收未通过：${failed} 项失败`);
  process.exit(1);
}
console.log('\n发布链路验收通过。');
