import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base ListToolsFromMCPServersResult Node - Calls codebolt.notify.mcp.ListToolsFromMCPServersResultNotify
export class BaseListToolsFromMCPServersResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/listtoolsfrommcpserverresult",
    title: "List Tools From MCP Servers Result",
    category: "codebolt/notifications/mcp",
    description: "Sends a list tools from MCP servers result notification using codebolt.notify.mcp.ListToolsFromMCPServersResultNotify",
    icon: "📄",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseListToolsFromMCPServersResultNode.metadata.title, BaseListToolsFromMCPServersResultNode.metadata.type);
    this.title = BaseListToolsFromMCPServersResultNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required inputs
    this.addInput("content", 0 as any);
    this.addInput("toolUseId", "string");

    // Optional input
    this.addInput("isError", "boolean");

    // Event output for responseSent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
