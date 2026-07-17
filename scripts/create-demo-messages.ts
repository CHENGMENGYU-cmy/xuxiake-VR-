/**
 * 消息请求功能演示脚本
 * 运行: npx tsx scripts/create-demo-messages.ts
 */

import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'xuxiake',
});

async function main() {
  await AppDataSource.initialize();
  console.log('数据库连接成功\n');

  // 获取两个用户
  const users = await AppDataSource.query('SELECT id, username, displayName FROM users LIMIT 2');

  if (users.length < 2) {
    console.log('需要至少2个用户才能创建演示数据');
    await AppDataSource.destroy();
    return;
  }

  const userA = users[0];
  const userB = users[1];

  console.log('=== 演示用户 ===');
  console.log(`用户A: ${userA.displayName} (@${userA.username})`);
  console.log(`用户B: ${userB.displayName} (@${userB.username})\n`);

  // 检查是否互相关注
  const followAB = await AppDataSource.query(
    'SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?',
    [userA.id, userB.id]
  );
  const followBA = await AppDataSource.query(
    'SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?',
    [userB.id, userA.id]
  );

  const isMutual = followAB.length > 0 && followBA.length > 0;
  console.log(`互关状态: ${isMutual ? '已互关' : '未互关'}\n`);

  // 创建会话
  const convId = uuidv4();
  await AppDataSource.query(
    'INSERT INTO conversations (id, type, title, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [convId, 'DIRECT', null]
  );

  // 添加参与者
  const partAId = uuidv4();
  const partBId = uuidv4();

  // 用户A: 发起者，状态 NORMAL
  await AppDataSource.query(
    'INSERT INTO conversation_participants (id, conversation_id, user_id, status, last_read_at, joined_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [partAId, convId, userA.id, 'NORMAL']
  );

  // 用户B: 接收者，状态根据是否互关决定
  const targetStatus = isMutual ? 'NORMAL' : 'REQUEST';
  await AppDataSource.query(
    'INSERT INTO conversation_participants (id, conversation_id, user_id, status, last_read_at, joined_at) VALUES (?, ?, ?, ?, NULL, NOW())',
    [partBId, convId, userB.id, targetStatus]
  );

  // 添加消息
  const msgId = uuidv4();
  await AppDataSource.query(
    'INSERT INTO messages (id, conversation_id, sender_id, content, created_at) VALUES (?, ?, ?, ?, NOW())',
    [msgId, convId, userA.id, '你好！看到你分享的VR旅行视频很棒，想交流一下拍摄经验。']
  );

  console.log('=== 创建的会话 ===');
  console.log(`会话ID: ${convId}`);
  console.log(`用户A状态: NORMAL`);
  console.log(`用户B状态: ${targetStatus}\n`);

  // 查询验证
  const result = await AppDataSource.query(`
    SELECT
      c.id AS conversation_id,
      cp.user_id,
      u.username,
      u.displayName,
      cp.status,
      CASE WHEN cp.user_id = ? THEN '发起者' ELSE '接收者' END AS role
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    JOIN users u ON cp.user_id = u.id
    WHERE c.id = ?
  `, [userA.id, convId]);

  console.log('=== 参与者详情 ===');
  console.table(result);

  const messages = await AppDataSource.query(`
    SELECT m.content, u.username AS sender, m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at
  `, [convId]);

  console.log('=== 消息内容 ===');
  console.table(messages);

  console.log('\n=== 演示说明 ===');
  if (!isMutual) {
    console.log(`1. 用户A (${userA.displayName}) 向未互关的用户B发送了消息`);
    console.log(`2. 用户A 在"私信"标签页可以看到这个会话`);
    console.log(`3. 用户B 在"陌生人消息"标签页看到这个请求`);
    console.log(`4. 用户B 可以点击"接受"或"拒绝"按钮`);
    console.log('\n测试API:');
    console.log(`  接受: POST /api/conversations/${convId}/accept`);
    console.log(`  拒绝: POST /api/conversations/${convId}/reject`);
  } else {
    console.log('两个用户已互关，消息直接进入收件箱');
  }

  await AppDataSource.destroy();
  console.log('\n演示数据创建完成！');
}

main().catch(console.error);
