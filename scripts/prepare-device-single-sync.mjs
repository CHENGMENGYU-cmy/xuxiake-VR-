import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import sqlite3 from 'sqlite3';

const dbPath = 'docs/device-noah-travel-2026-09-20.db';
const packageName = 'com.noah.glassesjourney';
const photoPath =
  '/storage/emulated/0/Android/data/com.noah.glassesjourney/files/Noah/Photos/codex_community_sync_test.png';

const run = (cmd, args, options = {}) => execFileSync(cmd, args, options);

run('adb', ['shell', 'am', 'force-stop', packageName]);

const existingIds = await new Promise((resolve, reject) => {
  const db = new sqlite3.Database(dbPath);
  db.all('select id from travel_moments', (err, rows) => {
    if (err) {
      db.close();
      reject(err);
      return;
    }
    resolve(rows.map((row) => row.id));
  });
  db.close();
});

const testMomentId = `codex-test-${Date.now()}`;
const now = Date.now();
await new Promise((resolve, reject) => {
  const db = new sqlite3.Database(dbPath);
  db.run(
    `insert into travel_moments (
      id, tripId, captureTicketId, captureSource, capturedAt, mediaType,
      photoPath, videoPath, thumbnailPath, recordingEndedAt, durationMs,
      latitude, longitude, locationAccuracy, locationCapturedAt, placeName,
      city, address, weatherCode, weatherText, temperature, feelsLike,
      humidity, wind, activityCategoryId, categorySource, categoryConfidence,
      categoryLocked, note, reflectionStatus, reflectionWindowUntil,
      metadataStatus, errorMessage, createdAt, updatedAt
    ) values (
      ?, null, ?, 'CODEX_TEST', ?, 'PHOTO',
      ?, null, null, null, null,
      null, null, null, null, 'Codex App链路测试',
      '本地测试', '本地测试地址', null, null, null, null,
      null, null, 'unclassified', 'NONE', null,
      0, 'Codex 单条社区同步测试素材', 'NONE', null,
      'READY', null, ?, ?
    )`,
    [testMomentId, `ticket-${testMomentId}`, now, photoPath, now, now],
    (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    },
  );
});

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);
writeFileSync('docs/codex_community_sync_test.png', png);
run('adb', ['push', 'docs/codex_community_sync_test.png', photoPath], { stdio: 'ignore' });

run('adb', ['shell', 'run-as', packageName, 'rm', 'databases/noah_travel.db-wal'], {
  stdio: 'ignore',
});
run('adb', ['shell', 'run-as', packageName, 'rm', 'databases/noah_travel.db-shm'], {
  stdio: 'ignore',
});
run('adb', ['shell', 'run-as', packageName, 'tee', 'databases/noah_travel.db'], {
  input: readFileSync(dbPath),
  stdio: ['pipe', 'ignore', 'pipe'],
});

const suffix = Date.now().toString().slice(-6);
const username = `app${suffix}`;
const response = await fetch('http://127.0.0.1:3001/api/auth/register', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    username,
    email: `${username}@example.test`,
    password: 'Test1234',
  }),
});
const body = await response.json();
if (!response.ok || !body.success) {
  throw new Error(JSON.stringify(body));
}

const { user, tokens } = body.data;
const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const syncedSet = existingIds.map((id) => `<string>${escapeXml(id)}</string>`).join('\n');
const prefs = [
  "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",
  '<map>',
  `<string name="access_token">${escapeXml(tokens.accessToken)}</string>`,
  `<string name="refresh_token">${escapeXml(tokens.refreshToken)}</string>`,
  `<string name="account_id">${escapeXml(user.id)}</string>`,
  `<string name="account_display">${escapeXml(user.displayName || user.username)}</string>`,
  `<string name="synced_account_id">${escapeXml(user.id)}</string>`,
  `<set name="synced_moment_ids">${syncedSet}</set>`,
  '</map>',
  '',
].join('\n');

try {
  run('adb', ['shell', 'run-as', packageName, 'mkdir', 'shared_prefs']);
} catch {
  // Directory may already exist.
}
run('adb', ['shell', 'run-as', packageName, 'tee', 'shared_prefs/community_sync.xml'], {
  input: prefs,
  stdio: ['pipe', 'ignore', 'pipe'],
});

console.log(
  JSON.stringify({
    username,
    originalMarkedSynced: existingIds.length,
    pendingTestMomentId: testMomentId,
    photoPath,
  }),
);
