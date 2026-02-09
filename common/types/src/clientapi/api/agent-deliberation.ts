// Agent Deliberation API types

export interface Deliberation {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'voting' | 'closed';
  createdAt: string;
  updatedAt: string;
  summary?: string;
  winnerId?: string;
}

export interface CreateDeliberationRequest {
  title: string;
  description?: string;
}

export interface UpdateDeliberationRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'voting' | 'closed';
}

export interface DeliberationResponse {
  id: string;
  deliberationId: string;
  agentId: string;
  agentName?: string;
  content: string;
  createdAt: string;
}

export interface AddDeliberationResponseRequest {
  agentId: string;
  agentName?: string;
  content: string;
}

export interface DeliberationVote {
  id: string;
  deliberationId: string;
  responseId: string;
  agentId: string;
  agentName?: string;
  score: number;
  reason?: string;
  createdAt: string;
}

export interface AddDeliberationVoteRequest {
  responseId: string;
  agentId: string;
  agentName?: string;
  score: number;
  reason?: string;
}

export interface UpdateDeliberationSummaryRequest {
  summary: string;
}

export interface StartDeliberationAgentsRequest {
  agentIds?: string[];
  config?: Record<string, unknown>;
}

export interface StartVotingAgentsRequest {
  agentIds?: string[];
  config?: Record<string, unknown>;
}
