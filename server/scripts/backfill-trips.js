// 历史闪拍行程回填：为 trip_id 为空的 SNAPSHOT 按"连续日期"分桶生成行程。
// 幂等可重跑（只处理 trip_id IS NULL）。
// 用法：cd server && node scripts/backfill-trips.js
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function pad(n) { return String(n).padStart(2, '0'); }

function dateStr(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'root', password: 'root', database: 'xuxiake',
  });

  const [rows] = await conn.execute(
    `SELECT id, author_id, created_at, location_name FROM posts
     WHERE content_level = 'SNAPSHOT' AND trip_id IS NULL
     ORDER BY author_id, created_at ASC`
  );
  console.log(`待回填 SNAPSHOT: ${rows.length} 条`);

  // 按 author 分组
  const byAuthor = new Map();
  for (const row of rows) {
    const list = byAuthor.get(row.author_id) || [];
    list.push(row);
    byAuthor.set(row.author_id, list);
  }

  let tripCount = 0;
  let updated = 0;
  for (const [authorId, list] of byAuthor) {
    const trips = []; // { id, title, ids[] }
    let cur = null;
    let prevDate = null;
    let firstLocation = null;

    for (const row of list) {
      const d = new Date(row.created_at);
      const ds = dateStr(d);
      if (!row.location_name && firstLocation == null) firstLocation = row.location_name;
      if (cur === null || prevDate !== null && (d - prevDate) > ONE_DAY_MS) {
        cur = { id: uuidv4(), title: null, ids: [], startDate: ds, endDate: ds, location: row.location_name || null };
        trips.push(cur);
      } else {
        cur.endDate = ds;
        if (row.location_name && cur.location == null) cur.location = row.location_name;
      }
      prevDate = d;
      cur.ids.push(row.id);
    }

    for (const t of trips) {
      const title = t.startDate === t.endDate
        ? `行程 · ${t.startDate}`
        : `行程 · ${t.startDate} ~ ${t.endDate}`;
      const fullTitle = t.location ? `[${t.location}] ${title}` : title;
      for (const id of t.ids) {
        await conn.execute(`UPDATE posts SET trip_id = ?, trip_title = ? WHERE id = ?`, [t.id, fullTitle, id]);
        updated++;
      }
      tripCount++;
    }
    console.log(`  author ${authorId}: 分 ${trips.length} 段行程, 回填 ${trips.reduce((s, t) => s + t.ids.length, 0)} 条`);
  }

  console.log(`回填完成: 共 ${tripCount} 段行程, ${updated} 条记录`);
  await conn.end();
}

main().then(() => console.log('✅ 完成')).catch(e => { console.error('ERR:', e.message); process.exit(1); });
