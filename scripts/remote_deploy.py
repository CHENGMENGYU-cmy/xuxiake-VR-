import paramiko
import sys
import os

HOST = '47.108.175.253'
PORT = 12200
USER = 'greatwall'
PASS = 'Gw-123123'
REMOTE_ROOT = '/home/greatwall/xuxiake'

LOCAL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'node_modules', '.git', '.next', 'dist', '__pycache__', '.idea', '.vscode', '.claude'}
SKIP_FILES = {'.DS_Store', 'Thumbs.db', '.gitignore', 'hs_err_pid14832.log', 'hs_err_pid17836.log'}

skip_upload = '--skip-upload' in sys.argv

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)

# ==================== Step 1: Upload ====================
if not skip_upload:
    print('=== Step 1: 上传代码 ===')
    sftp = ssh.open_sftp()

    def ensure_remote_dir(path):
        if path == REMOTE_ROOT or path == '/':
            return
        try:
            sftp.stat(path)
        except FileNotFoundError:
            parent = os.path.dirname(path)
            ensure_remote_dir(parent)
            try:
                sftp.mkdir(path)
            except:
                pass

    uploaded = 0
    errors = 0
    for root, dirs, files in os.walk(LOCAL_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel_path = os.path.relpath(root, LOCAL_ROOT)
        remote_dir = REMOTE_ROOT if rel_path == '.' else REMOTE_ROOT + '/' + rel_path.replace(os.sep, '/')
        ensure_remote_dir(remote_dir)
        for f in files:
            if f in SKIP_FILES or f.endswith('.pyc'):
                continue
            local_file = os.path.join(root, f)
            remote_file = remote_dir + '/' + f
            try:
                size = os.path.getsize(local_file)
                if size > 50 * 1024 * 1024:
                    continue
            except:
                continue
            try:
                sftp.put(local_file, remote_file)
                uploaded += 1
                if uploaded % 100 == 0:
                    print(f'  已上传 {uploaded} 个文件...')
            except Exception as e:
                errors += 1
                if errors <= 5:
                    print(f'  错误: {e}')
    print(f'  完成: {uploaded} 个文件, {errors} 个错误')
    sftp.close()
else:
    print('=== Step 1: 跳过上传 ===')

# ==================== Step 2-4: Deploy ====================
def run_remote(cmd, label, timeout=600):
    print(f'\n=== {label} ===')
    print(f'  >>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    # Stream output line by line
    for line in iter(stdout.readline, ''):
        line = line.strip()
        if line:
            print(f'  {line}')
    err = stderr.read().decode('utf-8', errors='replace').strip()
    exit_code = stdout.channel.recv_exit_status()
    if err and exit_code != 0:
        # Print last few lines of error
        for line in err.splitlines()[-20:]:
            print(f'  ERR: {line}')
    print(f'  退出码: {exit_code}')
    return exit_code

DC = 'docker-compose'

run_remote(f'cd {REMOTE_ROOT} && {DC} down', 'Step 2: 停止旧容器', timeout=60)
exit_code = run_remote(f'cd {REMOTE_ROOT} && {DC} build --no-cache 2>&1', 'Step 3: 重建镜像', timeout=600)

if exit_code == 0:
    run_remote(f'cd {REMOTE_ROOT} && {DC} up -d', 'Step 4: 启动容器', timeout=120)
    run_remote(f'cd {REMOTE_ROOT} && {DC} ps', '容器状态', timeout=30)
else:
    print('\n构建失败，跳过启动步骤')

ssh.close()
print(f'\n部署完成! 访问 http://{HOST} 查看效果')
