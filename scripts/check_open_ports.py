import paramiko
import time

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('47.108.175.253', port=12200, username='greatwall', password='Gw-123123', timeout=30)

def run(cmd, timeout=15):
    transport = ssh.get_transport()
    channel = transport.open_session()
    channel.settimeout(timeout)
    channel.exec_command(cmd)
    output = []
    while True:
        try:
            if channel.recv_ready():
                output.append(channel.recv(8192).decode('utf-8', errors='replace'))
            if channel.exit_status_ready():
                while channel.recv_ready():
                    output.append(channel.recv(8192).decode('utf-8', errors='replace'))
                break
            time.sleep(0.3)
        except:
            break
    channel.close()
    return ''.join(output).strip()

# Check what services are running with their ports
print('=== Running services ===')
result = run('ss -tlnp 2>&1', 15)
print(result)

print('\n=== Docker port mappings ===')
result = run('docker ps --format "table {{.Names}}\t{{.Ports}}" 2>&1', 15)
print(result)

# Test common ports from outside via loopback
print('\n=== Port accessibility from host ===')
for port in [22, 80, 443, 3000, 3306, 8080, 8888, 9090, 11434]:
    result = run(f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 3 http://127.0.0.1:{port}/ 2>&1 || echo "timeout"', 10)
    status = "OK (200)" if "200" in result else "Other/Timeout" if result else "Fail"
    print(f'  Port {port}: {result}')

ssh.close()
