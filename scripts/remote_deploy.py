"""
一键部署脚本：上传代码 + 重建 Docker 容器
用法：python scripts/remote_deploy.py [--skip-upload]
"""
import paramiko
import os
import sys

HOST = '47.108.175.253'
PORT = 12200
USER = 'greatwall'
PASS = 'Gw-123123'
REMOTE_ROOT = '/home/greatwall/xuxiake'

LOCAL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'node_modules', '.git', '.next', 'dist', '__pycache__', '.idea', '.vscode', '.claude'}
SKIP_FILES = {'.DS_Store', 'Thumbs.db', '.gitignore', 'hs_err_pid14832.log', 'hs_err_pid17836.log'}

skip_upload = '--skip-upload' in sys.argv

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# ==================== Step 1: 上传文件 ====================
if not skip_upload:
    print('=' * 60)
    print('Step 1/4: 上传代码到服务器')
    print('=' * 60)
    sftp = ssh.open_sftp()

    def ensure_remote_dir(path):
        if path == REMOTE_ROOT or path == '/':
            return
        try:
            sftp.stat(path)
        except FileNotFoundError:
            parent = os.path.dirname(path)
            ensure_remote_dir(parent)
            try:
                sftp.mkdir(path)
            except:
                pass

    uploaded = 0
    errors = 0
    for root, dirs, files in os.walk(LOCAL_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel_path = os.path.relpath(root, LOCAL_ROOT)
        remote_dir = REMOTE_ROOT if rel_path == '.' else REMOTE_ROOT + '/' + rel_path.replace(os.sep, '/')
        ensure_remote_dir(remote_dir)
        for f in files:
            if f in SKIP_FILES or f.endswith('.pyc') or f.startswith('upload_to_server'):
                continue
            local_file = os.path.join(root, f)
            remote_file = remote_dir + '/' + f
            try:
                size = os.path.getsize(local_file)
                if size > 50 * 1024 * 1024:
                    continue
            except:
                continue
            try:
                sftp.put(local_file, remote_file)
                uploaded += 1
                if uploaded % 100 == 0:
                    print(f'  已上传 {uploaded} 个文件...')
            except Exception as e:
                errors += 1
                if errors <= 5:
                    print(f'  错误: {remote_file}: {e}')

    print(f'  上传完成: {uploaded} 个文件, {errors} 个错误')
    sftp.close()
else:
    print('Step 1/4: 跳过上传 (--skip-upload)')

# ==================== Step 2: 检测 docker-compose ====================
print()
print('=' * 60)
print('Step 2/4: 检测 docker-compose 命令')
print('=' * 60)

stdin, stdout, stderr = ssh.exec_command('docker-compose --version 2>&1', timeout=30)
dc_out = stdout.read().decode().strip()
dc_exit = stdout.channel.recv_exit_status()

if dc_exit == 0:
    DC_CMD = 'docker-compose'
    print(f'  使用: docker-compose ({dc_out})')
else:
    stdin, stdout, stderr = ssh.exec_command('docker compose version 2>&1', timeout=30)
    dc2_out = stdout.read().decode().strip()
    dc2_exit = stdout.channel.recv_exit_status()
    if dc2_exit == 0:
        DC_CMD = 'docker compose'
        print(f'  使用: docker compose ({dc2_out})')
    else:
        print('  错误: 服务器未安装 docker-compose，请先安装!')
        ssh.close()
        sys.exit(1)

# ==================== Step 3: 停止旧容器 ====================
print()
print('=' * 60)
print('Step 3/4: 停止旧容器')
print('=' * 60)

cmd = f'cd {REMOTE_ROOT} && {DC_CMD} down 2>&1'
print(f'  >>> {cmd}')
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=120)
print(f'  {stdout.read().decode().strip()}')

# ==================== Step 4: 重建并启动 ====================
print()
print('=' * 60)
print('Step 4/4: 重建镜像并启动 (这可能需要几分钟...)')
print('=' * 60)

cmd = f'cd {REMOTE_ROOT} && {DC_CMD} up -d --build 2>&1'
print(f'  >>> {cmd}')
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=600)
out = stdout.read().decode()
err = stderr.read().decode()
for line in out.splitlines():
    print(f'  {line}')
for line in err.splitlines():
    if line.strip():
        print(f'  {line}')

# ==================== 检查状态 ====================
print()
print('=' * 60)
print('检查容器状态')
print('=' * 60)

cmd = f'cd {REMOTE_ROOT} && {DC_CMD} ps 2>&1'
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
print(stdout.read().decode())

ssh.close()
print(f'\n部署完成! 访问 http://{HOST} 查看效果')
