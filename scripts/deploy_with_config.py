"""
一键部署脚本：上传最新配置 + 重启容器
用法：python scripts/deploy_with_config.py
"""
import paramiko
import os
import time
import sys

SSH_HOST = '47.108.175.253'
SSH_PORT = 12200
SSH_USER = 'greatwall'
SSH_PASS = os.environ.get('SSH_PASS', '')

if not SSH_PASS:
    SSH_PASS = input('请输入 SSH 密码: ').strip()

REMOTE_ROOT = '/home/greatwall/xuxiake'
LOCAL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

print('连接 SSH...')
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, port=SSH_PORT, username=SSH_USER, password=SSH_PASS, timeout=30)
print('SSH 连接成功！')

def run(cmd, label, timeout=300):
    print(f'\n--- {label} ---')
    transport = ssh.get_transport()
    channel = transport.open_session()
    channel.settimeout(timeout)
    channel.exec_command(cmd)
    while True:
        try:
            if channel.recv_ready():
                data = channel.recv(8192).decode('utf-8', errors='replace')
                for line in data.splitlines():
                    if line.strip():
                        print(f'  {line.strip()}')
            if channel.recv_stderr_ready():
                data = channel.recv_stderr(8192).decode('utf-8', errors='replace')
                for line in data.splitlines():
                    if line.strip():
                        print(f'  ERR: {line.strip()}')
            if channel.exit_status_ready():
                while channel.recv_ready():
                    data = channel.recv(8192).decode('utf-8', errors='replace')
                    for line in data.splitlines():
                        if line.strip():
                            print(f'  {line.strip()}')
                break
            time.sleep(0.3)
        except:
            break
    exit_code = channel.recv_exit_status()
    if exit_code != 0:
        print(f'  [退出码: {exit_code}]')
    channel.close()
    return exit_code

# Step 1: Upload changed files
print('\n=== Step 1: 上传最新配置文件 ===')
sftp = ssh.open_sftp()
files_to_upload = [
    'docker-compose.yml',
    'nginx.conf',
]
for f in files_to_upload:
    local = os.path.join(LOCAL_ROOT, f)
    remote = f'{REMOTE_ROOT}/{f}'
    try:
        sftp.put(local, remote)
        print(f'  [OK] {f}')
    except Exception as e:
        print(f'  [ERR] {f}: {e}')
sftp.close()

# Step 2: Stop old containers
run(f'cd {REMOTE_ROOT} && docker-compose down', 'Step 2: 停止旧容器', 60)

# Step 3: Start with new config
env_prefix = 'DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0'
run(f'cd {REMOTE_ROOT} && {env_prefix} docker-compose up -d --build', 'Step 3: 构建并启动容器', 600)

# Step 4: Check status
time.sleep(5)
run('docker ps --filter "name=xuxiake" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"', 'Step 4: 容器状态', 30)

# Step 5: Test
print('\n=== Step 5: 测试访问 ===')
run('curl -s -o /dev/null -w "localhost:80 HTTP %{http_code}\n" http://localhost:80/', '本地80端口测试', 15)

ssh.close()

print('\n' + '=' * 60)
print('部署完成！')
print()
print('当前访问方式：')
print('  浏览器打开: http://localhost:8888 (通过 SSH 隧道)')
print()
print('等对方开放 80 端口后：')
print('  浏览器打开: http://47.108.175.253 (不需要端口号)')
print('=' * 60)
