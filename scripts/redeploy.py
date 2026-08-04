import paramiko
import os
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('47.108.175.253', port=12200, username='greatwall', password='Gw-123123', timeout=30)

def run(cmd, label, timeout=60):
    print(f'\n=== {label} ===')
    transport = ssh.get_transport()
    channel = transport.open_session()
    channel.settimeout(timeout)
    channel.exec_command(cmd)
    while True:
        try:
            if channel.recv_ready():
                print(channel.recv(16384).decode('utf-8', errors='replace'), end='', flush=True)
            if channel.recv_stderr_ready():
                print(channel.recv_stderr(16384).decode('utf-8', errors='replace'), end='', flush=True)
            if channel.exit_status_ready():
                while channel.recv_ready():
                    print(channel.recv(16384).decode('utf-8', errors='replace'), end='', flush=True)
                break
            time.sleep(0.5)
        except Exception:
            break
    exit_code = channel.recv_exit_status()
    channel.close()
    return exit_code

# Upload updated docker-compose.yml
LOCAL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sftp = ssh.open_sftp()
local_file = os.path.join(LOCAL_ROOT, 'docker-compose.yml')
remote_file = '/home/greatwall/xuxiake/docker-compose.yml'
print(f'Uploading {local_file} -> {remote_file}')
sftp.put(local_file, remote_file)
sftp.close()
print('Upload complete')

# Restart nginx and web containers
run('cd /home/greatwall/xuxiake && docker-compose down nginx web', 'Stop nginx and web', 30)
run('cd /home/greatwall/xuxiake && docker-compose up -d nginx web', 'Start with new config', 30)

# Wait a moment
time.sleep(5)

# Check status
run('docker ps --filter "name=xuxiake"', 'Container status', 30)

# Test access
run('curl -s http://localhost:8080/ 2>&1 | head -3', 'Test localhost:8080', 15)
run('curl -s -o /dev/null -w "HTTP %{http_code}" http://47.108.175.253:8080/ 2>&1', 'Test external:8080', 15)

ssh.close()
print('\n=== Done ===')
print('访问: http://47.108.175.253:8080')
