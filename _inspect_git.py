# -*- coding: utf-8 -*-
import os, subprocess

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace').stdout

print('=== root dir files (with 框架 in name) ===')
for f in sorted(os.listdir('.')):
    if '框架' in f or 'CHANGELOG' in f:
        print(' ', repr(f))

print('=== 8cea79e commit timestamp ===')
print(run(['git', 'show', '-s', '--format=%ci %s', 'HEAD']))

print('=== parent commit timestamp ===')
print(run(['git', 'show', '-s', '--format=%ci %s', '8cea79e^']))

print('=== log -5 with timestamps ===')
print(run(['git', 'log', '--format=%h %ci %s', '-5']))
