// Agent Flow API types

export interface AgentFlow {
  id: string;
  name: string;
  description?: string;
  nodes: AgentFlowNode[];
  edges: AgentFlowEdge[];
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentFlowNode {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface AgentFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, unknown>;
}

export interface CreateAgentFlowRequest {
  name: string;
  description?: string;
  nodes: AgentFlowNode[];
  edges: AgentFlowEdge[];
  config?: Record<string, unknown>;
}

export interface UpdateAgentFlowRequest {
  name?: string;
  description?: string;
  nodes?: AgentFlowNode[];
  edges?: AgentFlowEdge[];
  config?: Record<string, unknown>;
}

export interface AgentFlowPlugin {
  name: string;
  displayName?: string;
  description?: string;
  category?: string;
}

export interface AgentFlowPluginUi {
  name: string;
  fields: Record<string, unknown>[];
}
