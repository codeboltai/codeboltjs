import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types';

// Base class for MCP Tools node
export class BaseMCPToolsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "agent/mcp_tools",
    title: "MCP Tools",
    category: "agent",
    description: "Fetches available tools from MCP servers",
    icon: "🔧",
    color: "#9C27B0"
  };
  constructor() {
    super(BaseMCPToolsNode.metadata.title, BaseMCPToolsNode.metadata.type);
    this.title = BaseMCPToolsNode.metadata.title;
    this.properties = {
      servers: ['codebolt']
    };

    this.addInput("Servers", "array");
    this.addOutput("Agent Tools", "array");
    this.addOutput("Tools Count", "number");

    // Add widgets for UI
    this.addWidget("text", "Servers (comma separated)", (this.properties.servers as string[]).join(','), "onServersChange");
  }

  onServersChange(value) {
    this.properties.servers = value.split(',').map(s => s.trim()).filter(s => s);
  }

  async onExecute() {
    const servers = (this.getInputData(0) || this.properties.servers) as string[];

    if (!servers || servers.length === 0) {
      console.error('MCPToolsNode: At least one server is required');
      return;
    }

    try {
      // This would be implemented in the backend node
      // const {data} = await global.codebolt.mcp.listMcpFromServers(servers);

      // For now, create a mock structure
      const agentTools = {
        servers: servers,
        tools: [],
        loaded: false,
        type: 'mcp_tools'
      };

      this.setOutputData(0, agentTools);
      this.setOutputData(1, agentTools.tools ? agentTools.tools.length : 0);
    } catch (error) {
      console.error('MCPToolsNode: Error fetching tools:', error);
      const errorTools = {
        error: error.message,
        servers: servers,
        tools: [],
        type: 'mcp_tools'
      };
      this.setOutputData(0, errorTools);
      this.setOutputData(1, 0);
    }
  }
}