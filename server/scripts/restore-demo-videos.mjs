#!/usr/bin/env node
/**
 * 恢复演示视频素材。
 *
 * 与 restore-real-covers.mjs 同样的思路：运行时目录 server/uploads/ 被 .gitignore 忽略，
 * 不能随代码克隆交付，所以可交付资产放在 server/assets/demo-videos/，
 * 用本脚本校验并复制到 server/uploads/demo-videos/。
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const assetDir = join(repoRoot, 'server', 'assets', 'demo-videos');
const targetDir = join(repoRoot, 'server', 'uploads', 'demo-videos');
const manifestPath = join(assetDir, 'manifest.json');
const args = new Set(process.argv.slice(2));
const shouldCopy = args.has('--copy');
const force = args.has('--force');
const help = args.has('--help') || args.has('-h');

if (help) {
  console.log(`Restore demo video assets for local/demo environments.\n\nUsage:\n  node server/scripts/restore-demo-videos.mjs --check\n  node server/scripts/restore-demo-videos.mjs --copy\n  node server/scripts/restore-demo-videos.mjs --copy --force\n\nOptions:\n  --check   Verify the tracked asset bundle only. This is the default.\n  --copy    Copy assets into server/uploads/demo-videos.\n  --force   Overwrite existing files when copying.\n`);
  process.exit(0);
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

if (!existsSync(manifestPath)) {
  fail(`Missing manifest: ${manifestPath}`);
  process.exit();
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const failures = [];
for (const file of manifest.files || []) {
  const src = join(assetDir, file.fileName);
  if (!existsSync(src)) {
    failures.push(`missing asset ${file.fileName}`);
    continue;
  }
  const actualHash = sha256(src);
  if (actualHash !== file.sha256) {
    failures.push(`sha256 mismatch ${file.fileName}: expected ${file.sha256}, got ${actualHash}`);
  }
}

const mp4s = readdirSync(assetDir).filter((name) => name.toLowerCase().endsWith('.mp4')).sort();
if (mp4s.length !== manifest.fileCount) {
  failures.push(`file count mismatch: manifest ${manifest.fileCount}, found ${mp4s.length}`);
}

if (failures.length > 0) {
  for (const item of failures) fail(item);
  process.exit();
}

let copied = 0;
let skipped = 0;
if (shouldCopy) {
  mkdirSync(targetDir, { recursive: true });
  for (const file of manifest.files || []) {
    const src = join(assetDir, file.fileName);
    const dest = join(targetDir, file.fileName);
    if (existsSync(dest) && !force) {
      skipped++;
      continue;
    }
    copyFileSync(src, dest);
    copied++;
  }
}

console.log(JSON.stringify({
  ok: true,
  mode: shouldCopy ? 'copy' : 'check',
  assetDir,
  targetDir,
  fileCount: manifest.fileCount,
  copied,
  skipped,
  sql: 'server/sql/migrate-demo-video-assets-2026-09-17.sql',
}, null, 2));
