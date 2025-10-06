export interface AgentCliOptions {
  noui: boolean;
  host?: string;
  port?: number;
  verbose?: boolean;
  agentType?: 'marketplace' | 'local-zip' | 'local-path' | 'server-zip';
  agentDetail?: string;
  prompt?: string;
}
