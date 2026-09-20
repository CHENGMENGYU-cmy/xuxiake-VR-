import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const base = 'http://127.0.0.1:3001/api';
const outPath = 'docs/app-synced-chain-evidence-2026-09-20.json';

const prefs = execFileSync('adb', [
  'exec-out',
  'run-as',
  'com.noah.glassesjourney',
  'cat',
  'shared_prefs/community_sync.xml',
]).toString('utf8');

const token = prefs.match(/<string name="access_token">([^<]+)<\/string>/)?.[1];
if (!token) throw new Error('No access token in device community_sync.xml');

const evidence = {
  startedAt: new Date().toISOString(),
  checks: [],
};

async function req(path, body, method = body === undefined ? 'GET' : 'POST') {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok || data?.success === false) {
    throw new Error(`${method} ${path} failed ${response.status}: ${text}`);
  }
  return data?.data ?? data;
}

function note(name, pass, detail = {}) {
  evidence.checks.push({ name, pass, detail });
}

async function poll(path, jobId) {
  for (let i = 0; i < 40; i++) {
    const job = await req(`${path}/${jobId}`);
    if (job.status === 'DONE' || job.status === 'FAILED') return job;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error(`Job ${jobId} did not finish`);
}

const snaps = await req('/posts/snaps');
evidence.snapsCount = snaps.length;
const appSnap = snaps[0];
if (!appSnap?.id) throw new Error('No synced App snapshot found');
evidence.appSnap = {
  id: appSnap.id,
  visibility: appSnap.visibility,
  contentLevel: appSnap.contentLevel,
  mediaCount: appSnap.mediaItems?.length ?? 0,
  vrMetadata: appSnap.vrMetadata,
};
note('App同步素材进入素材库', appSnap.contentLevel === 'SNAPSHOT', evidence.appSnap);
note('App同步素材默认私密', appSnap.visibility === 'PRIVATE', evidence.appSnap);

const diary = await req('/posts/diary/save', {
  snapId: appSnap.id,
  title: 'App 同步素材链路测试日记',
  content: '这是一篇由 App 同步素材保存出来的链路测试日记，用于验证素材到日记的关系。',
  status: 'private',
});
evidence.diary = {
  id: diary.id,
  contentLevel: diary.contentLevel,
  visibility: diary.visibility,
  sourceSnapIds: diary.vrMetadata?.sourceSnapIds,
};
note('App素材可保存为日记', diary.contentLevel === 'DIARY', evidence.diary);
note(
  '日记保留App素材来源',
  Array.isArray(diary.vrMetadata?.sourceSnapIds) && diary.vrMetadata.sourceSnapIds.includes(appSnap.id),
  evidence.diary,
);

const start = await req('/posts/travelogue/generate', {
  snapIds: [appSnap.id],
  diaryIds: [diary.id],
  prompt: '只整理这条App同步素材和对应日记，保持测试语气，不编造地点或经历。',
  style: '纪实',
  tone: '客观',
  length: '简短',
});
evidence.travelogueStart = start;
const job = await poll('/posts/travelogue/job', start.jobId);
evidence.travelogueJob = job;
note('App素材与日记可生成游记', job.status === 'DONE' && !!job.postId, job);

if (job.postId) {
  const travelogue = await req(`/posts/${job.postId}`);
  evidence.travelogue = {
    id: travelogue.id,
    contentLevel: travelogue.contentLevel,
    visibility: travelogue.visibility,
    sourceSnapIds: travelogue.vrMetadata?.sourceSnapIds,
    sourceDiaryIds: travelogue.vrMetadata?.sourceDiaryIds,
    mediaCount: travelogue.mediaItems?.length ?? 0,
  };
  note('游记保留App素材与日记来源', (
    travelogue.vrMetadata?.sourceSnapIds?.includes(appSnap.id) &&
    travelogue.vrMetadata?.sourceDiaryIds?.includes(diary.id)
  ), evidence.travelogue);
}

evidence.finishedAt = new Date().toISOString();
writeFileSync(outPath, JSON.stringify(evidence, null, 2));
console.log(JSON.stringify({ outPath, checks: evidence.checks }, null, 2));
