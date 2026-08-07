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

// 找 zhangshan 和 u6 对应的用户
const [users] = await conn.query(
  "SELECT id, username, display_name FROM users WHERE username IN ('zhangshan','u6') OR id IN ('u6') LIMIT 20"
);
console.log('users:', JSON.stringify(users));

// 13d9c9a3 作者的完整信息
const [rows] = await conn.query(
  'SELECT id, username, display_name FROM users WHERE id = (SELECT author_id FROM posts WHERE id = ? LIMIT 1)',
  ['13d9c9a3-1aba-45a9-b07b-b3d0c36d73e8']
);
console.log('author of 13d9c9a3:', JSON.stringify(rows));

await conn.end();
