// 修复缩略图覆盖 bug：为所有指向旧固定缩略图(thumb_.jpg/thumb_.png)的 media_items
// 重新生成唯一缩略图并更新 thumbnail_url，随后清理旧固定文件。
// 用法：cd server && node scripts/fix-thumbnails.js
const mysql = require('mysql2/promise');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');
const THUMB_DIR = path.join(UPLOADS_ROOT, 'thumbnails');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'root', password: 'root', database: 'xuxiake',
  });

  const [rows] = await conn.execute(
    `SELECT id, url, thumbnail_url FROM media_items
     WHERE thumbnail_url IN ('/uploads/thumbnails/thumb_.jpg', '/uploads/thumbnails/thumb_.png')`
  );
  console.log(`找到 ${rows.length} 条旧缩略图引用`);

  let fixed = 0;
  let failed = 0;
  for (const row of rows) {
    const rel = row.url.replace(/^\/uploads\//, '');
    const srcAbs = path.join(UPLOADS_ROOT, rel);
    if (!fs.existsSync(srcAbs)) {
      failed++;
      console.log('  ⚠ 原图缺失:', row.url);
      continue;
    }
    const thumbName = `${uuidv4()}_thumb${path.extname(srcAbs)}`;
    const thumbAbs = path.join(THUMB_DIR, thumbName);
    try {
      await sharp(srcAbs).resize(400, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toFile(thumbAbs);
      const thumbUrl = `/uploads/thumbnails/${thumbName}`;
      await conn.execute(`UPDATE media_items SET thumbnail_url = ? WHERE id = ?`, [thumbUrl, row.id]);
      fixed++;
    } catch (e) {
      failed++;
      console.log('  ⚠ 缩略图生成失败:', row.url, e.message);
    }
  }

  for (const old of ['thumb_.jpg', 'thumb_.png']) {
    const p = path.join(THUMB_DIR, old);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log('已删除旧固定缩略图:', old);
    }
  }

  console.log(`修复完成: 成功 ${fixed} 条, 失败 ${failed} 条`);
  await conn.end();
}

main().then(() => console.log('✅ 完成')).catch(e => { console.error('ERR:', e.message); process.exit(1); });
