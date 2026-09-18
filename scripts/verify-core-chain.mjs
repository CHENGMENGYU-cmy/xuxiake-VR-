const baseUrl = process.env.XXK_API_BASE_URL || 'http://localhost:3001';
const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const primaryUser = {
  account: 'zhangshan',
  password: 'password123',
};
const fallbackUser = {
  email: `codex-core-chain-${runId}@example.com`,
  username: `codex_chain_${runId}`,
  password: 'Codex123456',
  displayName: `核心链路验收 ${runId}`,
};

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
    throw new Error(`${options.method || 'GET'} ${path} failed ${res.status}: ${JSON.stringify(json).slice(0, 800)}`);
  }
  return json;
}

async function jsonRequest(path, token, body) {
  return request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function getCaptchaKey() {
  const captcha = await request('/api/auth/captcha');
  assert(captcha?.data?.key, 'captcha key missing');
  return captcha.data.key;
}

async function login(account, password) {
  const captchaKey = await getCaptchaKey();
  return jsonRequest('/api/auth/login', null, {
    account,
    password,
    captchaKey,
    captchaCode: 'TEST1234',
  });
}

async function loginOrRegister() {
  try {
    const result = await login(primaryUser.account, primaryUser.password);
    return { source: 'seed-login', result };
  } catch (err) {
    const message = String(err?.message || err);
    if (!/账号不存在|密码错误|Unauthorized|401|404/.test(message)) throw err;
    const reg = await jsonRequest('/api/auth/register', null, fallbackUser);
    return { source: 'registered-fallback', result: reg };
  }
}

async function uploadTinyImage(token) {
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
  const bytes = Uint8Array.from(Buffer.from(pngBase64, 'base64'));
  const form = new FormData();
  form.set('file', new Blob([bytes], { type: 'image/png' }), `core-chain-${runId}.png`);
  const uploaded = await request('/api/upload/image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  assert(uploaded?.data?.url, 'uploaded image url missing');
  return uploaded.data;
}

function findByOriginalId(items, originalId) {
  return items.find((item) => item?.vrMetadata?.originalId === originalId);
}

async function pollJob(path, token, jobId, label, maxAttempts = 40) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const jobResult = await request(`${path}/${jobId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const job = jobResult.data;
    if (job?.status === 'DONE') return job;
    if (job?.status === 'ERROR') throw new Error(`${label} job failed: ${job.error || 'unknown error'}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${label} job did not finish in time`);
}

const auth = await loginOrRegister();
const data = auth.result.data;
const token = data?.tokens?.accessToken || data?.accessToken;
const user = data?.user;
assert(token, 'access token missing');

const image = await uploadTinyImage(token);
const now = Date.now();
const importedImageOriginalId = `codex-img-${runId}`;
const importedTextOriginalId = `codex-text-${runId}`;
const tripId = `codex-trip-${runId}`;

const syncPayload = {
  trips: [
    { id: tripId, title: '核心链路验收行程', startTime: now - 3600_000, endTime: now, status: 'COMPLETED' },
  ],
  moments: [
    {
      id: importedImageOriginalId,
      source: 'APP_CORE_CHAIN_CHECK',
      capturedAt: now - 1800_000,
      photoPath: image.url,
      thumbnailPath: image.thumbnailUrl || image.url,
      textNote: '从 Android App 上传的图片素材：用于验证素材到日记再到游记的闭环。',
      gpsLat: 29.5647,
      gpsLng: 106.5507,
      locationName: '重庆·朝天门',
      weather: '晴',
      mood: '期待',
      scene: '江边步道',
      keywords: ['核心链路', 'App上传', '素材'],
      tripId,
      tripTitle: '核心链路验收行程',
    },
    {
      id: importedTextOriginalId,
      source: 'APP_CORE_CHAIN_CHECK',
      capturedAt: now - 900_000,
      textNote: '这是一条没有照片的视频的纯文字素材，用于验证文字闪拍不会被同步漏掉。',
      gpsLat: 29.5629,
      gpsLng: 106.5516,
      locationName: '重庆·来福士观景台',
      weather: '晴',
      mood: '平静',
      scene: '城市眺望',
      keywords: ['文字素材', '同步验收'],
      tripId,
      tripTitle: '核心链路验收行程',
    },
  ],
  reflections: [
    {
      momentId: importedImageOriginalId,
      recognizedText: '语音感想识别：江面很开阔，适合写成一段旅行日记。',
      status: 'DONE',
    },
  ],
  activityCategories: [
    { id: 'codex-check', displayName: '验收', iconKey: 'check', sortOrder: 1 },
  ],
};

const sync = await jsonRequest('/api/sync/snapshots', token, syncPayload);
assert(sync?.data?.imported >= 1 || sync?.data?.skipped >= 1, 'sync did not import or skip snapshots');

const snapsResult = await request('/api/posts/snaps', { headers: { Authorization: `Bearer ${token}` } });
const snaps = snapsResult.data || [];
const imageSnap = findByOriginalId(snaps, importedImageOriginalId);
const textSnap = findByOriginalId(snaps, importedTextOriginalId);
assert(imageSnap?.id, 'uploaded image snapshot not found in /api/posts/snaps');
assert(textSnap?.id, 'text-only snapshot not found in /api/posts/snaps');
assert((imageSnap.mediaItems || []).some((m) => m.type === 'IMAGE'), 'image snapshot has no image media item');
assert(textSnap.content?.includes('纯文字素材') || textSnap.vrMetadata?.mediaType === 'TEXT', 'text-only snapshot content/meta missing');

const manualDiaryResult = await jsonRequest('/api/posts/diary/save', token, {
  snapId: imageSnap.id,
  title: `核心链路验收日记 ${runId}`,
  content: `今天从 App 上传了一段素材，地点是${imageSnap.location?.name || imageSnap.locationName || '测试地点'}。这篇日记用于验证素材可以继续沉淀成日记。`,
  insight: '素材到日记的确定性验收',
  style: '纪实',
  tags: ['核心链路', '验收'],
  status: 'private',
  image: image.url,
  mood: '期待',
  weather: '晴',
});
const manualDiary = manualDiaryResult.data;
assert(manualDiary?.id, 'manual diary id missing');
assert(manualDiary.contentLevel === 'DIARY', 'manual diary contentLevel is not DIARY');

const diaryListResult = await request('/api/posts/diaries', { headers: { Authorization: `Bearer ${token}` } });
const diaryFromList = (diaryListResult.data || []).find((item) => item.id === manualDiary.id);
assert(diaryFromList, 'saved diary not found in /api/posts/diaries');

let aiDiaryJob = null;
try {
  const aiDiaryStart = await jsonRequest('/api/posts/diary/generate-batch', token, {
    snapIds: [imageSnap.id, textSnap.id],
    style: '纪实',
    tone: '温暖',
    length: '简短',
  });
  aiDiaryJob = await pollJob('/api/posts/ai/jobs', token, aiDiaryStart.data.jobId, 'AI diary', 30);
} catch (err) {
  aiDiaryJob = { status: 'SKIPPED_OR_FAILED', error: String(err?.message || err) };
}

const travelogueStart = await jsonRequest('/api/posts/travelogue/generate', token, {
  snapIds: [imageSnap.id, textSnap.id],
  diaryIds: [manualDiary.id],
  prompt: '把 App 上传素材和日记整理成一篇短游记，保留地点和感受。',
  style: '游记',
  tone: '温暖',
  length: '简短',
});
const travelogueJob = await pollJob('/api/posts/travelogue/job', token, travelogueStart.data.jobId, 'travelogue', 40);
assert(travelogueJob.postId, 'travelogue job finished without postId');

const traveloguesResult = await request('/api/posts/travelogues', { headers: { Authorization: `Bearer ${token}` } });
const travelogueFromList = (traveloguesResult.data || []).find((item) => item.id === travelogueJob.postId);
assert(travelogueFromList, 'generated travelogue not found in /api/posts/travelogues');
assert(travelogueFromList.contentLevel === 'TRAVELOGUE', 'travelogue contentLevel is not TRAVELOGUE');

const summary = {
  baseUrl,
  authSource: auth.source,
  user: user ? { id: user.id, username: user.username, email: user.email } : null,
  upload: { url: image.url, thumbnailUrl: image.thumbnailUrl || null, width: image.width, height: image.height },
  sync: sync.data,
  snapshots: [
    { id: imageSnap.id, originalId: importedImageOriginalId, mediaTypes: (imageSnap.mediaItems || []).map((m) => m.type), hasDiary: imageSnap.vrMetadata?.hasDiary || false },
    { id: textSnap.id, originalId: importedTextOriginalId, mediaTypes: (textSnap.mediaItems || []).map((m) => m.type), mediaType: textSnap.vrMetadata?.mediaType || null },
  ],
  diary: { id: manualDiary.id, title: manualDiary.title, contentLevel: manualDiary.contentLevel, parentPostId: manualDiary.parentPostId || null },
  aiDiary: aiDiaryJob?.status === 'DONE'
    ? { status: aiDiaryJob.status, postId: aiDiaryJob.postId }
    : { status: aiDiaryJob?.status, error: aiDiaryJob?.error },
  travelogue: { id: travelogueFromList.id, title: travelogueFromList.title, contentLevel: travelogueFromList.contentLevel, parentPostId: travelogueFromList.parentPostId || null },
};

console.log(JSON.stringify(summary, null, 2));
