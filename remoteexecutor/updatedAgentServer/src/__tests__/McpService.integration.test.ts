import fs from 'fs';
import path from 'path';
import os from 'os';
import { McpService } from '../services/McpService';

// We need to reset the singleton instance for this test
const resetMcpService = () => {
  (McpService as any).instance = null;
};

describe('McpService Integration Tests', () => {
  let tempDir: string;
  let originalCodeboltApplicationPath: () => string;

  beforeAll(() => {
    // Store the original implementation
    const configModule = require('../config');
    originalCodeboltApplicationPath = configModule.CodeboltApplicationPath;
    
    // Create a temporary directory for our test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
    
    // Override the CodeboltApplicationPath to return our temp directory
    configModule.CodeboltApplicationPath = () => tempDir;
    
    // Reset the singleton instance
    resetMcpService();
  });

  afterAll(() => {
    // Restore the original implementation
    const configModule = require('../config');
    configModule.CodeboltApplicationPath = originalCodeboltApplicationPath;
    
    // Clean up the temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    // Reset the singleton instance
    resetMcpService();
  });

  it('should read MCP servers from an actual JSON file', async () => {
    // Get a fresh instance of McpService
    const mcpService = McpService.getInstance();
    
    // Create a valid JSON file with mcpServers
    const testServers = [
      {
        id: 'integration-test-server-1',
        name: 'Integration Test Server 1',
        host: 'localhost',
        port: 4001,
        secure: true,
        apiKey: 'integration-test-key-1'
      }
    ];

    const tempConfigPath = path.join(tempDir, 'mcp_server.json');
    const config = { mcpServers: testServers };
    fs.writeFileSync(tempConfigPath, JSON.stringify(config, null, 2));

    const servers = await mcpService.getMcpServers();
    expect(servers).toEqual(testServers);
  });
});