import { Request, Response } from 'express';
import { McpService } from '../services/McpService';

export class McpController {
  private mcpService: McpService;

  constructor() {
    this.mcpService = McpService.getInstance();
  }

  /**
   * Get list of MCP servers
   * @param req Express Request
   * @param res Express Response
   */
  public async getMcpServers(req: Request, res: Response): Promise<void> {
    try {
      const servers = await this.mcpService.getMcpServers();
      res.json({
        success: true,
        servers: servers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get MCP server by ID
   * @param req Express Request
   * @param res Express Response
   */
  public async getMcpServerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const servers = await this.mcpService.getMcpServers();
      const server = servers.find((s: any) => s.id === id);
      
      if (server) {
        res.json({
          success: true,
          server: server
        });
      } else {
        res.status(404).json({
          success: false,
          error: `MCP server with ID ${id} not found`
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}