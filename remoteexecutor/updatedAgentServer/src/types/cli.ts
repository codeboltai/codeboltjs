export enum AgentTypeEnum {
  marketplace = 'marketplace',
  localZip = 'local-zip',
  localPath = 'local-path',
  serverZip = 'server-zip'
}

export interface AgentCliOptions {
  noui: boolean;
  host?: string;
  port?: number;
  verbose?: boolean;
  remote?: boolean;
  remoteUrl?: string;
  appToken?: string;
  agentType?: AgentTypeEnum;
  agentDetail?: string;
  prompt?: string;
}