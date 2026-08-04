const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', port: 3306, user: 'root', password: 'root', database: 'xuxiake' });
    console.log('✅ 数据库连接成功');

    // 所有用户的 contentLevel 分布
    const [levels] = await conn.execute(`
      SELECT author_id, content_level, COUNT(*) as cnt
      FROM posts
      GROUP BY author_id, content_level
      ORDER BY author_id
    `);
    console.log('\n📊 各用户 contentLevel 分布:');
    levels.forEach(r => console.log(`  ${r.author_id}: ${r.content_level} × ${r.cnt}`));

    // 用户表角色
    const [users] = await conn.execute(`SELECT id, username, role FROM users ORDER BY id`);
    console.log('\n👤 用户列表:');
    users.forEach(u => console.log(`  ${u.id} (${u.username}) role=${u.role}`));

    conn.end();
  } catch (e) { console.log('DB ERR:', e.message); }
})();
