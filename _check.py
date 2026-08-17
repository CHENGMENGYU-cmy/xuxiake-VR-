# -*- coding: utf-8 -*-
import os, subprocess

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace').stdout

# Search disk (walk top-level dirs except node_modules/.git)
hits_disk = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '.next', 'dist', 'out')]
    for f in files:
        if '框架图' in f:
            hits_disk.append(os.path.join(root, f))

print('=== 磁盘上含"框架图"的文件 ===')
for h in sorted(hits_disk):
    print('  ', repr(h))

print()
print('=== git 跟踪的所有文件（全仓） ===')
out = run(['git', 'ls-files'])
allfiles = out.splitlines()
print('  总数:', len(allfiles))
for line in allfiles:
    if '框架图' in line:
        print('  TRACKED 框架图:', repr(line))

print()
print('=== git status --short ===')
print('  ', repr(run(['git', 'status', '--short'])))

print()
print('=== HEAD CHANGELOG.md 是否存在 ===')
print('  exists in HEAD:', bool(run(['git', 'cat-file', '-e', 'HEAD:CHANGELOG.md']).strip()) or subprocess.run(['git', 'cat-file', '-e', 'HEAD:CHANGELOG.md'], capture_output=True).returncode == 0)
print('  disk exists:', os.path.exists('CHANGELOG.md'))
