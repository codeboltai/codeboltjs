import express from 'express';
import { ConversationController } from '../controllers/ConversationController';

export class ConversationRoutes {
  public router: express.Router;
  private controller: ConversationController;

  constructor() {
    this.router = express.Router();
    this.controller = new ConversationController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/', this.controller.addConversation.bind(this.controller));
    this.router.get('/health', (_req, res) => {
      res.json({ success: true });
    });
    this.router.get('/:id', this.controller.getConversation.bind(this.controller));
  }
}
