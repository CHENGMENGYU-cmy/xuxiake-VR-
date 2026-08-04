import paramiko
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

# Check container status
run('docker ps --filter "name=xuxiake"', 'Running containers', 30)

# Check if web is actually listening
run('docker exec xuxiake-web ss -tlnp', 'Web container ports', 30)

# Get web logs (all of them)
run('docker logs xuxiake-web 2>&1', 'Web container all logs', 30)

# Check web health
run('docker exec xuxiake-web curl -s http://localhost:3000/', 'Web self-test', 15)

# Check nginx config
run('docker exec xuxiake-nginx cat /etc/nginx/conf.d/default.conf', 'Nginx config', 30)

# Test from outside
run('curl -I http://47.108.175.253/', 'External access test', 15)

ssh.close()
print('\n=== Done ===')
