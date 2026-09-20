import { execFileSync } from 'node:child_process';

const postId = process.argv[2];
const prefs = execFileSync('adb', [
  'exec-out',
  'run-as',
  'com.noah.glassesjourney',
  'cat',
  'shared_prefs/community_sync.xml',
]).toString('utf8');

const token = prefs.match(/<string name="access_token">([^<]+)<\/string>/)?.[1];
if (!token) throw new Error('No token');

const response = await fetch(`http://127.0.0.1:3001/api/posts/${postId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
console.log(await response.text());
