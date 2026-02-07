// Background Agents API types

export interface BackgroundAgentInstance {
  id: string;
  agentId: string;
  agentName?: string;
  status: 'active' | 'stopped' | 'error';
  startedAt: string;
  stoppedAt?: string;
  config?: Record<string, unknown>;
}

export interface StartBackgroundAgentRequest {
  agentId: string;
  agentName?: string;
  config?: Record<string, unknown>;
}

export interface StopBackgroundAgentRequest {
  reason?: string;
}
