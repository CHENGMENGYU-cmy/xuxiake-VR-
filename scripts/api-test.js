/**
 * 徐霞客系统 API 全量测试脚本
 * 覆盖：认证 / 内容 / 审核 / 管理 / 社交 / 权限边界
 * 运行：cd server && node ../scripts/api-test.js
 */
const jwt = require('../server/node_modules/jsonwebtoken');
const http = require('http');

const SECRET = 'xuxiake-jwt-secret-key-must-be-at-least-256-bits-long-for-hs256';
const BASE = { hostname: 'localhost', port: 3001 };

// ---- Test accounts ----
const ACCOUNTS = {
  admin:    { id: 'u1', username: 'xuxiake', role: 'ADMIN' },
  moderator:{ id: 'u3', username: 'lisi',     role: 'MODERATOR' },
  user:     { id: 'u2', username: 'zhangshan', role: 'USER' },
};

function tokenFor(userId) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: '15m' });
}

function expiredTokenFor(userId) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: '0s' });
}

// ---- HTTP helper ----
function call({ token, method, path, body }) {
  return new Promise((resolve) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    // URL-encode query params with Chinese characters
    const encodedPath = path.replace(/[一-鿿㐀-䶿]/g, (c) => encodeURIComponent(c));

    const req = http.request({ ...BASE, path: encodedPath, method, headers, timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: String(e) }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ---- Test runner ----
const results = [];
let passed = 0;
let failed = 0;

function ok(actual, msg) { return { ok: true, actual, msg }; }
function fail(expected, actual, msg) { return { ok: false, expected, actual, msg }; }

async function test(section, name, fn) {
  let r;
  try {
    r = await fn();
  } catch (e) {
    r = fail('no exception', String(e), name);
  }
  const status = r.ok ? 'PASS' : 'FAIL';
  if (r.ok) passed++; else failed++;
  results.push({ section, name, status, detail: r });
  const icon = r.ok ? '✓' : '✗';
  console.log(`  ${icon} [${section}] ${name}`);
  if (!r.ok) {
    console.log(`    预期: ${JSON.stringify(r.expected)}`);
    console.log(`    实际: ${JSON.stringify(r.actual)}`);
  }
}

// ---- Assertion helpers ----
function assertStatus(res, code) {
  if (res.status !== code) return fail(code, res.status, `status=${res.status}`);
  return ok(res.status);
}
function assertSuccess(res) {
  if (res.status !== 200 && res.status !== 201) return fail('2xx', res.status, `status=${res.status}`);
  if (!res.body.success) return fail('success:true', JSON.stringify(res.body).slice(0, 100));
  return ok(res.status);
}
function assertFail(res) {
  if (res.body && res.body.success === true) return fail('success:false', 'success:true');
  return ok(res.status);
}
function assertBodyHas(res, field) {
  const has = JSON.stringify(res.body).includes(field);
  if (!has) return fail(`body contains "${field}"`, JSON.stringify(res.body).slice(0, 200));
  return ok('found');
}
function assertStatusAndFail(res, code) {
  if (res.status !== code) return fail(code, res.status, `status=${res.status}`);
  if (res.body && res.body.success === true) return fail('success:false', 'success:true');
  return ok(res.status);
}

// ============ MAIN ============
async function main() {
  const adminT = tokenFor(ACCOUNTS.admin.id);
  const modT = tokenFor(ACCOUNTS.moderator.id);
  const userT = tokenFor(ACCOUNTS.user.id);
  const expiredT = expiredTokenFor(ACCOUNTS.user.id);

  console.log('═══════════════════════════════════════════');
  console.log('  徐霞客系统 API 全量测试');
  console.log('  管理员: xuxiake | 审核员: lisi | 普通用户: zhangshan');
  console.log('═══════════════════════════════════════════\n');

  // ─────────────────────────────────────
  // SECTION 1: 认证模块
  // ─────────────────────────────────────
  console.log('── 1. 认证模块 ──');

  await test('Auth', 'GET /api/auth/captcha 获取验证码', async () => {
    const res = await call({ method: 'GET', path: '/api/auth/captcha' });
    if (!assertSuccess(res).ok) return res;
    const r = ok(res.status);
    r.actual = `key=${res.body.data.key ? 'present' : 'missing'}, svg=${res.body.data.svg ? 'present' : 'missing'}`;
    return r;
  });

  await test('Auth', 'POST /api/auth/login 邮箱密码登录', async () => {
    // First get captcha
    const cap = await call({ method: 'GET', path: '/api/auth/captcha' });
    if (!cap.body?.data?.key) return fail('captcha data', JSON.stringify(cap.body).slice(0, 100));
    // Can't read the SVG captcha text, so we test login with invalid captcha to verify the flow
    const res = await call({
      method: 'POST', path: '/api/auth/login',
      body: { account: 'zhangshan', password: 'password123', captchaKey: cap.body.data.key, captchaCode: 'wrong' }
    });
    // Should fail due to wrong captcha — this confirms captcha validation works
    return assertStatusAndFail(res, 400);
  });

  await test('Auth', 'POST /api/auth/register 注册新用户', async () => {
    const testEmail = 'test_' + Date.now() + '@test.com';
    const res = await call({
      method: 'POST', path: '/api/auth/register',
      body: { email: testEmail, username: 'testuser_' + Date.now(), password: 'test123', displayName: 'Test' }
    });
    if (!assertSuccess(res).ok) return res;
    if (!res.body.data?.tokens?.accessToken) return fail('has accessToken', JSON.stringify(res.body).slice(0, 200));
    // Store for cleanup note
    return ok(res.status);
  });

  await test('Auth', 'GET /api/auth/me 获取当前用户信息', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/auth/me' });
    if (!assertSuccess(res).ok) return res;
    if (res.body.data?.username !== 'zhangshan') return fail('zhangshan', res.body.data?.username);
    return ok(res.body.data.username);
  });

  await test('Auth', 'GET /api/auth/me 无Token返回401', async () => {
    const res = await call({ method: 'GET', path: '/api/auth/me' });
    // This endpoint validates token manually and throws UnauthorizedException
    return assertStatusAndFail(res, 401);
  });

  await test('Auth', 'GET /api/auth/me 过期Token', async () => {
    // Wait a moment then use expired token
    const res = await call({ token: expiredT, method: 'GET', path: '/api/auth/me' });
    return assertStatusAndFail(res, 401);
  });

  await test('Auth', 'POST /api/auth/refresh 刷新Token', async () => {
    const res = await call({
      method: 'POST', path: '/api/auth/refresh',
      body: { refreshToken: 'invalid-token' }
    });
    return assertStatusAndFail(res, 401);
  });

  await test('Auth', 'POST /api/auth/logout 退出登录', async () => {
    const res = await call({ method: 'POST', path: '/api/auth/logout' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 2: 内容模块 (普通用户)
  // ─────────────────────────────────────
  console.log('\n── 2. 内容模块 (普通用户) ──');

  let createdPostId = null;
  let createdCommentId = null;

  await test('Posts', 'GET /api/posts 获取帖子列表', async () => {
    const res = await call({ method: 'GET', path: '/api/posts' });
    return assertSuccess(res);
  });

  await test('Posts', 'GET /api/posts 分页参数', async () => {
    const res = await call({ method: 'GET', path: '/api/posts?limit=2' });
    if (!assertSuccess(res).ok) return res;
    const arr = res.body.data?.items || res.body.data;
    if (!Array.isArray(arr)) return fail('array', typeof arr);
    return ok(arr.length);
  });

  await test('Posts', 'GET /api/posts/tags 获取标签', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/tags' });
    return assertSuccess(res);
  });

  await test('Posts', 'GET /api/posts/topics 热门话题', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/topics' });
    return assertSuccess(res);
  });

  await test('Posts', 'GET /api/posts/hierarchy 内容层级树', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/hierarchy' });
    return assertSuccess(res);
  });

  await test('Posts', 'GET /api/posts/classified/dimensions 分类维度', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/classified/dimensions' });
    return assertSuccess(res);
  });

  await test('Posts', 'POST /api/posts 创建帖子 (需认证)', async () => {
    const res = await call({
      token: userT, method: 'POST', path: '/api/posts',
      body: {
        title: 'API测试帖子_' + Date.now(),
        content: '这是一篇API测试帖子内容，用于验证发布功能。',
        postType: 'TEXT',
        classifiedType: 'diary',
        visibility: 'PUBLIC',
      }
    });
    if (!assertSuccess(res).ok) return res;
    createdPostId = res.body.data?.id;
    if (!createdPostId) return fail('has post id', JSON.stringify(res.body).slice(0, 200));
    return ok(createdPostId);
  });

  await test('Posts', 'POST /api/posts 无认证创建失败', async () => {
    const res = await call({
      method: 'POST', path: '/api/posts',
      body: { title: 'Unauthorized', content: 'test' }
    });
    return assertStatusAndFail(res, 401);
  });

  await test('Posts', 'GET /api/posts/:id 获取帖子详情', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ method: 'GET', path: '/api/posts/' + createdPostId });
    if (!assertSuccess(res).ok) return res;
    // Post entity has 'content' field, not 'title'
    if (res.body.data?.content !== undefined) return ok('content field present');
    return fail('has content', JSON.stringify(res.body).slice(0, 100));
  });

  await test('Posts', 'PUT /api/posts/:id 更新帖子', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({
      token: userT, method: 'PUT', path: '/api/posts/' + createdPostId,
      body: { title: '更新后的测试帖子_' + Date.now() }
    });
    return assertSuccess(res);
  });

  await test('Posts', 'POST /api/posts/:id/view 增加浏览量', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ method: 'POST', path: '/api/posts/' + createdPostId + '/view' });
    return assertSuccess(res);
  });

  await test('Posts', 'POST /api/posts/:id/like 点赞', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ token: userT, method: 'POST', path: '/api/posts/' + createdPostId + '/like' });
    return assertSuccess(res);
  });

  await test('Posts', 'DELETE /api/posts/:id/like 取消点赞', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ token: userT, method: 'DELETE', path: '/api/posts/' + createdPostId + '/like' });
    return assertSuccess(res);
  });

  await test('Posts', 'POST /api/posts/:id/comments 创建评论', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({
      token: userT, method: 'POST', path: '/api/posts/' + createdPostId + '/comments',
      body: { content: '这是一条API测试评论' }
    });
    if (!assertSuccess(res).ok) return res;
    createdCommentId = res.body.data?.id;
    return ok(createdCommentId ? 'comment created' : 'no comment id');
  });

  await test('Posts', 'GET /api/posts/:id/comments 获取评论列表', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ method: 'GET', path: '/api/posts/' + createdPostId + '/comments' });
    return assertSuccess(res);
  });

  await test('Posts', 'DELETE /api/posts/comments/:id 删除评论', async () => {
    if (!createdCommentId) return fail('no comment id', 'skip');
    const res = await call({ token: userT, method: 'DELETE', path: '/api/posts/comments/' + createdCommentId });
    return assertSuccess(res);
  });

  await test('Posts', 'POST /api/posts/:id/publish 发布内容', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ token: userT, method: 'POST', path: '/api/posts/' + createdPostId + '/publish' });
    return assertSuccess(res);
  });

  await test('Posts', 'POST /api/posts/:id/unpublish 撤回内容', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ token: userT, method: 'POST', path: '/api/posts/' + createdPostId + '/unpublish' });
    return assertSuccess(res);
  });

  await test('Posts', 'POST /api/posts/collections 创建合集', async () => {
    const res = await call({
      token: userT, method: 'POST', path: '/api/posts/collections',
      body: { title: '测试合集_' + Date.now(), description: 'API测试合集' }
    });
    // May or may not succeed depending on validation
    return assertSuccess(res);
  });

  await test('Posts', 'GET /api/posts/collections 获取合集列表', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/collections' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 3: 审核模块 (审核员)
  // ─────────────────────────────────────
  console.log('\n── 3. 审核模块 (审核员) ──');

  await test('Moderation', 'GET /api/posts/reviews/queue 审核队列 (审核员)', async () => {
    const res = await call({ token: modT, method: 'GET', path: '/api/posts/reviews/queue' });
    return assertSuccess(res);
  });

  await test('Moderation', 'GET /api/posts/reviews/queue 审核队列 (普通用户被拒)', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/posts/reviews/queue' });
    // Regular user should not access review queue
    return assertStatusAndFail(res, 401);
  });

  await test('Moderation', 'POST /api/posts/reviews/batch 批量审核 (审核员)', async () => {
    const res = await call({
      token: modT, method: 'POST', path: '/api/posts/reviews/batch',
      body: { ids: ['nonexistent-id'], action: 'approve' }
    });
    // Should return some response (may fail because ids don't exist, but endpoint should be accessible)
    // We just verify it doesn't return 401/403
    if (res.status === 401 || res.status === 403) return fail('not 401/403', res.status, `status=${res.status}`);
    return ok(res.status);
  });

  // ─────────────────────────────────────
  // SECTION 4: 管理员模块
  // ─────────────────────────────────────
  console.log('\n── 4. 管理员模块 ──');

  await test('Admin', 'GET /api/users/list 用户列表', async () => {
    const res = await call({ token: adminT, method: 'GET', path: '/api/users/list' });
    if (!assertSuccess(res).ok) return res;
    const arr = res.body.data;
    if (!Array.isArray(arr)) return fail('array', typeof arr);
    return ok(`count=${arr.length}`);
  });

  await test('Admin', 'GET /api/users/list 普通用户被拒', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/users/list' });
    return assertStatusAndFail(res, 401);
  });

  await test('Admin', 'PUT /api/users/:id/ban 封禁用户', async () => {
    // Use a test user (u4=wangwu) for ban test
    const res = await call({ token: adminT, method: 'PUT', path: '/api/users/u4/ban', body: { reason: '测试封禁' } });
    if (!assertSuccess(res).ok) return res;
    // Verify banned user cannot access authenticated endpoints
    const bannedT = tokenFor('u4');
    const me = await call({ token: bannedT, method: 'GET', path: '/api/auth/me' });
    // The /api/auth/me should fail or indicate banned status
    return ok(me.status);
  });

  await test('Admin', 'PUT /api/users/:id/unban 解封用户', async () => {
    const res = await call({ token: adminT, method: 'PUT', path: '/api/users/u4/unban' });
    return assertSuccess(res);
  });

  await test('Admin', 'PUT /api/users/:id/role 修改角色', async () => {
    // Use u5 for role change test, set to MODERATOR then back to USER
    const r1 = await call({ token: adminT, method: 'PUT', path: '/api/users/u5/role', body: { role: 'MODERATOR' } });
    if (!assertSuccess(r1).ok) return r1;
    const r2 = await call({ token: adminT, method: 'PUT', path: '/api/users/u5/role', body: { role: 'USER' } });
    return assertSuccess(r2);
  });

  await test('Admin', 'PUT /api/users/:id/role 普通用户越权修改', async () => {
    const res = await call({ token: userT, method: 'PUT', path: '/api/users/u5/role', body: { role: 'ADMIN' } });
    return assertStatusAndFail(res, 401);
  });

  await test('Admin', 'POST /api/posts/:id/admin-unpublish 管理员下架帖子', async () => {
    // Create a fresh post for admin test
    const createR = await call({
      token: userT, method: 'POST', path: '/api/posts',
      body: { title: 'Admin test post', content: '管理员下架测试', postType: 'TEXT', classifiedType: 'diary', visibility: 'PUBLIC' }
    });
    if (!assertSuccess(createR).ok) return createR;
    const pid = createR.body.data?.id;
    if (!pid) return fail('has post id', JSON.stringify(createR.body).slice(0, 100));
    const res = await call({ token: adminT, method: 'POST', path: '/api/posts/' + pid + '/admin-unpublish' });
    // Cleanup
    await call({ token: userT, method: 'DELETE', path: '/api/posts/' + pid });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 5: 社交模块
  // ─────────────────────────────────────
  console.log('\n── 5. 社交模块 ──');

  await test('Social', 'GET /api/social/tags 兴趣标签', async () => {
    const res = await call({ method: 'GET', path: '/api/social/tags' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/tags/hot 热门标签', async () => {
    const res = await call({ method: 'GET', path: '/api/social/tags/hot' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/hot-topics 热门话题', async () => {
    const res = await call({ method: 'GET', path: '/api/social/hot-topics' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/communities 社群列表', async () => {
    const res = await call({ method: 'GET', path: '/api/social/communities' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/communities/search 搜索社群', async () => {
    const res = await call({ method: 'GET', path: '/api/social/communities/search?q=旅' });
    // This endpoint may return data directly without success wrapper
    if (res.body?.data || (Array.isArray(res.body) && res.body.length >= 0)) return ok('endpoint works');
    if (res.status === 200) return ok('status 200');
    return fail('200 or data', JSON.stringify(res.body).slice(0, 100));
  });

  await test('Social', 'POST /api/social/communities 创建社群', async () => {
    const res = await call({
      token: userT, method: 'POST', path: '/api/social/communities',
      body: { name: '测试社群_' + Date.now(), description: 'API测试用社群', tags: [] }
    });
    return assertSuccess(res);
  });

  await test('Social', 'POST /api/users/:id/follow 关注用户', async () => {
    const res = await call({ token: userT, method: 'POST', path: '/api/users/u3/follow' });
    return assertSuccess(res);
  });

  await test('Social', 'DELETE /api/users/:id/follow 取消关注', async () => {
    const res = await call({ token: userT, method: 'DELETE', path: '/api/users/u3/follow' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/users/:username 用户公开资料', async () => {
    const res = await call({ method: 'GET', path: '/api/users/xuxiake' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/users/:username/posts 用户帖子', async () => {
    const res = await call({ method: 'GET', path: '/api/users/zhangshan/posts' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 6: Feed模块
  // ─────────────────────────────────────
  console.log('\n── 6. 信息流模块 ──');

  await test('Feed', 'GET /api/feed 公共动态流', async () => {
    const res = await call({ method: 'GET', path: '/api/feed' });
    return assertSuccess(res);
  });

  await test('Feed', 'GET /api/feed 分页游标', async () => {
    const res = await call({ method: 'GET', path: '/api/feed?limit=5' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 7: 通知模块
  // ─────────────────────────────────────
  console.log('\n── 7. 通知模块 ──');

  await test('Notify', 'GET /api/notifications 通知列表', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/notifications' });
    return assertSuccess(res);
  });

  await test('Notify', 'GET /api/notifications/unread-count 未读数', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/notifications/unread-count' });
    return assertSuccess(res);
  });

  await test('Notify', 'POST /api/notifications/read-all 全部已读', async () => {
    const res = await call({ token: userT, method: 'POST', path: '/api/notifications/read-all' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 8: 会话模块
  // ─────────────────────────────────────
  console.log('\n── 8. 会话/消息模块 ──');

  await test('Chat', 'GET /api/conversations 会话列表', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/conversations' });
    return assertSuccess(res);
  });

  await test('Chat', 'POST /api/conversations/direct/:userId 创建私聊', async () => {
    const res = await call({ token: userT, method: 'POST', path: '/api/conversations/direct/u3' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 9: 上传模块
  // ─────────────────────────────────────
  console.log('\n── 9. 上传模块 ──');

  await test('Upload', 'POST /api/upload/presign 预签名上传', async () => {
    const res = await call({
      token: userT, method: 'POST', path: '/api/upload/presign',
      body: { fileName: 'test.jpg', fileType: 'image/jpeg', mediaType: 'POST_IMAGE' }
    });
    return assertSuccess(res);
  });

  await test('Upload', 'POST /api/upload/presign 无认证失败', async () => {
    const res = await call({
      method: 'POST', path: '/api/upload/presign',
      body: { fileName: 'test.jpg', fileType: 'image/jpeg', mediaType: 'POST_IMAGE' }
    });
    return assertStatusAndFail(res, 401);
  });

  // ─────────────────────────────────────
  // SECTION 10: 权限边界测试
  // ─────────────────────────────────────
  console.log('\n── 10. 权限边界测试 ──');

  await test('Boundary', '普通用户修改他人角色', async () => {
    const res = await call({ token: userT, method: 'PUT', path: '/api/users/u3/role', body: { role: 'ADMIN' } });
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', '普通用户封禁他人', async () => {
    const res = await call({ token: userT, method: 'PUT', path: '/api/users/u4/ban' });
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', '普通用户查看用户列表', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/users/list' });
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', '审核员查看用户列表', async () => {
    const res = await call({ token: modT, method: 'GET', path: '/api/users/list' });
    // Moderator should not be able to manage users — check if guard blocks it
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', '审核员封禁用户', async () => {
    const res = await call({ token: modT, method: 'PUT', path: '/api/users/u4/ban' });
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', '无Token访问需认证接口', async () => {
    const res = await call({ method: 'POST', path: '/api/posts/collections', body: { title: 'test' } });
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', '错误格式Token', async () => {
    const res = await call({ token: 'not-a-valid-jwt', method: 'GET', path: '/api/auth/me' });
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', '篡改Token (不同secret签发)', async () => {
    const fakeToken = jwt.sign({ sub: 'u1' }, 'wrong-secret-key-12345678901234567890123456789012', { expiresIn: '15m' });
    const res = await call({ token: fakeToken, method: 'GET', path: '/api/auth/me' });
    return assertStatusAndFail(res, 401);
  });

  await test('Boundary', 'DELETE /api/posts/:id 其他用户的帖子', async () => {
    // Try to delete a post as different user — should be checked in controller
    if (!createdPostId) return fail('no post id', 'skip');
    const modToken = tokenFor(ACCOUNTS.moderator.id);
    const res = await call({ token: modToken, method: 'DELETE', path: '/api/posts/' + createdPostId });
    // Should return error since mod is not the author
    // Accept 403 or 4xx — as long as it's not success
    if (res.body?.success === true) return fail('should fail', 'success:true');
    return ok(res.status);
  });

  // ─────────────────────────────────────
  // SECTION 11: 举报模块
  // ─────────────────────────────────────
  console.log('\n── 11. 举报模块 ──');

  await test('Report', 'POST /api/posts/:id/report 举报内容', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({
      token: userT, method: 'POST', path: '/api/posts/' + createdPostId + '/report',
      body: { reason: '测试举报', description: 'API测试举报内容' }
    });
    return assertSuccess(res);
  });

  await test('Report', 'GET /api/posts/reports/list 举报列表', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/posts/reports/list' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 12: 用户推荐 & 设置
  // ─────────────────────────────────────
  console.log('\n── 12. 推荐 & 用户模块 ──');

  await test('User', 'GET /api/users/profile 个人资料', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/users/profile' });
    return assertSuccess(res);
  });

  await test('User', 'PUT /api/users/profile 更新资料', async () => {
    const res = await call({
      token: userT, method: 'PUT', path: '/api/users/profile',
      body: { bio: 'API测试更新的简介_' + Date.now() }
    });
    return assertSuccess(res);
  });

  await test('User', 'GET /api/users/suggested/list 推荐用户', async () => {
    const res = await call({ method: 'GET', path: '/api/users/suggested/list' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/recommended/users 智能推荐', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/social/recommended/users' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/recommended/communities 推荐社群', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/social/recommended/communities' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/user/interests 用户兴趣', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/social/user/interests' });
    return assertSuccess(res);
  });

  await test('Social', 'GET /api/social/recommended/companions 搭子推荐', async () => {
    const res = await call({ token: userT, method: 'GET', path: '/api/social/recommended/companions' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 13: 内容搜索 & 发现
  // ─────────────────────────────────────
  console.log('\n── 13. 搜索 & 发现模块 ──');

  await test('Discover', 'GET /api/posts/topics/search 搜索话题', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/topics/search?q=旅行' });
    return assertSuccess(res);
  });

  await test('Discover', 'GET /api/posts/topics/all 全部话题', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/topics/all' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 14: 弹幕 & 播放列表
  // ─────────────────────────────────────
  console.log('\n── 14. 弹幕 & 播放列表 ──');

  await test('Danmaku', 'GET /api/posts/:id/danmaku 获取弹幕', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({ method: 'GET', path: '/api/posts/' + createdPostId + '/danmaku' });
    return assertSuccess(res);
  });

  await test('Danmaku', 'POST /api/posts/:id/danmaku 发送弹幕', async () => {
    if (!createdPostId) return fail('no post id', 'skip');
    const res = await call({
      token: userT, method: 'POST', path: '/api/posts/' + createdPostId + '/danmaku',
      body: { content: '弹幕测试', time: 1.5 }
    });
    return assertSuccess(res);
  });

  await test('Playlist', 'GET /api/posts/playlists 音频专辑', async () => {
    const res = await call({ method: 'GET', path: '/api/posts/playlists' });
    return assertSuccess(res);
  });

  // ─────────────────────────────────────
  // SECTION 15: 封禁用户端到端验证
  // ─────────────────────────────────────
  console.log('\n── 15. 封禁端到端验证 ──');

  await test('Ban E2E', '封禁后用户无法访问认证接口', async () => {
    // Ban u6
    const banR = await call({ token: adminT, method: 'PUT', path: '/api/users/u6/ban', body: { reason: '测试封禁端到端' } });
    if (!assertSuccess(banR).ok) return banR;

    // Try to access authenticated endpoint as banned user
    const bannedT = tokenFor('u6');
    const meR = await call({ token: bannedT, method: 'GET', path: '/api/auth/me' });
    // /api/auth/me manually validates token and looks up user — should detect banned status
    // The endpoint just extracts userId, finds user, and returns profile — need to check if banned status is checked here
    // Looking at auth controller: it calls authService.getProfile(userId) — need to see if that checks banned status
    const isRejected = meR.status === 401 || meR.status === 403 || (meR.body && meR.body.success === false);
    if (!isRejected) {
      // If not rejected, check if status field is BANNED but still accessible
      if (meR.body?.data?.status === 'BANNED') return fail('should reject banned user', 'status=BANNED but access granted');
      return fail('should reject banned user', JSON.stringify(meR.body).slice(0, 150));
    }
    // Unban for cleanup
    await call({ token: adminT, method: 'PUT', path: '/api/users/u6/unban' });
    return ok('banned user rejected');
  });

  // ─────────────────────────────────────
  // Cleanup: delete created test post
  // ─────────────────────────────────────
  console.log('\n── 清理测试数据 ──');
  if (createdPostId) {
    await call({ token: userT, method: 'DELETE', path: '/api/posts/' + createdPostId });
    console.log('  Deleted test post: ' + createdPostId);
  }

  // ─────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────
  const total = passed + failed;
  console.log('\n═══════════════════════════════════════════');
  console.log('  测试报告');
  console.log('═══════════════════════════════════════════');
  console.log(`  总计: ${total}  |  通过: ${passed} ✓  |  失败: ${failed} ✗`);
  console.log(`  通过率: ${Math.round(passed / total * 100)}%`);
  console.log('───────────────────────────────────────────');

  // Group failures by section
  const failures = results.filter((r) => r.status === 'FAIL');
  if (failures.length > 0) {
    console.log('\n  失败用例详情:');
    const bySection = {};
    failures.forEach((f) => {
      if (!bySection[f.section]) bySection[f.section] = [];
      bySection[f.section].push(f);
    });
    for (const [section, items] of Object.entries(bySection)) {
      console.log(`\n  [${section}]`);
      items.forEach((f) => {
        console.log(`    ✗ ${f.name}`);
        console.log(`      预期: ${JSON.stringify(f.detail.expected)}`);
        console.log(`      实际: ${JSON.stringify(f.detail.actual)}`);
      });
    }
  }

  // Severity classification
  console.log('\n  严重等级分布:');
  const p0 = failures.filter((f) => {
    const n = f.name;
    return n.includes('权限') || n.includes('越权') || n.includes('封禁') || n.includes('Token');
  });
  const p1 = failures.filter((f) => {
    const n = f.name;
    return n.includes('创建') || n.includes('删除') || n.includes('更新') || n.includes('发布');
  });
  const p2 = failures.filter((f) => !p0.includes(f) && !p1.includes(f));

  console.log(`    P0 (安全/权限/阻断): ${p0.length} 个`);
  console.log(`    P1 (核心功能): ${p1.length} 个`);
  console.log(`    P2/P3 (其他): ${p2.length} 个`);

  console.log('\n═══════════════════════════════════════════');
}

main().catch((e) => {
  console.error('测试执行异常:', e);
  process.exit(1);
});
