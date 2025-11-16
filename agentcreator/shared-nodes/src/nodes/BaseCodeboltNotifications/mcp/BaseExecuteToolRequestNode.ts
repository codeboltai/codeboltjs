import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base ExecuteToolRequest Node - Calls codebolt.notify.mcp.ExecuteToolRequestNotify
export class BaseExecuteToolRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/executetoolrequest",
    title: "Execute Tool Request",
    category: "codebolt/notifications/mcp",
    description: "Sends an execute tool request notification using codebolt.notify.mcp.ExecuteToolRequestNotify",
    icon: "🚀",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseExecuteToolRequestNode.metadata.title, BaseExecuteToolRequestNode.metadata.type);
    this.title = BaseExecuteToolRequestNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required inputs
    this.addInput("toolbox", "string");
    this.addInput("toolName", "string");
    this.addInput("params", 0 as any);

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
