import { AgentCliOptions, AgentTypeEnum } from '../types/cli';

export interface AgentInfo {
  agentId: string;
  agentName: string;
  agentDescription: string;
}

const DEFAULT_AGENTS: AgentInfo[] = [
  {
    agentId: AgentTypeEnum.marketplace,
    agentName: 'Marketplace Agent',
    agentDescription: 'Discover and run agents published on the Codebolt marketplace.'
  },
  {
    agentId: AgentTypeEnum.localPath,
    agentName: 'Local Path Agent',
    agentDescription: 'Load an agent directly from a local folder containing the implementation.'
  },
  {
    agentId: AgentTypeEnum.localZip,
    agentName: 'Local ZIP Agent',
    agentDescription: 'Execute an agent packaged as a ZIP archive on the local machine.'
  },
  {
    agentId: AgentTypeEnum.serverZip,
    agentName: 'Remote ZIP Agent',
    agentDescription: 'Download and run an agent bundle hosted at a remote URL.'
  }
];

export class AgentService {
  private static instance: AgentService | null = null;
  private agents: Map<string, AgentInfo>;

  private constructor() {
    this.agents = new Map(DEFAULT_AGENTS.map((agent) => [agent.agentId, agent]));
  }

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }

    return AgentService.instance;
  }

  public getAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  public setCliAgent(options?: AgentCliOptions): void {
    if (options?.agentType && options.agentDetail) {
      const agent = this.createCliAgentInfo(options.agentType, options.agentDetail, options.prompt);
      this.agents.set(agent.agentId, agent);
      return;
    }

    this.agents.delete('cli-agent');
  }

  private createCliAgentInfo(agentType: AgentTypeEnum, agentDetail: string, prompt?: string | null): AgentInfo {
    const readableType = this.getAgentTypeLabel(agentType);
    const descriptionParts = [`Configured via CLI as ${readableType}.`, `Detail: ${agentDetail}`];

    if (prompt) {
      descriptionParts.push(`Initial prompt: ${prompt}`);
    }

    return {
      agentId: 'cli-agent',
      agentName: 'CLI Provided Agent',
      agentDescription: descriptionParts.join(' ')
    };
  }

  private getAgentTypeLabel(agentType: AgentTypeEnum): string {
    switch (agentType) {
      case AgentTypeEnum.marketplace:
        return 'Marketplace Agent';
      case AgentTypeEnum.localPath:
        return 'Local Path Agent';
      case AgentTypeEnum.localZip:
        return 'Local ZIP Agent';
      case AgentTypeEnum.serverZip:
        return 'Remote ZIP Agent';
      default:
        return agentType;
    }
  }
}
