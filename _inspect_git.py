# -*- coding: utf-8 -*-
import subprocess

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace').stdout

print('=== HEAD version of 功能框架图.html (first 300 chars) ===')
print(run(['git', 'show', 'HEAD:徐霞客社区功能框架图.html'])[:300])
print()
print('=== parent(8cea79e^) version of 逻辑框架图.html (first 200 chars) ===')
print(run(['git', 'show', '8cea79e^:徐霞客社区功能逻辑框架图.html'])[:200])
print()
print('=== html files in parent commit ===')
print(repr(run(['git', 'ls-tree', '--name-only', '8cea79e^', '--', '*.html'])))
print('=== html files in HEAD commit ===')
print(repr(run(['git', 'ls-tree', '--name-only', 'HEAD', '--', '*.html'])))
