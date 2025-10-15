import express, { Request, Response } from 'express';
import { TodoController } from '../controllers/TodoController';

export class TodoRoutes {
  public router: express.Router;
  private todoController: TodoController;

  constructor() {
    this.router = express.Router();
    this.todoController = new TodoController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Get all todos
    this.router.get('/', this.todoController.getTodos.bind(this.todoController));
    
    // Get todos by thread ID
    this.router.get('/thread/:threadId', this.todoController.getTodosByThreadId.bind(this.todoController));
    
    // Get all thread IDs
    this.router.get('/threads', this.todoController.getThreadIds.bind(this.todoController));
    
    // Simple route that returns success: true (kept for backward compatibility)
    this.router.get('/health', (req: Request, res: Response) => {
      res.json({ success: true });
    });
  }
}