import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base MoveFileRequest Node - Calls fs.MoveFileRequestNotify
export class BaseMoveFileRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/movefile",
    title: "Move File Request",
    category: "codebolt/notifications/fs",
    description: "Sends a move file request notification",
    icon: "➡️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseMoveFileRequestNode.metadata.title, BaseMoveFileRequestNode.metadata.type);
    this.title = BaseMoveFileRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on MoveFileRequestNotify parameters
    this.addInput("sourceFile", "string");
    this.addInput("destinationFile", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}