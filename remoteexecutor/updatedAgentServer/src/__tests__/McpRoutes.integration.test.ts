import express from 'express';
import request from 'supertest';
import { McpRoutes } from '../routes/mcpRoutes';

// Mock the McpService
jest.mock('../services/McpService', () => {
  return {
    McpService: {
      getInstance: jest.fn().mockReturnValue({
        getMcpServers: jest.fn()
      })
    }
  };
});

describe('McpRoutes Integration Tests', () => {
  let app: express.Application;
  let mcpRoutes: McpRoutes;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    mcpRoutes = new McpRoutes();
    app.use('/mcp', mcpRoutes.router);
  });

  describe('GET /mcp/', () => {
    it('should return list of MCP servers', async () => {
      const mockServers = [
        {
          id: 'test-server-1',
          name: 'Test Server 1',
          host: 'localhost',
          port: 3001,
          secure: true
        }
      ];

      const { McpService } = require('../services/McpService');
      (McpService.getInstance().getMcpServers as jest.Mock).mockResolvedValue(mockServers);

      const response = await request(app).get('/mcp/');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        servers: mockServers
      });
    });
  });

  describe('GET /mcp/health', () => {
    it('should return success: true for health check', async () => {
      const response = await request(app).get('/mcp/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });
});