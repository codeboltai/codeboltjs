import express, { Request, Response } from 'express';
import { getAvailableModels } from '../models/modelRegistry';
import { logger } from '../utils/logger';
import { formatLogMessage } from '../types';

export class ModelRoutes {
  public router: express.Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.getModels.bind(this));

    this.router.get('/health', (req: Request, res: Response) => {
      res.json({ success: true });
    });
  }

  private getModels(req: Request, res: Response): void {
    try {
      const models = getAvailableModels();
      res.json({ models });
      logger.info(formatLogMessage('info', 'ModelRoutes', `Models requested from ${req.ip}`));
    } catch (error) {
      logger.error(
        formatLogMessage('error', 'ModelRoutes', `Error retrieving models: ${error instanceof Error ? error.message : String(error)}`)
      );
      res.status(500).json({ error: 'Failed to retrieve models' });
    }
  }
}
