import apiClient from './client';
import type { Agent } from '@/types';

export interface ServerAgent {
  id?: string;
  name: string;
  agentName?: string;
  role?: string;
  description?: string;
  status?: string;
  model?: string;
  currentTask?: string;
  tasksCompleted?: number;
  lastHeartbeat?: string;
  uptime?: string;
  capabilities?: string[];
  config?: Record<string, unknown>;
}

const mapServerAgent = (serverAgent: ServerAgent, index: number): Agent => ({
  id: serverAgent.id || serverAgent.name || `agent-${index}`,
  name: serverAgent.agentName || serverAgent.name,
  role: serverAgent.role || serverAgent.description || 'Agent',
  status: mapAgentStatus(serverAgent.status),
  currentTask: serverAgent.currentTask,
  model: serverAgent.model || 'claude-sonnet-4.5',
  tasksCompleted: serverAgent.tasksCompleted || 0,
  lastHeartbeat: serverAgent.lastHeartbeat || new Date().toISOString(),
  uptime: serverAgent.uptime || '0h',
  capabilities: serverAgent.capabilities || [],
});

const mapAgentStatus = (status?: string): Agent['status'] => {
  if (!status) return 'offline';
  const statusMap: Record<string, Agent['status']> = {
    'working': 'working',
    'running': 'working',
    'busy': 'working',
    'idle': 'idle',
    'ready': 'idle',
    'error': 'error',
    'failed': 'error',
    'offline': 'offline',
    'stopped': 'offline',
  };
  return statusMap[status.toLowerCase()] || 'offline';
};

export const agentsApi = {
  async getInstalledAgents(): Promise<Agent[]> {
    try {
      const response = await apiClient.get<ServerAgent[]>('/agent/installed');
      return (response.data || []).map(mapServerAgent);
    } catch {
      return [];
    }
  },

  async getRunningAgents(): Promise<Agent[]> {
    try {
      const response = await apiClient.get<ServerAgent[]>('/agent/running');
      return (response.data || []).map(mapServerAgent);
    } catch {
      return [];
    }
  },

  async getAgentConfig(agentName: string): Promise<Record<string, unknown>> {
    const response = await apiClient.get(`/agent/agentConfig/${agentName}`);
    return response.data;
  },

  async getAgentConfigs(): Promise<Record<string, unknown>[]> {
    const response = await apiClient.get('/agent/agentConfigs');
    return response.data;
  },

  async startAgent(agentName: string): Promise<void> {
    await apiClient.post('/agent/startAgent', { agentName });
  },

  async stopAgent(agentName: string): Promise<void> {
    await apiClient.post('/agent/stop', { agentName });
  },

  async changeAgent(agentName: string): Promise<void> {
    await apiClient.post('/agent/changeAgent', { agentName });
  },

  async createCustomAgent(request: {
    name: string;
    role: string;
    capabilities: string[];
    systemPrompt?: string;
  }): Promise<void> {
    await apiClient.post('/agent/createcustomlocalagent', {
      agentName: request.name,
      role: request.role,
      capabilities: request.capabilities,
      systemPrompt: request.systemPrompt,
    });
  },

  async getAgentProperties(agentName: string): Promise<Record<string, unknown>> {
    const response = await apiClient.get('/agent/agentproperties', {
      params: { agentName }
    });
    return response.data;
  },

  async updateAgentProperties(agentName: string, properties: Record<string, unknown>): Promise<void> {
    await apiClient.put('/agent/agentproperties', {
      agentName,
      ...properties
    });
  },
};

export default agentsApi;
