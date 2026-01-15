import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base MoveFileResponse Node - Calls fs.MoveFileResponseNotify
export class BaseMoveFileResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/response/movefile",
    title: "Move File Response",
    category: "codebolt/notifications/fs",
    description: "Sends a move file response notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseMoveFileResponseNode.metadata.title, BaseMoveFileResponseNode.metadata.type);
    this.title = BaseMoveFileResponseNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on MoveFileResponseNotify parameters
    this.addInput("content", "object");
    this.addInput("isError", "boolean");
    this.addInput("toolUseId", "string");

    // Event output for response sent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}