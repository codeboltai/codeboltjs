import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ListToolsFromMCPServersRequest Node - Calls codebolt.notify.mcp.ListToolsFromMCPServersRequestNotify
export class BaseListToolsFromMCPServersRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/listtoolsfrommcpserverrequest",
    title: "List Tools From MCP Servers Request",
    category: "codebolt/notifications/mcp",
    description: "Sends a list tools from MCP servers request notification using codebolt.notify.mcp.ListToolsFromMCPServersRequestNotify",
    icon: "📦",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseListToolsFromMCPServersRequestNode.metadata.title, BaseListToolsFromMCPServersRequestNode.metadata.type);
    this.title = BaseListToolsFromMCPServersRequestNode.metadata.title;
    this.size = [300, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - array of toolbox names
    this.addInput("toolboxes", "array");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
