import apiClient from './client';
import type { UsageStats, ApprovalRequest, Schedule } from '@/types';

export const usageApi = {
  async getUsageStats(): Promise<UsageStats> {
    try {
      const response = await apiClient.get('/llm/usage');
      return {
        todayCost: response.data?.todayCost || 0,
        weekCost: response.data?.weekCost || 0,
        todayTokens: response.data?.todayTokens || 0,
        activeAgentHours: response.data?.activeAgentHours || 0,
        byAgent: response.data?.byAgent || [],
      };
    } catch {
      return {
        todayCost: 0,
        weekCost: 0,
        todayTokens: 0,
        activeAgentHours: 0,
        byAgent: [],
      };
    }
  },

  async getCostBreakdown(period: 'day' | 'week' | 'month'): Promise<unknown> {
    const response = await apiClient.get('/llm/cost-breakdown', {
      params: { period }
    });
    return response.data;
  },
};

export const approvalsApi = {
  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    try {
      const response = await apiClient.get('/swarm/approval-requests');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async approveRequest(requestId: string, feedback?: string): Promise<void> {
    await apiClient.post(`/swarm/approval-requests/${requestId}/approve`, { feedback });
  },

  async rejectRequest(requestId: string, feedback?: string): Promise<void> {
    await apiClient.post(`/swarm/approval-requests/${requestId}/reject`, { feedback });
  },

  async getApprovalHistory(): Promise<ApprovalRequest[]> {
    try {
      const response = await apiClient.get('/swarm/approval-requests/history');
      return response.data || [];
    } catch {
      return [];
    }
  },
};

export const schedulesApi = {
  async getSchedules(): Promise<Schedule[]> {
    try {
      const response = await apiClient.get('/jobs/schedules');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async createSchedule(schedule: Partial<Schedule>): Promise<Schedule> {
    const response = await apiClient.post('/jobs/schedules', schedule);
    return response.data;
  },

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule> {
    const response = await apiClient.put(`/jobs/schedules/${id}`, updates);
    return response.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/jobs/schedules/${id}`);
  },

  async runScheduleNow(id: string): Promise<void> {
    await apiClient.post(`/jobs/schedules/${id}/run`);
  },

  async getScheduleHistory(id: string): Promise<unknown[]> {
    const response = await apiClient.get(`/jobs/schedules/${id}/history`);
    return response.data || [];
  },
};

export const swarmApi = {
  async getSwarms(): Promise<unknown[]> {
    try {
      const response = await apiClient.get('/swarm/swarms');
      return response.data || [];
    } catch {
      return [];
    }
  },

  async getSwarmAgents(swarmId: string): Promise<unknown[]> {
    const response = await apiClient.get(`/swarm/swarms/${swarmId}/agents`);
    return response.data || [];
  },

  async getSwarmStatus(swarmId: string): Promise<unknown> {
    const response = await apiClient.get(`/swarm/swarms/${swarmId}/status`);
    return response.data;
  },
};

export const eventLogApi = {
  async getEvents(options?: {
    type?: string;
    agentId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<unknown[]> {
    try {
      const response = await apiClient.get('/eventlog/events', { params: options });
      return response.data || [];
    } catch {
      return [];
    }
  },

  async getEventStats(): Promise<unknown> {
    const response = await apiClient.get('/eventlog/stats');
    return response.data;
  },
};

export default usageApi;
