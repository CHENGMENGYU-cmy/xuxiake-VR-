import paramiko
import os

HOST = os.environ.get('DEPLOY_HOST', '')
PORT = int(os.environ.get('DEPLOY_PORT', '12200'))
USER = os.environ.get('DEPLOY_USER', '')
PASS = os.environ.get('DEPLOY_PASS', '')
REMOTE_ROOT = '/home/greatwall/xuxiake'
LOCAL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if not HOST or not USER or not PASS:
    print('请设置环境变量: DEPLOY_HOST, DEPLOY_USER, DEPLOY_PASS')
    print('示例: $env:DEPLOY_HOST="47.108.175.253"; $env:DEPLOY_USER="greatwall"; $env:DEPLOY_PASS="xxx"')
    exit(1)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# Step 1: Upload updated Dockerfiles and docker-compose.yml
print('=== Step 1: 上传更新的文件 ===')
sftp = ssh.open_sftp()
files_to_upload = [
    ('server/Dockerfile', 'server/Dockerfile'),
    ('web/Dockerfile', 'web/Dockerfile'),
    ('docker-compose.yml', 'docker-compose.yml'),
    ('nginx.conf', 'nginx.conf'),
]
for local_rel, remote_rel in files_to_upload:
    local_path = os.path.join(LOCAL_ROOT, local_rel.replace('/', os.sep))
    remote_path = REMOTE_ROOT + '/' + remote_rel
    try:
        sftp.put(local_path, remote_path)
        print(f'  [OK] {local_rel}')
    except Exception as e:
        print(f'  [ERR] {local_rel}: {e}')
sftp.close()

# Step 2: Stop old containers
print('\n=== Step 2: 停止旧容器 ===')
stdin, stdout, stderr = ssh.exec_command(f'cd {REMOTE_ROOT} && docker-compose down 2>&1', timeout=60)
print(stdout.read().decode() or 'OK')

# Step 3: Rebuild images
print('\n=== Step 3: 重建镜像 (预计5-10分钟) ===')
cmd = f'cd {REMOTE_ROOT} && DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build --no-cache 2>&1'
print(f'  >>> {cmd}')
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=600)
for line in iter(stdout.readline, ''):
    stripped = line.strip()
    if stripped and not stripped.startswith('\x1b'):
        # Filter out ANSI escape codes and progress bars
        if any(kw in stripped for kw in ['Step', 'Running', 'Removing', 'Successfully', 'ERROR', 'Error', 'error', 'npm warn', 'npm notice', 'npm ERR', 'added', 'vulnerabilities', 'audited', 'build', 'pruned', 'removed', 'up to date', 'packages', 'funding']):
            print(f'  {stripped}')
    elif 'Successfully built' in stripped or 'Successfully tagged' in stripped:
        print(f'  {stripped}')

exit_code = stdout.channel.recv_exit_status()
err = stderr.read().decode('utf-8', errors='replace').strip()
if err and exit_code != 0:
    for line in err.splitlines()[-10:]:
        print(f'  ERR: {line}')
print(f'  构建退出码: {exit_code}')

# Step 4: Start containers
if exit_code == 0:
    print('\n=== Step 4: 启动容器 ===')
    stdin, stdout, stderr = ssh.exec_command(f'cd {REMOTE_ROOT} && docker-compose up -d 2>&1', timeout=120)
    print(stdout.read().decode())

    # Step 5: Check status
    print('=== 容器状态 ===')
    stdin, stdout, stderr = ssh.exec_command(f'cd {REMOTE_ROOT} && docker-compose ps 2>&1', timeout=30)
    print(stdout.read().decode())

    print(f'\n✅ 部署完成! 访问 http://{HOST} 查看效果')
else:
    print('\n❌ 构建失败，跳过启动')
    # Show full error for debugging
    print('\n--- 完整错误日志 ---')
    stdin, stdout, stderr = ssh.exec_command(f'cd {REMOTE_ROOT} && DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build --no-cache 2>&1 | tail -50', timeout=600)
    print(stdout.read().decode()[-3000:])

ssh.close()
