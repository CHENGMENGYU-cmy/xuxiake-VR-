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
                print(channel.recv(8192).decode('utf-8', errors='replace'), end='', flush=True)
            if channel.recv_stderr_ready():
                print(channel.recv_stderr(8192).decode('utf-8', errors='replace'), end='', flush=True)
            if channel.exit_status_ready():
                while channel.recv_ready():
                    print(channel.recv(8192).decode('utf-8', errors='replace'), end='', flush=True)
                break
            time.sleep(0.3)
        except Exception:
            break
    exit_code = channel.recv_exit_status()
    channel.close()
    return exit_code

R = '/home/greatwall/xuxiake'

run(f'cd {R} && docker ps -a --filter "name=xuxiake"', 'All xuxiake containers', 30)
run(f'docker logs --tail=50 xuxiake-server 2>&1', 'Server logs (tail 50)', 30)
run(f'docker logs --tail=30 xuxiake-web 2>&1', 'Web logs (tail 30)', 30)
run(f'docker logs --tail=20 xuxiake-nginx 2>&1', 'Nginx logs (tail 20)', 30)
run(f'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000/ 2>&1', 'Test web:3000', 15)
run(f'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3001/api/health 2>&1', 'Test server:3001', 15)

ssh.close()
print('\nDone')
