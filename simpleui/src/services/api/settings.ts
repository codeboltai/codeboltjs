import apiClient from './client';
import type { AppSettings, Integration } from '@/types';

export const settingsApi = {
  async getSettings(): Promise<AppSettings | null> {
    try {
      const response = await apiClient.get('/profile/settings');
      return response.data;
    } catch {
      return null;
    }
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    await apiClient.put('/profile/settings', settings);
  },

  async getProviders(): Promise<unknown[]> {
    try {
      const response = await apiClient.get('/llm/providers');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async getModels(): Promise<unknown[]> {
    try {
      const response = await apiClient.get('/llm/models');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async testConnection(provider: string, apiKey: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post('/llm/test-connection', { provider, apiKey });
    return response.data;
  },
};

export const integrationsApi = {
  async getIntegrations(): Promise<Integration[]> {
    try {
      const response = await apiClient.get('/mcp/servers');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async connectIntegration(id: string, config: Record<string, unknown>): Promise<void> {
    await apiClient.post(`/mcp/servers/${id}/connect`, config);
  },

  async disconnectIntegration(id: string): Promise<void> {
    await apiClient.post(`/mcp/servers/${id}/disconnect`);
  },
};

export const logsApi = {
  async getLogs(options?: {
    level?: string;
    agentId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
  }): Promise<unknown[]> {
    try {
      const response = await apiClient.get('/system/logs', { params: options });
      return response.data || [];
    } catch {
      return [];
    }
  },

  async clearLogs(): Promise<void> {
    await apiClient.delete('/system/logs');
  },

  async downloadLogs(): Promise<Blob> {
    const response = await apiClient.get('/system/logs/download', {
      responseType: 'blob'
    });
    return response.data;
  },
};

export const systemApi = {
  async getSystemInfo(): Promise<Record<string, unknown>> {
    const response = await apiClient.get('/system/info');
    return response.data;
  },

  async getRuntime(): Promise<{ runtime: string; projectPath: string | null }> {
    const response = await apiClient.get('/runtime');
    return response.data;
  },

  async healthCheck(): Promise<{ status: string }> {
    const response = await apiClient.get('/system/health');
    return response.data;
  },
};

export default settingsApi;
