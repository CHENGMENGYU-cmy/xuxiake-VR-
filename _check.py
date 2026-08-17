# -*- coding: utf-8 -*-
import subprocess

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace').stdout

print('=== git log --all for 框架图 html files ===')
print(run(['git', 'log', '--all', '--oneline', '--', '*框架图*']))

print('=== files in HEAD containing 框架图 ===')
out = run(['git', 'ls-files'])
for line in out.splitlines():
    if '框架图' in line:
        print('  TRACKED:', repr(line))

print('=== recent commits touching 功能框架图 ===')
print(run(['git', 'log', '--oneline', '-6', '--', '*功能框架图*']))

print('=== recent commits touching 逻辑框架图 ===')
print(run(['git', 'log', '--oneline', '-6', '--', '*逻辑框架图*']))

print('=== CHANGELOG.md current content ===')
print(run(['git', 'show', 'HEAD:CHANGELOG.md'])[:1500])
