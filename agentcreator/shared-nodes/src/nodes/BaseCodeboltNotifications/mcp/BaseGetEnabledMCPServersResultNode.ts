import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetEnabledMCPServersResult Node - Calls codebolt.notify.mcp.GetEnabledMCPServersResultNotify
export class BaseGetEnabledMCPServersResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/getenabledmcpserverresult",
    title: "Get Enabled MCP Servers Result",
    category: "codebolt/notifications/mcp",
    description: "Sends a get enabled MCP servers result notification using codebolt.notify.mcp.GetEnabledMCPServersResultNotify",
    icon: "📋",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetEnabledMCPServersResultNode.metadata.title, BaseGetEnabledMCPServersResultNode.metadata.type);
    this.title = BaseGetEnabledMCPServersResultNode.metadata.title;
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
