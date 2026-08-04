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

# Test which ports are accessible from outside
print('Testing external port access...')
for port in [80, 443, 3000, 3001, 8080, 8443, 8888, 9090]:
    result = run(f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 5 http://47.108.175.253:{port}/ 2>&1')
    print(f'  Port {port}: {result}')

# Also test localhost
print('\nTesting localhost access...')
for port in [80, 3000, 3001, 8888]:
    result = run(f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 5 http://localhost:{port}/ 2>&1')
    print(f'  localhost:{port}: {result}')

# Check what ports are mapped
result = run('docker port xuxiake-web 2>&1')
print(f'\nDocker port mapping (web): {result}')
result = run('docker port xuxiake-nginx 2>&1')
print(f'Docker port mapping (nginx): {result}')

ssh.close()
