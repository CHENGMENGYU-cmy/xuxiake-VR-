import paramiko
import os

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('47.108.175.253', port=12200, username='greatwall', password='Gw-123123', timeout=30)

sftp = ssh.open_sftp()

LOCAL_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTE_ROOT = '/home/greatwall/xuxiake'

SKIP_DIRS = {'node_modules', '.git', '.next', 'dist', '__pycache__', '.idea', '.vscode', '.claude'}
SKIP_FILES = {'.DS_Store', 'Thumbs.db', '.gitignore', 'hs_err_pid14832.log', 'hs_err_pid17836.log'}

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
    if rel_path == '.':
        remote_dir = REMOTE_ROOT
    else:
        remote_dir = REMOTE_ROOT + '/' + rel_path.replace(os.sep, '/')

    ensure_remote_dir(remote_dir)

    for f in files:
        if f in SKIP_FILES or f.endswith('.pyc') or f.startswith('upload_to_server'):
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
            if uploaded % 50 == 0:
                print(f'Uploaded {uploaded} files...')
        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f'Error: {remote_file}: {e}')

print(f'Upload complete: {uploaded} files uploaded, {errors} errors')
sftp.close()
ssh.close()
