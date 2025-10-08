export interface AgentCliOptions {
  noui: boolean;
  host?: string;
  port?: number;
  verbose?: boolean;
  remote?: boolean;
  remoteUrl?: string;
  appToken?: string;
  agentType?: 'marketplace' | 'local-zip' | 'local-path' | 'server-zip';
  agentDetail?: string;
  prompt?: string;
}
