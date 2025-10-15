import express, { Request, Response } from 'express';
import { AgentController } from '../controllers/AgentController';

export class AgentRoutes {
  public router: express.Router;
  private agentController: AgentController;

  constructor() {
    this.router = express.Router();
    this.agentController = new AgentController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.agentController.getAgents.bind(this.agentController));

    this.router.get('/health', (req: Request, res: Response) => {
      res.json({ success: true });
    });
  }
}
