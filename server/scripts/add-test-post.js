const mysql = require('mysql2/promise');

async function addTestPost() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'xuxiake'
  });

  try {
    const postId = 'test-post-' + Date.now();
    await connection.execute(
      'INSERT INTO posts (id, author_id, content, visibility, like_count, comment_count, view_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [postId, 'u1', '这是一条测试帖子，用于验证刷新功能是否正常工作！🎉', 'PUBLIC', 0, 0, 0]
    );
    console.log('测试帖子创建成功！ID:', postId);
  } catch (error) {
    console.error('创建帖子失败:', error.message);
  } finally {
    await connection.end();
  }
}

addTestPost();
