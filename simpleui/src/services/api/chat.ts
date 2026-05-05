import apiClient from './client';
import type { ChatMessage } from '@/types';

export interface ServerChatMessage {
  messageId: string;
  threadId: string;
  timestamp: string;
  senderType: string;
  sender?: {
    senderType: string;
    senderInfo?: Record<string, unknown>;
  };
  templateType?: string;
  data?: {
    text?: string;
  };
  message?: {
    userMessage?: string;
  };
}

const mapServerMessage = (msg: ServerChatMessage): ChatMessage => ({
  id: msg.messageId,
  threadId: msg.threadId,
  senderType: mapSenderType(msg.senderType || msg.sender?.senderType),
  senderName: msg.sender?.senderType === 'agent' ? 'Agent' : undefined,
  content: msg.data?.text || msg.message?.userMessage || '',
  timestamp: msg.timestamp,
  templateType: msg.templateType,
});

const mapSenderType = (type?: string): ChatMessage['senderType'] => {
  if (!type) return 'system';
  const typeMap: Record<string, ChatMessage['senderType']> = {
    'user': 'user',
    'agent': 'agent',
    'system': 'system',
    'ai': 'agent',
  };
  return typeMap[type.toLowerCase()] || 'system';
};

export const chatApi = {
  async getMessages(threadId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get<ServerChatMessage[]>(`/chat/messages/${threadId}`);
      return (response.data || []).map(mapServerMessage);
    } catch {
      return [];
    }
  },

  async getThreads(): Promise<unknown[]> {
    const response = await apiClient.get('/chat/threads-info');
    return response.data;
  },

  async createThread(name?: string, projectPath?: string): Promise<{ threadId: string }> {
    const response = await apiClient.post('/chat/threads', { name, projectPath });
    return response.data;
  },

  async setActiveThread(threadId: string): Promise<void> {
    await apiClient.post('/chat/set-active-thread', { threadId });
  },

  async deleteThread(threadId: string): Promise<void> {
    await apiClient.post('/chat/delete-thread', { threadId });
  },

  async sendMessage(threadId: string, message: string): Promise<{ messageId: string }> {
    const response = await apiClient.post('/chat/message', {
      threadId,
      message: {
        userMessage: message,
        templateType: 'userChat',
      }
    });
    return response.data;
  },

  async getThreadSteps(threadId: string): Promise<unknown[]> {
    const response = await apiClient.get(`/chat/threads/${threadId}/steps`);
    return response.data?.data || [];
  },

  async updateThreadName(threadId: string, name: string): Promise<void> {
    await apiClient.post('/chat/update-thread-name', { threadId, name });
  },

  async autoUpdateThreadName(threadId: string, userMessage: string): Promise<void> {
    await apiClient.patch('/chat/threads/auto-update-name', { threadId, userMessage });
  },
};

export default chatApi;
