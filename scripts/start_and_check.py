import paramiko, os, time

HOST = os.environ.get('DEPLOY_HOST', '')
PORT = int(os.environ.get('DEPLOY_PORT', '12200'))
USER = os.environ.get('DEPLOY_USER', '')
PASS = os.environ.get('DEPLOY_PASS', '')
REMOTE_ROOT = '/home/greatwall/xuxiake'

if not HOST or not USER or not PASS:
    print('Set DEPLOY_HOST, DEPLOY_USER, DEPLOY_PASS env vars')
    exit(1)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

def run(cmd, label, timeout=300):
    print(f'--- {label} ---')
    transport = ssh.get_transport()
    channel = transport.open_session()
    channel.settimeout(timeout)
    channel.exec_command(cmd)
    while True:
        try:
            if channel.recv_ready():
                data = channel.recv(4096).decode('utf-8', errors='replace')
                print(data, end='', flush=True)
            if channel.recv_stderr_ready():
                data = channel.recv_stderr(4096).decode('utf-8', errors='replace')
                print(data, end='', flush=True)
            if channel.exit_status_ready():
                # Drain remaining
                while channel.recv_ready():
                    print(channel.recv(4096).decode('utf-8', errors='replace'), end='', flush=True)
                break
            time.sleep(0.5)
        except Exception:
            break
    exit_code = channel.recv_exit_status()
    print(f'\n  exit: {exit_code}')
    channel.close()
    return exit_code

run(f'cd {REMOTE_ROOT} && docker-compose up -d 2>&1', 'Start containers', 300)
time.sleep(5)
run(f'cd {REMOTE_ROOT} && docker-compose ps 2>&1', 'Container status', 30)
run(f'cd {REMOTE_ROOT} && docker-compose logs --tail=20 server 2>&1', 'Server logs (last 20)', 30)
run(f'cd {REMOTE_ROOT} && docker-compose logs --tail=20 web 2>&1', 'Web logs (last 20)', 30)
run(f'cd {REMOTE_ROOT} && docker-compose logs --tail=10 mysql 2>&1', 'MySQL logs (last 10)', 30)

ssh.close()
print(f'\nDone! Visit http://{HOST}')
