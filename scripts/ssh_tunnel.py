"""
SSH 隧道脚本 - 通过 SSH 端口转发访问远程服务器网站
用法：python scripts/ssh_tunnel.py
然后浏览器访问 http://localhost:8888
按 Ctrl+C 停止
"""
import paramiko
import socket
import threading
import select
import sys
import time

SSH_HOST = '47.108.175.253'
SSH_PORT = 12200
SSH_USER = 'greatwall'
SSH_PASS = 'Gw-123123'

LOCAL_PORT = 8888
REMOTE_HOST = '127.0.0.1'
REMOTE_PORT = 8888

def forward_tunnel(local_sock, transport):
    """转发本地连接到远程"""
    chan = None
    try:
        # 打开 SSH 通道
        chan = transport.open_channel(
            'direct-tcpip',
            (REMOTE_HOST, REMOTE_PORT),
            local_sock.getpeername()
        )
        print(f'  通道已建立: {local_sock.getpeername()} -> {REMOTE_HOST}:{REMOTE_PORT}')
    except Exception as e:
        print(f'  通道创建失败: {e}')
        local_sock.close()
        return

    try:
        while True:
            r, w, x = select.select([local_sock, chan], [], [], 1)

            if local_sock in r:
                data = local_sock.recv(1024)
                if len(data) == 0:
                    break
                chan.sendall(data)

            if chan in r:
                data = chan.recv(1024)
                if len(data) == 0:
                    break
                local_sock.sendall(data)
    except Exception as e:
        print(f'  转发错误: {e}')
    finally:
        if chan:
            chan.close()
        local_sock.close()
        print(f'  连接关闭')

def main():
    print('=' * 60)
    print('SSH 隧道 - 徐霞客远程服务器访问')
    print('=' * 60)
    print(f'SSH 服务器: {SSH_HOST}:{SSH_PORT}')
    print(f'转发规则: localhost:{LOCAL_PORT} -> 服务器:{REMOTE_PORT}')
    print()

    # 连接 SSH
    print('正在连接 SSH...')
    try:
        transport = paramiko.Transport((SSH_HOST, SSH_PORT))
        transport.connect(username=SSH_USER, password=SSH_PASS)
        print('SSH 连接成功！')
    except Exception as e:
        print(f'SSH 连接失败: {e}')
        sys.exit(1)

    # 启动本地监听
    print(f'启动本地端口监听: {LOCAL_PORT}')
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind(('127.0.0.1', LOCAL_PORT))
        server.listen(5)
        print(f'监听成功！')
    except Exception as e:
        print(f'监听失败: {e}')
        transport.close()
        sys.exit(1)

    print()
    print('✓ 隧道已建立！')
    print(f'请在浏览器访问: http://localhost:{LOCAL_PORT}')
    print('按 Ctrl+C 停止隧道')
    print('=' * 60)
    print()

    try:
        while True:
            try:
                client, addr = server.accept()
                print(f'[连接] 来自 {addr[0]}:{addr[1]}')
                thread = threading.Thread(
                    target=forward_tunnel,
                    args=(client, transport)
                )
                thread.daemon = True
                thread.start()
            except socket.error as e:
                print(f'接受连接错误: {e}')
                time.sleep(0.1)
    except KeyboardInterrupt:
        print('\n\n正在停止隧道...')
    finally:
        server.close()
        transport.close()
        print('隧道已关闭')

if __name__ == '__main__':
    main()
