"""
SSH 隧道脚本 - 通过 SSH 端口转发访问远程服务器网站
用法：python scripts/ssh_tunnel.py
然后浏览器访问 http://localhost:8888
"""
import paramiko
import socket
import threading
import select
import sys

SSH_HOST = '47.108.175.253'
SSH_PORT = 12200
SSH_USER = 'greatwall'
SSH_PASS = 'Gw-123123'

LOCAL_PORT = 8888
REMOTE_HOST = '127.0.0.1'
REMOTE_PORT = 8888

def forward_tunnel(local, remote, transport):
    try:
        chan = transport.open_channel('direct-tcpip',
                                       (REMOTE_HOST, REMOTE_PORT),
                                       local.getpeername())
    except Exception as e:
        print(f'  隧道连接失败: {e}')
        return

    while True:
        r, w, x = select.select([local, chan], [], [])
        if local in r:
            data = local.recv(1024)
            if len(data) == 0:
                break
            chan.send(data)
        if chan in r:
            data = chan.recv(1024)
            if len(data) == 0:
                break
            local.send(data)
    chan.close()
    local.close()

print(f'连接 SSH: {SSH_HOST}:{SSH_PORT}')
ssh = paramiko.Transport((SSH_HOST, SSH_PORT))
ssh.connect(username=SSH_USER, password=SSH_PASS)
print('SSH 连接成功')

print(f'启动本地端口转发: localhost:{LOCAL_PORT} -> 服务器:{REMOTE_PORT}')
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('127.0.0.1', LOCAL_PORT))
server.listen(5)
print(f'\n隧道已建立！')
print(f'浏览器访问: http://localhost:{LOCAL_PORT}')
print(f'按 Ctrl+C 停止隧道\n')

try:
    while True:
        client, addr = server.accept()
        print(f'  新连接: {addr[0]}:{addr[1]}')
        t = threading.Thread(target=forward_tunnel, args=(client, (REMOTE_HOST, REMOTE_PORT), ssh))
        t.daemon = True
        t.start()
except KeyboardInterrupt:
    print('\n停止隧道...')
finally:
    server.close()
    ssh.close()
    print('已断开')
