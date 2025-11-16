import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base ExecuteToolResult Node - Calls codebolt.notify.mcp.ExecuteToolResultNotify
export class BaseExecuteToolResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/executetoolresult",
    title: "Execute Tool Result",
    category: "codebolt/notifications/mcp",
    description: "Sends an execute tool result notification using codebolt.notify.mcp.ExecuteToolResultNotify",
    icon: "📊",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseExecuteToolResultNode.metadata.title, BaseExecuteToolResultNode.metadata.type);
    this.title = BaseExecuteToolResultNode.metadata.title;
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
