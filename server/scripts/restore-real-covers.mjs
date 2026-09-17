#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const repoRoot = resolve(process.cwd());
const assetDir = join(repoRoot, 'server', 'assets', 'real-covers');
const targetDir = join(repoRoot, 'server', 'uploads', 'real-covers');
const manifestPath = join(assetDir, 'manifest.json');
const args = new Set(process.argv.slice(2));
const shouldCopy = args.has('--copy');
const force = args.has('--force');
const help = args.has('--help') || args.has('-h');

if (help) {
  console.log(`Restore real cover images for local/demo environments.\n\nUsage:\n  node server/scripts/restore-real-covers.mjs --check\n  node server/scripts/restore-real-covers.mjs --copy\n  node server/scripts/restore-real-covers.mjs --copy --force\n\nOptions:\n  --check   Verify the tracked asset bundle only. This is the default.\n  --copy    Copy assets into server/uploads/real-covers.\n  --force   Overwrite existing files when copying.\n`);
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

const jpgs = readdirSync(assetDir).filter((name) => name.toLowerCase().endsWith('.jpg')).sort();
if (jpgs.length !== manifest.fileCount) {
  failures.push(`file count mismatch: manifest ${manifest.fileCount}, found ${jpgs.length}`);
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
  const attributionSrc = join(assetDir, 'ATTRIBUTION.json');
  if (existsSync(attributionSrc)) {
    const attributionDest = join(targetDir, 'ATTRIBUTION.json');
    if (!existsSync(attributionDest) || force) copyFileSync(attributionSrc, attributionDest);
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
  sql: 'server/sql/apply-real-community-images-2026-09-11.sql',
}, null, 2));

