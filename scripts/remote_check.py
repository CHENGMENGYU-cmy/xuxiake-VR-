import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('47.108.175.253', port=12200, username='greatwall', password='Gw-123123', timeout=30)

commands = [
    ('Docker版本', 'docker --version 2>&1'),
    ('docker-compose检测', 'which docker-compose 2>&1; docker-compose --version 2>&1; which docker-compose3 2>&1'),
    ('docker compose检测', 'docker compose version 2>&1'),
    ('当前容器状态', 'docker ps -a 2>&1'),
    ('项目目录', 'ls -la /home/greatwall/xuxiake/docker-compose.yml 2>&1'),
    ('磁盘空间', 'df -h / 2>&1'),
]

for label, cmd in commands:
    print(f'--- {label} ---')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    print(out if out else err)
    print()

ssh.close()
