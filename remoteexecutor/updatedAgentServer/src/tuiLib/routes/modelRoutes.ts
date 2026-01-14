import express, { Request, Response } from 'express';
import { ModelController } from './../controllers/ModelController';

export class ModelRoutes {
  public router: express.Router;
  private modelController: ModelController;

  constructor() {
    this.router = express.Router();
      this.modelController = new ModelController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    
    this.router.get('/', this.modelController.getModels.bind(this.modelController));

    this.router.get('/health', (req: Request, res: Response) => {
      res.json({ success: true });
    });
  }

 
}
