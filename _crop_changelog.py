# -*- coding: utf-8 -*-
import io

p = 'CHANGELOG.md'
with io.open(p, encoding='utf-8') as f:
    content = f.read()

sep = '\n' + '-' * 80 + '\n'
parts = content.split(sep)
print('total blocks:', len(parts))

# parts[0] = 标题 + 记录1，parts[i] = 记录 i+1
# 保留标题 + 最近30条记录
keep = sep.join(parts[:30])

with io.open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(keep)

after = keep.count('修改时间：')
print('kept records:', after)
print('last line:', repr(keep[-80:]))
