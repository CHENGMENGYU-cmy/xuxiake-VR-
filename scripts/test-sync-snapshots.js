// 测试闪拍数据同步接口
// 用法: node scripts/test-sync-snapshots.js <username> <password>
const BASE = 'http://localhost:3001/api';

async function main() {
  const [username = 'zhangshan', password = 'password123'] = process.argv.slice(2);

  // 1. 登录
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      account: username,
      password,
      captchaKey: 'test-key',
      captchaCode: 'TEST1234',
    }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success) {
    console.error('登录失败:', JSON.stringify(loginJson));
    process.exit(1);
  }
  const token = loginJson.data.accessToken;
  console.log('✅ 登录成功:', username);

  // 2. 构造闪拍格式测试数据
  const now = Date.now();
  const payload = {
    trips: [
      { id: 'trip-001', title: '漓江光影之旅', startTime: now - 86400000 * 3, endTime: now - 86400000, status: 'COMPLETED' },
    ],
    moments: [
      {
        id: 'moment-001',
        capturedAt: now - 86400000 * 2,
        source: 'GLASSES_BUTTON',
        mediaType: 'PHOTO',
        photoPath: 'https://picsum.photos/seed/liang1/800/600',
        thumbnailPath: 'https://picsum.photos/seed/liang1/400/300',
        durationMs: null,
        activityCategoryId: 'photography',
        categorySource: 'MANUAL',
        categoryLocked: true,
        gpsLat: 24.78,
        gpsLng: 110.49,
        locationName: '桂林阳朔',
        weather: '晴',
        keywords: ['漓江', '日出', '延时摄影'],
        mood: '平静而满足',
        scene: '摄影',
      },
      {
        id: 'moment-002',
        capturedAt: now - 86400000 * 2 + 3600000,
        source: 'GLASSES_BUTTON',
        mediaType: 'VIDEO',
        photoPath: null,
        videoPath: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4',
        thumbnailPath: 'https://picsum.photos/seed/liang2/400/300',
        durationMs: 10000,
        activityCategoryId: 'unclassified',
        categorySource: 'NONE',
        categoryLocked: false,
        gpsLat: 24.79,
        gpsLng: 110.50,
        locationName: '桂林阳朔',
        weather: '多云',
        keywords: ['漓江', '竹筏'],
        scene: '旅行',
      },
      {
        id: 'moment-003',
        capturedAt: now - 86400000 * 2 + 7200000,
        source: 'VOICE_COMMAND',
        mediaType: 'PHOTO',
        photoPath: 'https://picsum.photos/seed/liang3/800/600',
        thumbnailPath: 'https://picsum.photos/seed/liang3/400/300',
        durationMs: null,
        activityCategoryId: 'food',
        categorySource: 'MANUAL',
        categoryLocked: false,
        gpsLat: 24.80,
        gpsLng: 110.51,
        locationName: '桂林米粉店',
        weather: '晴',
        keywords: ['米粉', '美食'],
        mood: '开心',
        scene: '美食',
      },
    ],
    reflections: [
      { momentId: 'moment-001', recognizedText: '在漓江边站了十五个小时，从漆黑等到漆黑。最美的其实是日出前那二十分钟。', audioPath: null, status: 'COMPLETED' },
      { momentId: 'moment-003', recognizedText: '这家米粉店开了四十年，汤底是老板凌晨三点熬的。', audioPath: null, status: 'COMPLETED' },
    ],
    activityCategories: [
      { id: 'photography', displayName: '摄影', iconKey: 'camera', sortOrder: 1 },
      { id: 'food', displayName: '美食', iconKey: 'restaurant', sortOrder: 2 },
    ],
  };

  // 3. 第一次同步
  console.log('\n📤 第一次同步...');
  let res = await fetch(`${BASE}/sync/snapshots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  let json = await res.json();
  console.log('响应:', JSON.stringify(json.data));
  console.log('导入条数:', json.data.imported, '(期望 3)');

  // 4. 第二次同步（幂等测试）
  console.log('\n📤 第二次同步（幂等测试）...');
  res = await fetch(`${BASE}/sync/snapshots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  json = await res.json();
  console.log('响应:', JSON.stringify(json.data));
  console.log('跳过条数:', json.data.skipped, '(期望 3)');

  // 5. 验证闪拍列表
  console.log('\n📥 查询我的闪拍...');
  res = await fetch(`${BASE}/posts/snaps`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  json = await res.json();
  const snaps = json.data || [];
  console.log('闪拍总数:', snaps.length);
  const synced = snaps.filter((s) => {
    try { return JSON.parse(s.vrMetadata || '{}').originalId; } catch { return false; }
  });
  console.log('同步导入的闪拍:', synced.length);
  synced.forEach((s) => {
    const meta = JSON.parse(s.vrMetadata);
    console.log(`  - [${meta.originalId}] ${s.locationName} | ${s.content?.slice(0, 30) || '(无感悟文字)'} | 媒体${s.mediaItems?.length || 0}个`);
  });
}

main().catch(err => { console.error('测试失败:', err.message); process.exit(1); });
