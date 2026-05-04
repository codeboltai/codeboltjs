import { Socket } from 'socket.io-client';
import wsManager from './WebSocketManager';
import { useChatStore } from '@/stores';
import type { ChatMessage } from '@/types';

type ChatEventCallback = (data: unknown) => void;

class ChatSocket {
  private socket: Socket | null = null;
  private eventListeners: Map<string, ChatEventCallback[]> = new Map();
  private messageQueue: unknown[] = [];

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = wsManager.connect('chat');

    this.socket.on('message', (data: unknown) => {
      this.handleIncomingMessage(data);
    });

    this.socket.on('stream', (data: unknown) => {
      this.handleStream(data);
    });

    this.socket.on('tool_use', (data: unknown) => {
      this.handleToolUse(data);
    });

    this.socket.on('agent_status', (data: unknown) => {
      this.handleAgentStatus(data);
    });

    this.socket.on('token_usage', (data: unknown) => {
      this.handleTokenUsage(data);
    });

    this.socket.on('thread_update', (data: unknown) => {
      this.handleThreadUpdate(data);
    });

    wsManager.on('connected', () => {
      this.flushMessageQueue();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleIncomingMessage(data: any): void {
    const message: ChatMessage = {
      id: data.messageId || Date.now().toString(),
      threadId: data.threadId,
      senderType: data.sender?.senderType || 'system',
      senderName: data.sender?.senderInfo?.name,
      content: data.data?.text || data.message?.userMessage || '',
      timestamp: data.timestamp || new Date().toISOString(),
      templateType: data.templateType,
      toolCalls: data.toolCalls,
    };

    useChatStore.getState().addMessage(message);
    useChatStore.getState().setAgentStatus('idle');
    this.emit('message', message);
  }

  private handleStream(data: any): void {
    useChatStore.getState().setStreaming(true);
    this.emit('stream', data);
  }

  private handleToolUse(data: any): void {
    useChatStore.getState().setCurrentTool(data.toolName || data.name);
    useChatStore.getState().setAgentStatus('using_tool');
    this.emit('tool_use', data);
  }

  private handleAgentStatus(data: any): void {
    const statusMap: Record<string, 'idle' | 'thinking' | 'using_tool' | 'error'> = {
      'idle': 'idle',
      'thinking': 'thinking',
      'working': 'thinking',
      'using_tool': 'using_tool',
      'error': 'error',
    };
    const status = statusMap[data.status] || 'idle';
    useChatStore.getState().setAgentStatus(status);
    this.emit('agent_status', data);
  }

  private handleTokenUsage(data: any): void {
    useChatStore.getState().setTokenUsage({
      used: data.used || data.tokensUsed || 0,
      total: data.total || data.maxTokens || 8000,
    });
    this.emit('token_usage', data);
  }

  private handleThreadUpdate(data: any): void {
    this.emit('thread_update', data);
  }

  sendMessage(threadId: string, content: string, options: Record<string, unknown> = {}): void {
    const payload = {
      type: 'user_message',
      threadId,
      message: {
        userMessage: content,
        templateType: 'userChat',
        ...options,
      },
      timestamp: new Date().toISOString(),
    };

    if (this.socket?.connected) {
      this.socket.emit('message', payload);
      useChatStore.getState().setAgentStatus('thinking');
    } else {
      this.messageQueue.push(payload);
    }
  }

  sendImage(threadId: string, imageData: string, caption?: string): void {
    const payload = {
      type: 'user_message',
      threadId,
      message: {
        templateType: 'userChat',
        uploadedImages: [imageData],
        userMessage: caption || '',
      },
      timestamp: new Date().toISOString(),
    };

    if (this.socket?.connected) {
      this.socket.emit('message', payload);
    }
  }

  createThread(name?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('create_thread', { name }, (response: any) => {
        if (response.success && response.threadId) {
          resolve(response.threadId);
        } else {
          reject(new Error(response.error || 'Failed to create thread'));
        }
      });
    });
  }

  setActiveThread(threadId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('set_active_thread', { threadId });
    }
  }

  stopGeneration(): void {
    if (this.socket?.connected) {
      this.socket.emit('stop_generation');
      useChatStore.getState().setStreaming(false);
      useChatStore.getState().setAgentStatus('idle');
    }
  }

  queueMessage(threadId: string, content: string): void {
    this.messageQueue.push({ threadId, content, queued: true });
    this.emit('message_queued', { threadId, content });
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.socket?.connected) {
      const payload = this.messageQueue.shift();
      this.socket.emit('message', payload);
    }
  }

  on(event: string, callback: ChatEventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: ChatEventCallback): void {
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

export const chatSocket = new ChatSocket();
export default chatSocket;
