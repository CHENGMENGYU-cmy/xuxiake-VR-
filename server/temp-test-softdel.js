const { DataSource } = require('typeorm');
const { Post } = require('./dist/entities/post.entity.js');
(async () => {
  const ds = new DataSource({ type: 'mysql', host: 'localhost', port: 3306, username: 'root', password: 'root', database: 'xuxiake', entities: [Post] });
  await ds.initialize();
  const repo = ds.getRepository(Post);
  const id = '6bc303b7-1414-4a96-884b-3ad33e4700fd';
  const r = await repo.softDelete({ id });
  console.log('softDelete affected:', r.affected);
  const row = await repo.findOne({ where: { id }, withDeleted: true });
  console.log('软删后 deletedAt:', row?.deletedAt);
  // 检查 DeleteDateColumn 元数据
  const meta = ds.getMetadata(Post);
  console.log('删除列:', meta.deleteDateColumn?.propertyName, '| databaseName:', meta.deleteDateColumn?.databaseName);
  await ds.destroy();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
