import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base GetToolsRequest Node - Calls codebolt.notify.mcp.GetToolsRequestNotify
export class BaseGetToolsRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/gettoolsrequest",
    title: "Get Tools Request",
    category: "codebolt/notifications/mcp",
    description: "Sends a get tools request notification using codebolt.notify.mcp.GetToolsRequestNotify",
    icon: "🛠️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetToolsRequestNode.metadata.title, BaseGetToolsRequestNode.metadata.type);
    this.title = BaseGetToolsRequestNode.metadata.title;
    this.size = [260, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - array of tools with toolbox and toolName
    this.addInput("tools", "array");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
