import { Request, Response } from 'express';
import { ModelService } from '../../main/server/services/ModelService';
import { logger } from '../../main/utils/logger';
import { formatLogMessage } from '../../types';

export class ModelController {
  private modelService: ModelService;

  constructor() {
    this.modelService = ModelService.getInstance();
  }

  public async getModels(req: Request, res: Response): Promise<void> {
    try {
      const models = await this.modelService.getModels();
      res.json({ models });
      logger.info(formatLogMessage('info', 'ModelController', `Models requested from ${req.ip}`));
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'ModelController', `Failed to fetch models: ${error instanceof Error ? error.message : String(error)}`)
      );
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  }
}
