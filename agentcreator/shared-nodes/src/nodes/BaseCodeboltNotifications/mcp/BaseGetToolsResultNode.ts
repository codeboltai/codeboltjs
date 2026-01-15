import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetToolsResult Node - Calls codebolt.notify.mcp.GetToolsResultNotify
export class BaseGetToolsResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/mcp/gettoolsresult",
    title: "Get Tools Result",
    category: "codebolt/notifications/mcp",
    description: "Sends a get tools result notification using codebolt.notify.mcp.GetToolsResultNotify",
    icon: "📋",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetToolsResultNode.metadata.title, BaseGetToolsResultNode.metadata.type);
    this.title = BaseGetToolsResultNode.metadata.title;
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
