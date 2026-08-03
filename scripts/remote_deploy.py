import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('47.108.175.253', port=12200, username='greatwall', password='Gw-123123', timeout=30)

commands = [
    'docker-compose --version 2>&1 || docker compose version 2>&1',
    'cd /home/greatwall/xuxiake && docker-compose down 2>&1',
    'cd /home/greatwall/xuxiake && docker-compose build --no-cache 2>&1',
    'cd /home/greatwall/xuxiake && docker-compose up -d 2>&1',
]

for cmd in commands:
    print(f'>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=600)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out:
        # Print last 3000 chars to avoid overwhelming output
        print(out[-3000:] if len(out) > 3000 else out)
    if err:
        print(f'STDERR: {err[-1000:] if len(err) > 1000 else err}')
    print('---')

ssh.close()
print('Deploy complete!')
