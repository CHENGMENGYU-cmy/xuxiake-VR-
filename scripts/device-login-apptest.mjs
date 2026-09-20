import { execFileSync } from 'node:child_process';

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

const xml = [
  "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",
  '<map>',
  `<string name="access_token">${escapeXml(tokens.accessToken)}</string>`,
  `<string name="refresh_token">${escapeXml(tokens.refreshToken)}</string>`,
  `<string name="account_id">${escapeXml(user.id)}</string>`,
  `<string name="account_display">${escapeXml(user.displayName || user.username)}</string>`,
  '</map>',
  '',
].join('\n');

try {
  execFileSync('adb', ['shell', 'run-as', 'com.noah.glassesjourney', 'mkdir', 'shared_prefs']);
} catch {
  // The directory may already exist.
}

execFileSync(
  'adb',
  ['shell', 'run-as', 'com.noah.glassesjourney', 'tee', 'shared_prefs/community_sync.xml'],
  { input: xml, stdio: ['pipe', 'ignore', 'pipe'] },
);

console.log(`wrote community_sync.xml for ${user.username}`);
