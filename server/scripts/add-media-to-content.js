// 为 LOG/DIARY/TRAVELOGUE 记录补充图片媒体
// 按地点分配稳定图片 URL（picsum seed）
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// 根据地点关键词选择图片主题
function imageForLocation(location) {
  const seeds = {
    '漓江': 'lijiang', '阳朔': 'lijiang', '桂林': 'lijiang',
    '西湖': 'westlake', '杭州': 'westlake',
    '稻城': 'daocheng', '亚丁': 'daocheng', '牛奶海': 'milksea',
    '哈巴': 'haha', '雪山': 'snowmountain',
    '长沙': 'changsha', '火宫殿': 'changsha', '太平街': 'changsha',
    '拙政园': 'zhuozheng', '留园': 'liuyuan', '园林': 'garden', '苏州': 'garden',
    '蜈支洲': 'wuzhizhou', '三亚': 'sanya', '潜水': 'diving',
    '兵马俑': 'terracotta', '西安': 'xian',
    '亚布力': 'yabuli', '滑雪': 'ski',
  };
  for (const [key, seed] of Object.entries(seeds)) {
    if ((location || '').includes(key)) return seed;
  }
  return 'travel';
}

async function main() {
  const conn = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: 'root', database: 'xuxiake' });

  // 查询所有 LOG/DIARY/TRAVELOGUE 记录
  const [rows] = await conn.execute(
    `SELECT id, content_level, location_name FROM posts WHERE content_level IN ('LOG','DIARY','TRAVELOGUE')`
  );
  console.log(`找到 ${rows.length} 条记录（LOG/DIARY/TRAVELOGUE）`);

  let added = 0;
  let existing = 0;

  for (const row of rows) {
    // 检查是否已有图片媒体
    const [has] = await conn.execute(
      `SELECT id FROM media_items WHERE post_id = ? AND type = 'IMAGE' LIMIT 1`,
      [row.id]
    );
    if (has.length > 0) { existing++; continue; }

    const seed = imageForLocation(row.location_name || '');
    const base = `https://picsum.photos/seed/${seed}-${row.content_level}-${row.id.slice(0, 8)}/800/600`;
    const thumb = `https://picsum.photos/seed/${seed}-${row.content_level}-${row.id.slice(0, 8)}/400/300`;

    // 主图
    await conn.execute(
      `INSERT INTO media_items (id, post_id, type, url, thumbnail_url, sort_order, created_at)
       VALUES (?, ?, 'IMAGE', ?, ?, 0, NOW())`,
      [uuidv4(), row.id, base, thumb]
    );

    // 视频记录（用测试视频 URL，让媒体栏更丰富）
    if (row.content_level === 'LOG') {
      await conn.execute(
        `INSERT INTO media_items (id, post_id, type, url, thumbnail_url, duration, sort_order, created_at)
         VALUES (?, ?, 'VIDEO', ?, ?, 120, 1, NOW())`,
        [uuidv4(), row.id, 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4', thumb]
      );
    }

    // 同步更新 vr_metadata 的 image 字段
    const [metaRows] = await conn.execute(`SELECT vr_metadata FROM posts WHERE id = ?`, [row.id]);
    if (metaRows[0]?.vr_metadata) {
      try {
        const meta = JSON.parse(metaRows[0].vr_metadata);
        meta.image = base;
        await conn.execute(`UPDATE posts SET vr_metadata = ? WHERE id = ?`, [JSON.stringify(meta), row.id]);
      } catch {}
    }

    added++;
  }

  console.log(`新增媒体: ${added} 条, 已有跳过: ${existing} 条`);
  conn.end();
}

main().then(() => console.log('✅ 完成')).catch(e => { console.error('ERR:', e.message); process.exit(1); });
