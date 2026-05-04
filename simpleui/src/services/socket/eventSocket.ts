import { Socket } from 'socket.io-client';
import wsManager from './WebSocketManager';
import { useChannelsStore, useNotificationsStore } from '@/stores';

type EventCallback = (data: unknown) => void;

class EventSocket {
  private socket: Socket | null = null;
  private eventListeners: Map<string, EventCallback[]> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = wsManager.connect('eventlog');

    this.socket.on('connect', () => {
      console.log('[EventSocket] Connected');
    });

    this.socket.on('event', (data: any) => {
      this.handleEvent(data);
    });

    this.socket.on('channel_status', (data: any) => {
      this.handleChannelStatus(data);
    });

    this.socket.on('notification', (data: any) => {
      this.handleNotification(data);
    });

    this.socket.on('approval_request', (data: any) => {
      this.handleApprovalRequest(data);
    });

    this.socket.on('system_alert', (data: any) => {
      this.handleSystemAlert(data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleEvent(data: any): void {
    this.emit('event', data);
  }

  private handleChannelStatus(data: any): void {
    if (data.channelId) {
      useChannelsStore.getState().updateChannel(data.channelId, {
        status: data.status,
        lastMessage: data.lastMessage,
        messageCount: data.messageCount,
      });
    }
    this.emit('channel_status', data);
  }

  private handleNotification(data: any): void {
    useNotificationsStore.getState().addNotification({
      id: data.id || Date.now().toString(),
      type: data.type || 'system',
      title: data.title,
      description: data.description || data.message,
      timestamp: data.timestamp || new Date().toISOString(),
      read: false,
      link: data.link,
    });
    this.emit('notification', data);
  }

  private handleApprovalRequest(data: any): void {
    this.emit('approval_request', data);
  }

  private handleSystemAlert(data: any): void {
    this.emit('system_alert', data);
  }

  subscribeToEvents(types?: string[]): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe', { types });
    }
  }

  unsubscribeFromEvents(types?: string[]): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', { types });
    }
  }

  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      this.eventListeners.set(event, listeners.filter(cb => cb !== callback));
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }
}

export const eventSocket = new EventSocket();
export default eventSocket;
