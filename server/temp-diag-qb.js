const fs = require('fs');
const path = require('path');
const { DataSource } = require('typeorm');
const dir = path.resolve('dist/entities');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.entity.js'));
const entities = files.map(f => {
  const mod = require(path.join(dir, f));
  return Object.values(mod)[0];
});
(async () => {
  const ds = new DataSource({ type: 'mysql', host: 'localhost', port: 3306, username: 'root', password: 'root', database: 'xuxiake', entities });
  await ds.initialize();
  const u = await ds.getRepository('User').findOne({ where: { username: 'sunqi' } });
  console.log('user id:', u?.id);
  const postRepo = ds.getRepository('Post');
  const qb = postRepo.createQueryBuilder('post')
    .leftJoinAndSelect('post.author', 'author')
    .leftJoinAndSelect('post.mediaItems', 'mediaItems')
    .leftJoinAndSelect('post.tags', 'tags')
    .leftJoinAndSelect('post.topics', 'topics')
    .where('post.authorId = :userId', { userId: u?.id })
    .andWhere('post.contentLevel NOT IN (:...excludeLevels)', { excludeLevels: ['SNAPSHOT', 'LOG'] })
    .andWhere('post.deletedAt IS NULL');
  console.log('SQL:', qb.getSql());
  const r = await qb.getMany();
  console.log('结果数:', r.length);
  await ds.destroy();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
