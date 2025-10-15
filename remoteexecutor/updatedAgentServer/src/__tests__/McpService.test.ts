import fs from 'fs';
import path from 'path';
import os from 'os';
import { McpService } from '../services/McpService';

// Mock the CodeboltApplicationPath function
jest.mock('../config', () => {
  return {
    CodeboltApplicationPath: jest.fn().mockReturnValue('/tmp/test-codebolt-path/.codebolt')
  };
});

// Get the mocked CodeboltApplicationPath
const { CodeboltApplicationPath } = jest.requireMock('../config');

// Reset the singleton instance
const resetMcpService = () => {
  (McpService as any).instance = null;
};

describe('McpService', () => {
  let mcpService: McpService;
  const testConfigPath = path.join('/tmp/test-codebolt-path/.codebolt', 'mcp_server.json');

  beforeEach(() => {
    resetMcpService();
    mcpService = McpService.getInstance();
    
    // Create the test directory if it doesn't exist
    const dir = path.dirname(testConfigPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files after each test
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  afterAll(() => {
    resetMcpService();
  });

  describe('getMcpServers', () => {
    it('should return an empty array when the config file does not exist', async () => {
      // Ensure the file doesn't exist
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }

      const servers = await mcpService.getMcpServers();
      expect(servers).toEqual([]);
    });

    it('should return an empty array when the config file is invalid JSON', async () => {
      // Create an invalid JSON file
      fs.writeFileSync(testConfigPath, 'invalid json content');

      const servers = await mcpService.getMcpServers();
      expect(servers).toEqual([]);
    });

    it('should return an empty array when the config file has no mcpServers property', async () => {
      // Create a valid JSON file without mcpServers property
      const config = { someOtherProperty: 'value' };
      fs.writeFileSync(testConfigPath, JSON.stringify(config));

      const servers = await mcpService.getMcpServers();
      expect(servers).toEqual([]);
    });

    it('should return the servers array when the config file is valid', async () => {
      // Create a valid JSON file with mcpServers
      const testServers = [
        {
          id: 'mcp-server-1',
          name: 'Primary MCP Server',
          host: 'localhost',
          port: 3001,
          secure: true,
          apiKey: 'secret-key-1'
        },
        {
          id: 'mcp-server-2',
          name: 'Secondary MCP Server',
          host: 'localhost',
          port: 3002,
          secure: false,
          apiKey: 'secret-key-2'
        }
      ];

      const config = { mcpServers: testServers };
      fs.writeFileSync(testConfigPath, JSON.stringify(config));

      const servers = await mcpService.getMcpServers();
      expect(servers).toEqual(testServers);
    });

    it('should return an empty array when there is an error reading the file', async () => {
      // Mock fs.existsSync to throw an error
      const originalExistsSync = fs.existsSync;
      fs.existsSync = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const servers = await mcpService.getMcpServers();
      expect(servers).toEqual([]);

      // Restore the original function
      fs.existsSync = originalExistsSync;
    });
  });
});