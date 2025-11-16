import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base GetEnabledMCPServersRequest Node - Calls codebolt.notify.mcp.GetEnabledMCPServersRequestNotify
export class BaseGetEnabledMCPServersRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/getenabledmcpserverrequest",
    title: "Get Enabled MCP Servers Request",
    category: "codebolt/notifications/mcp",
    description: "Sends a get enabled MCP servers request notification using codebolt.notify.mcp.GetEnabledMCPServersRequestNotify",
    icon: "🔌",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetEnabledMCPServersRequestNode.metadata.title, BaseGetEnabledMCPServersRequestNode.metadata.type);
    this.title = BaseGetEnabledMCPServersRequestNode.metadata.title;
    this.size = [280, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
