import { AgentCliOptions, AgentTypeEnum } from '../types/cli';
import { CodeboltApplicationPath } from '../config';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import axios, { AxiosResponse } from 'axios';
import { MarketplaceAgent } from '@codebolt/types/apis/agents';
import { logger } from '@/utils/logger';

export interface AgentInfo {
  agentId: string;
  agentName: string;
  agentDescription: string;
  agentPath?: string;
  isLocal?: boolean;
  id?: string;
  unique_id?: string;
  [key: string]: any; // Allow additional properties
}

interface ProjectSetting {
  user_active_project_path?: string;
  [key: string]: any;
}

// Using MarketplaceAgent type from @codebolt/types package



export class AgentService {
  private static instance: AgentService | null = null;
  private agents: Map<string, AgentInfo>;
  private cliAgentInfo?: AgentInfo;

  private readonly defaultAgent: AgentInfo = {
    agentId: 'cli-agent',
    agentName: 'Ask Agent',
    agentDescription: 'Default local path agent',
    agentDetails: './../../agents/CliTestAgent/dist',
    agentType: AgentTypeEnum.localPath
  };
  private constructor() {
    this.agents = new Map();
    // Load agents from JSON file during initialization
    this.getMarketplaceAgents();
    // this.getLocalAgents();
  }
  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }

    return AgentService.instance;
  }

 

  /**
   * Get marketplace agents from local file or API
   * @returns Promise resolving to array of marketplace agents
   */
  public async getMarketplaceAgents(): Promise<AgentInfo[]> {
    try {
      const configPath = path.join(CodeboltApplicationPath(), 'agents.json');
      
      // First check if agents.json exists
      if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configFile);
        
        // If we have agents in the file, return them
        if (config.agents && config.agents.length > 0) {
          config.agents.forEach((agent: MarketplaceAgent) => {
            const agentInfo = this.convertToAgentInfo(agent);
            const key = agentInfo.agentId || agent.unique_id;
            if (key) {
              this.agents.set(key, agentInfo);
            }
          });
        }
      }
      
      // If no local agents, fetch from API
      const response: AxiosResponse<MarketplaceAgent[]> = await axios.get<MarketplaceAgent[]>('https://api.codebolt.ai/api/agents/list');
      const marketplaceAgents = response.data;
      
      // Update local agents.json with the fetched data
      const updatedConfig = {
        agents: marketplaceAgents
      };
      
      // Ensure the directory exists
      const dirPath = path.dirname(configPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // Write to agents.json
      fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
      
      // Update the agents map with the new marketplace agents
      marketplaceAgents.forEach((agent: MarketplaceAgent) => {
        const agentInfo = this.convertToAgentInfo(agent);
        const key = agentInfo.agentId || agent.unique_id;
        if (key) {
          this.agents.set(key, agentInfo);
        }
      });
      
      return Array.from(this.agents.values()).filter(agent => !agent.isLocal);
    } catch (error) {
      logger.error('Error fetching marketplace agents:', error);
      return [];
    }
  }

  public getAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  public async getLocalAgents(): Promise<AgentInfo[]> {
    try {
      const codeboltAgentPath = process.cwd();

      if (!fs.existsSync(codeboltAgentPath)) {
        return [];
      }

      const folders = fs.readdirSync(codeboltAgentPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      if (folders.length === 0) {
        return [];
      }

      const agentsData = folders.map(folder => {
        const yamlFilePath = path.resolve(codeboltAgentPath, folder, 'codeboltagent.yaml');

        if (!fs.existsSync(yamlFilePath)) {
          return null;
        }

        const yamlFile = fs.readFileSync(yamlFilePath, 'utf8');
        const agentData: any = yaml.load(yamlFile);
        return { 
          ...agentData, 
          agentPath: path.resolve(codeboltAgentPath, folder), 
          agentId: agentData.unique_id, 
          id: agentData.unique_id, 
          isLocal: true,
          agentName: agentData.name || folder,
          agentDescription: agentData.description || 'Local project agent'
        };
      }).filter(data => data !== null) as AgentInfo[];

      // Update the agents map with the local agents
      agentsData.forEach(agent => {
        if (agent.agentId) {
          this.agents.set(agent.agentId, agent);
        }
      });

      return agentsData;
    } catch (error) {
      logger.error('Error getting local agents:', error);
      return [];
    }
  }

  public setCliAgent(options?: AgentCliOptions): void {
    if (options?.agentType && options.agentDetail) {
      const agent = this.createCliAgentInfo(options.agentType, options.agentDetail, options.prompt);
      this.agents.set(agent.agentId, agent);
      this.cliAgentInfo = agent;
      return;
    }

    this.agents.set(this.defaultAgent.agentId, this.defaultAgent);
    this.cliAgentInfo = this.defaultAgent;
  }

  public getCliAgentInfo(): AgentInfo | undefined {
    return this.cliAgentInfo ?? this.defaultAgent;
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

  /**
   * Convert MarketplaceAgent to AgentInfo
   * @param marketplaceAgent The marketplace agent to convert
   * @returns The converted AgentInfo
   */
  private convertToAgentInfo(marketplaceAgent: MarketplaceAgent): AgentInfo {
    return {
      agentId: marketplaceAgent.unique_id,
      agentName: marketplaceAgent.title,
      agentDescription: marketplaceAgent.description,
      ...marketplaceAgent,
      id: marketplaceAgent.unique_id
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