import express, { Request, Response } from 'express';
import { LLMProviderController } from '../controllers/LLMProviderController';

export class LLMProviderRoutes {
  public router: express.Router;
  private llmProviderController: LLMProviderController;

  constructor() {
    this.router = express.Router();
    this.llmProviderController = new LLMProviderController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.llmProviderController.getLLMProviders.bind(this.llmProviderController));
    this.router.get('/health', (req: Request, res: Response) => {
      res.json({ success: true });
    });
  }
}
