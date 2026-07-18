import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001/chat';

let socket: Socket | null = null;

export function getChatSocket(userId: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { userId },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectChat(userId: string): Socket {
  const s = getChatSocket(userId);
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectChat() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
