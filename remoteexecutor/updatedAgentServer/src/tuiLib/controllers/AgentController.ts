import { Request, Response } from 'express';
import { AgentService } from '../services/AgentService';
import { logger } from '../main/utils/logger';
import { formatLogMessage } from '../types';

export class AgentController {
  private agentService: AgentService;

  constructor() {
    this.agentService = AgentService.getInstance();
  }

  public getAgents(req: Request, res: Response): void {
    try {
      const agents = this.agentService.getAgents();
      res.json({ agents });
      logger.info(formatLogMessage('info', 'AgentController', `Agents requested from ${req.ip}`));
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'AgentController', `Failed to fetch agents: ${error instanceof Error ? error.message : String(error)}`)
      );
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  }
}
