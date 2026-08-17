# -*- coding: utf-8 -*-
import os, subprocess

print('=== all files in root (sorted) ===')
for f in sorted(os.listdir('.')):
    print('  ', repr(f))

print()
print('=== git ls-files root level ===')
out = subprocess.run(['git', 'ls-files'], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
for line in out.splitlines():
    if '/' not in line:
        print('  ', repr(line))

print()
print('=== git status ===')
out = subprocess.run(['git', 'status', '--short'], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
print('  status:', repr(out))
