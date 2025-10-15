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

describe('McpController', () => {
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

    it('should handle errors when fetching MCP servers', async () => {
      const { McpService } = require('../services/McpService');
      (McpService.getInstance().getMcpServers as jest.Mock).mockRejectedValue(new Error('Test error'));

      const response = await request(app).get('/mcp/');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Test error'
      });
    });
  });

  describe('GET /mcp/:id', () => {
    it('should return specific MCP server by ID', async () => {
      const mockServers = [
        {
          id: 'test-server-1',
          name: 'Test Server 1',
          host: 'localhost',
          port: 3001,
          secure: true
        },
        {
          id: 'test-server-2',
          name: 'Test Server 2',
          host: 'localhost',
          port: 3002,
          secure: false
        }
      ];

      const { McpService } = require('../services/McpService');
      (McpService.getInstance().getMcpServers as jest.Mock).mockResolvedValue(mockServers);

      const response = await request(app).get('/mcp/test-server-1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        server: mockServers[0]
      });
    });

    it('should return 404 when MCP server is not found', async () => {
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

      const response = await request(app).get('/mcp/non-existent-server');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'MCP server with ID non-existent-server not found'
      });
    });

    it('should handle errors when fetching specific MCP server', async () => {
      const { McpService } = require('../services/McpService');
      (McpService.getInstance().getMcpServers as jest.Mock).mockRejectedValue(new Error('Test error'));

      const response = await request(app).get('/mcp/test-server');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: 'Test error'
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