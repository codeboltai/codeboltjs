import apiClient from './client';
import type { Channel, RoutingRule } from '@/types';

export interface ServerChannel {
  id: string;
  platform: string;
  name: string;
  status: string;
  identifier?: string;
  config?: Record<string, unknown>;
  assignedAgent?: string;
  connectedSince?: string;
  messageCount?: number;
  lastMessage?: string;
}

const mapServerChannel = (serverChannel: ServerChannel): Channel => ({
  id: serverChannel.id,
  platform: serverChannel.platform as Channel['platform'],
  name: serverChannel.name,
  status: mapChannelStatus(serverChannel.status),
  identifier: serverChannel.identifier || '',
  messageCount: serverChannel.messageCount || 0,
  assignedAgent: serverChannel.assignedAgent ? {
    id: serverChannel.assignedAgent,
    name: serverChannel.assignedAgent,
    role: '',
    status: 'idle',
    model: '',
    tasksCompleted: 0,
    lastHeartbeat: new Date().toISOString(),
    uptime: '0h',
    capabilities: [],
  } : undefined,
  connectedSince: serverChannel.connectedSince,
  lastMessage: serverChannel.lastMessage,
  config: serverChannel.config || {},
});

const mapChannelStatus = (status?: string): Channel['status'] => {
  if (!status) return 'disconnected';
  const statusMap: Record<string, Channel['status']> = {
    'connected': 'connected',
    'active': 'connected',
    'disconnected': 'disconnected',
    'inactive': 'disconnected',
    'reconnecting': 'reconnecting',
    'connecting': 'reconnecting',
  };
  return statusMap[status.toLowerCase()] || 'disconnected';
};

export const channelsApi = {
  async getChannels(): Promise<Channel[]> {
    try {
      const response = await apiClient.get<ServerChannel[]>('/gateway/channels');
      return (response.data || []).map(mapServerChannel);
    } catch {
      return [];
    }
  },

  async getChannel(id: string): Promise<Channel> {
    const response = await apiClient.get<ServerChannel>(`/gateway/channels/${id}`);
    return mapServerChannel(response.data);
  },

  async createChannel(request: {
    platform: string;
    name: string;
    config?: Record<string, unknown>;
    assignedAgent?: string;
  }): Promise<Channel> {
    const response = await apiClient.post<ServerChannel>('/gateway/channels', request);
    return mapServerChannel(response.data);
  },

  async updateChannel(id: string, updates: Partial<Channel>): Promise<Channel> {
    const response = await apiClient.put<ServerChannel>(`/gateway/channels/${id}`, updates);
    return mapServerChannel(response.data);
  },

  async deleteChannel(id: string): Promise<void> {
    await apiClient.delete(`/gateway/channels/${id}`);
  },

  async connectChannel(id: string): Promise<void> {
    await apiClient.post(`/gateway/channels/${id}/connect`);
  },

  async disconnectChannel(id: string): Promise<void> {
    await apiClient.post(`/gateway/channels/${id}/disconnect`);
  },

  async getActivityLog(): Promise<unknown[]> {
    const response = await apiClient.get('/gateway/activity-log');
    return response.data;
  },

  async clearActivityLog(): Promise<void> {
    await apiClient.delete('/gateway/activity-log');
  },

  async getStatus(): Promise<Record<string, unknown>> {
    const response = await apiClient.get('/gateway/status');
    return response.data;
  },
};

export const routingApi = {
  async getRoutingRules(): Promise<RoutingRule[]> {
    try {
      const response = await apiClient.get<RoutingRule[]>('/gateway/routes');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async createRoutingRule(rule: Partial<RoutingRule>): Promise<RoutingRule> {
    const response = await apiClient.post<RoutingRule>('/gateway/routes', rule);
    return response.data;
  },

  async updateRoutingRule(id: string, updates: Partial<RoutingRule>): Promise<RoutingRule> {
    const response = await apiClient.put<RoutingRule>(`/gateway/routes/${id}`, updates);
    return response.data;
  },

  async deleteRoutingRule(id: string): Promise<void> {
    await apiClient.delete(`/gateway/routes/${id}`);
  },
};

export default channelsApi;
