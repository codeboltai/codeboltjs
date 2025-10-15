import express, { Request, Response } from 'express';
import { McpController } from '../controllers/McpController';

export class McpRoutes {
  public router: express.Router;
  private mcpController: McpController;

  constructor() {
    this.router = express.Router();
    this.mcpController = new McpController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Simple route that returns success: true (kept for backward compatibility)
    this.router.get('/health', (req: Request, res: Response) => {
      res.json({ success: true });
    });
    
    // Get all MCP servers
    this.router.get('/', this.mcpController.getMcpServers.bind(this.mcpController));
    
    // Get specific MCP server by ID
    this.router.get('/:id', this.mcpController.getMcpServerById.bind(this.mcpController));
  }
}