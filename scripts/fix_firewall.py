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

# Check firewall status
run('sudo firewall-cmd --list-all 2>&1 || sudo iptables -L -n 2>&1 | head -30', 'Firewall status', 30)

# Check if port 80 is open
run('sudo firewall-cmd --query-port=80/tcp 2>&1', 'Check port 80', 30)

# Try to open port 80
run('sudo firewall-cmd --permanent --add-port=80/tcp 2>&1 && sudo firewall-cmd --reload 2>&1', 'Open port 80', 30)

# Also check selinux
run('getenforce 2>&1', 'SELinux status', 30)

# Check what's actually listening
run('sudo netstat -tlnp 2>&1 | grep -E ":(80|3000|3001)"', 'Listening ports', 30)

# Try accessing from localhost
run('curl -s http://localhost:80/ 2>&1 | head -5', 'Localhost test', 15)
run('curl -s http://localhost:3000/ 2>&1 | head -5', 'Localhost:3000 test', 15)

# Check web container logs with different approach
run('docker logs --since 10m xuxiake-web 2>&1', 'Web logs last 10 min', 30)

# Check if web container actually started next.js
run('docker top xuxiake-web 2>&1', 'Web container processes', 30)

ssh.close()
print('\n=== Done ===')
