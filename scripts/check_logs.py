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
    output = []
    while True:
        try:
            if channel.recv_ready():
                data = channel.recv(16384).decode('utf-8', errors='replace')
                output.append(data)
                print(data, end='', flush=True)
            if channel.recv_stderr_ready():
                data = channel.recv_stderr(16384).decode('utf-8', errors='replace')
                output.append(data)
                print(data, end='', flush=True)
            if channel.exit_status_ready():
                while channel.recv_ready():
                    data = channel.recv(16384).decode('utf-8', errors='replace')
                    output.append(data)
                    print(data, end='', flush=True)
                break
            time.sleep(0.5)
        except Exception:
            break
    exit_code = channel.recv_exit_status()
    channel.close()
    return exit_code, ''.join(output)

# Check more logs
run('docker logs xuxiake-server 2>&1 | tail -100', 'Server full logs', 30)
run('docker logs xuxiake-web 2>&1 | tail -100', 'Web full logs', 30)

# Check if processes are running inside containers
run('docker exec xuxiake-server ps aux', 'Server processes', 30)
run('docker exec xuxiake-web ps aux', 'Web processes', 30)

# Check ports inside containers
run('docker exec xuxiake-server netstat -tlnp 2>&1 || ss -tlnp', 'Server ports', 30)
run('docker exec xuxiake-web netstat -tlnp 2>&1 || ss -tlnp', 'Web ports', 30)

# Check nginx error logs
run('docker logs xuxiake-nginx 2>&1 | grep -i error', 'Nginx errors', 30)

# Test connectivity from nginx container
run('docker exec xuxiake-nginx wget -q -O - http://web:3000/ 2>&1 | head -20', 'Nginx -> web:3000 test', 15)
run('docker exec xuxiake-nginx wget -q -O - http://server:3001/api/health 2>&1', 'Nginx -> server:3001 test', 15)

ssh.close()
print('\n=== Done ===')
