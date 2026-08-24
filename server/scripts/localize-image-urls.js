/**
 * 将 SQL 种子文件中的外部图片 URL 替换为本地动态占位图端点。
 * 可重复执行，便于后续维护：新增种子数据后再次运行即可。
 *
 * 替换规则：
 *  - https://api.dicebear.com/9.x/avataaars/svg?seed=X      → /api/placeholder/X
 *  - https://api.dicebear.com/9.x/identicon/svg?seed=X      → /api/placeholder/community-X
 *  - https://picsum.photos/seed/X/{w}/{h}                   → /api/placeholder/X?type=landscape
 *  - https://images.unsplash.com/photo-XXX?w=400            → /api/placeholder/{从上下文中无法推导，保留原样}
 */
const fs = require('fs');
const path = require('path');

const SEED_FILES = [
  path.join(__dirname, '..', 'sql', 'seed.sql'),
  path.join(__dirname, '..', 'sql', 'seed-log-diary-travelogue.sql'),
];

let totalChanged = 0;

for (const file of SEED_FILES) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // 1. 用户头像：dicebear avataaars → /api/placeholder/{seed}
  const before1 = content;
  content = content.replace(
    /https:\/\/api\.dicebear\.com\/9\.x\/avataaars\/svg\?seed=([A-Za-z0-9_-]+)/g,
    '/api/placeholder/$1',
  );
  totalChanged += (before1.match(/https:\/\/api\.dicebear\.com\/9\.x\/avataaars/g) || []).length;

  // 2. 社群头像：dicebear identicon → /api/placeholder/community-{seed}
  const before2 = content;
  content = content.replace(
    /https:\/\/api\.dicebear\.com\/9\.x\/identicon\/svg\?seed=([A-Za-z0-9_-]+)/g,
    '/api/placeholder/community-$1',
  );
  totalChanged += (before2.match(/https:\/\/api\.dicebear\.com\/9\.x\/identicon/g) || []).length;

  // 3. picsum 图片：/seed/{seed}/{w}/{h} → /api/placeholder/{seed}?type=landscape
  const before3 = content;
  content = content.replace(
    /https:\/\/picsum\.photos\/seed\/([A-Za-z0-9_-]+)\/\d+\/\d+/g,
    '/api/placeholder/$1?type=landscape',
  );
  totalChanged += (before3.match(/https:\/\/picsum\.photos\/seed/g) || []).length;

  if (content !== before3 || content !== before2 || content !== before1) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ 已更新: ${path.basename(file)}`);
  }
}

console.log(`完成，共替换 ${totalChanged} 处外部图片 URL`);
