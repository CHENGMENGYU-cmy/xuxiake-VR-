const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: 'root', database: 'xuxiake' });
    const [rows] = await conn.execute("SELECT content_level, COUNT(*) as cnt FROM posts WHERE author_id='u2' GROUP BY content_level");
    console.log('u2 帖子分布:', JSON.stringify(rows));
    const [u] = await conn.execute("SELECT id, username, role FROM users WHERE id='u2'");
    console.log('u2 用户:', JSON.stringify(u));
    conn.end();
  } catch (e) { console.log('DB ERR:', e.message); }
})();
