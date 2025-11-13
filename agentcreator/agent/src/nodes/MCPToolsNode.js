import { BaseMCPToolsNode } from '@agent-creator/shared-nodes';

// Backend-specific MCP Tools Node - execution logic with actual Codebolt integration
export class MCPToolsNode extends BaseMCPToolsNode {
  constructor() {
    super();
    // Backend doesn't need UI widgets
  }

  async onExecute() {
    const servers = this.getInputData(0) || this.properties.servers;

    if (!servers || servers.length === 0) {
      console.error('MCPToolsNode: At least one server is required');
      this.setOutputData(0, []);
      this.setOutputData(1, 0);
      return;
    }

    try {
      // Use the global codebolt connection initialized in server.js
      if (!global.codebolt) {
        throw new Error('Codebolt connection not initialized. Please check server startup.');
      }

      // console.log(`MCPToolsNode ${this.id}: Fetching tools from servers:`, servers);

      // Actual Codebolt SDK call - using the exact pattern from your example
      const { data } = await global.codebolt.mcp.listMcpFromServers(servers);

      // Output the actual agentTools (data) as returned by the SDK
      this.setOutputData(0, data);
      this.setOutputData(1, data ? data.length : 0);

      // console.log(`MCPToolsNode ${this.id}: Successfully loaded ${data ? data.length : 0} tools`);
    } catch (error) {
      console.error(`MCPToolsNode ${this.id}: Error fetching tools:`, error);
      this.setOutputData(0, []);
      this.setOutputData(1, 0);
    }
  }
}