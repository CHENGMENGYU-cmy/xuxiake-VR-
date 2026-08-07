import fs from 'fs';
import mysql from 'mysql2/promise';

const env = fs.readFileSync('.env', 'utf8');
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'));
  return m ? m[1].trim() : undefined;
};

const conn = await mysql.createConnection({
  host: get('DB_HOST') || 'localhost',
  port: +(get('DB_PORT') || 3306),
  user: get('DB_USER') || 'root',
  password: get('DB_PASSWORD') || 'root',
  database: get('DB_NAME') || 'xuxiake',
});

const id = '13d9c9a3-1aba-45a9-b07b-b3d0c36d73e8';

const [rows] = await conn.query(
  'SELECT id, author_id, content_level, visibility, parent_post_id, vr_metadata, created_at, title FROM posts WHERE id = ?',
  [id]
);
console.log('posts where id:', rows.length);
if (rows[0]) {
  const r = rows[0];
  console.log(' author:', r.author_id, 'level:', r.content_level, 'vis:', r.visibility, 'parent:', r.parent_post_id, 'createdAt:', r.created_at, 'title:', r.title);
  console.log(' vr_metadata:', String(r.vr_metadata).slice(0, 400));
}

const [refs] = await conn.query(
  'SELECT id, parent_post_id, content_level, author_id, title FROM posts WHERE parent_post_id = ? OR vr_metadata LIKE ?',
  [id, `%${id}%`]
);
console.log('posts referencing it:', refs.length);
for (const r of refs) {
  console.log(' REF', r.id, '| parent:', r.parent_post_id, '| level:', r.content_level, '| author:', r.author_id, '| title:', String(r.title || '').slice(0, 40));
}

await conn.end();
