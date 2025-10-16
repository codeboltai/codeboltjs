import { Request, Response } from 'express';
import { ModelService } from '../services/ModelService';
import { logger } from '../utils/logger';
import { formatLogMessage } from '../types';

export class ModelController {
  private modelService: ModelService;

  constructor() {
    this.modelService = ModelService.getInstance();
  }

  public getModels(req: Request, res: Response): void {
    try {
      const models = this.modelService.getModels  ();
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
