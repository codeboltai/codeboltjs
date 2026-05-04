import { io, Socket } from 'socket.io-client';
import { useConnectionStore } from '@/stores';

type EventCallback = (data: unknown) => void;

interface SocketEvents {
  [event: string]: EventCallback[];
}

class WebSocketManager {
  private sockets: Map<string, Socket> = new Map();
  private events: SocketEvents = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseUrl: string;

  constructor() {
    this.baseUrl = this.getBaseUrl();
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const backendUrl = (window as any).env?.backendUrl || window.location.origin;
      try {
        const url = new URL(backendUrl);
        return `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}`;
      } catch {
        return 'ws://localhost:12345';
      }
    }
    return 'ws://localhost:12345';
  }

  connect(namespace: string, options: Record<string, unknown> = {}): Socket {
    if (this.sockets.has(namespace)) {
      return this.sockets.get(namespace)!;
    }

    const socket = io(`${this.baseUrl}/${namespace}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      ...options,
    });

    socket.on('connect', () => {
      console.log(`[WebSocket] Connected to ${namespace}`);
      this.reconnectAttempts = 0;
      useConnectionStore.getState().setConnected(true);
      useConnectionStore.getState().setLastConnected(new Date().toISOString());
      this.emit('connected', { namespace });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] Disconnected from ${namespace}:`, reason);
      useConnectionStore.getState().setConnected(false);
      this.emit('disconnected', { namespace, reason });
    });

    socket.on('connect_error', (error) => {
      console.error(`[WebSocket] Connection error for ${namespace}:`, error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        useConnectionStore.getState().setError('Connection failed');
      }
      this.emit('error', { namespace, error: error.message });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`[WebSocket] Reconnected to ${namespace} after ${attemptNumber} attempts`);
      useConnectionStore.getState().setReconnecting(false);
      this.emit('reconnected', { namespace, attemptNumber });
    });

    socket.on('reconnecting', (attemptNumber) => {
      console.log(`[WebSocket] Reconnecting to ${namespace}, attempt ${attemptNumber}`);
      useConnectionStore.getState().setReconnecting(true);
      this.emit('reconnecting', { namespace, attemptNumber });
    });

    this.sockets.set(namespace, socket);
    return socket;
  }

  disconnect(namespace: string): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
    }
  }

  disconnectAll(): void {
    this.sockets.forEach((socket) => {
      socket.disconnect();
    });
    this.sockets.clear();
  }

  getSocket(namespace: string): Socket | undefined {
    return this.sockets.get(namespace);
  }

  isConnected(namespace: string): boolean {
    const socket = this.sockets.get(namespace);
    return socket?.connected || false;
  }

  on(event: string, callback: EventCallback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  measureLatency(): Promise<number> {
    return new Promise((resolve) => {
      const start = Date.now();
      const socket = this.sockets.get('chat');
      if (socket && socket.connected) {
        socket.emit('ping', () => {
          const latency = Date.now() - start;
          useConnectionStore.getState().setLatency(latency);
          resolve(latency);
        });
      } else {
        resolve(0);
      }
    });
  }
}

export const wsManager = new WebSocketManager();
export default wsManager;
