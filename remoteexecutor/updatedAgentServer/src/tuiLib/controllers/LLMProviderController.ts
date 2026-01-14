import { Request, Response } from 'express';
import { LLMProviderService } from '../../main/services/LLMProviderService';
import { logger } from '../../main/utils/logger';
import { formatLogMessage } from '../../types';

export class LLMProviderController {
  private llmProviderService: LLMProviderService;

  constructor() {
    this.llmProviderService = LLMProviderService.getInstance(); // Changed from AgentService to LLMProviderService
  }

  public getLLMProviders(req: Request, res: Response): void {
    try {
      const providers  = this.llmProviderService.getLLMProvidersList();
      logger.info(formatLogMessage('info', 'LLMProviderController', `LLM Providers requested from ${req.ip}`));
      res.json({ providers });
      logger.info(formatLogMessage('info', 'LLMProviderController', `Providers requested from ${req.ip}`));
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'LLMProviderController', `Failed to fetch providers: ${error instanceof Error ? error.message : String(error)}`)
      );
      res.status(500).json({ error: 'Failed to fetch providers' });
    }
  }
}
