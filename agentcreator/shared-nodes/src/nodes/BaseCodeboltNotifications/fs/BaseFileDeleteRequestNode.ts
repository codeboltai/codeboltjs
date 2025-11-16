import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileDeleteRequest Node - Calls fs.FileDeleteRequestNotify
export class BaseFileDeleteRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/filedelete",
    title: "File Delete Request",
    category: "codebolt/notifications/fs",
    description: "Sends a file delete request notification",
    icon: "🗑️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseFileDeleteRequestNode.metadata.title, BaseFileDeleteRequestNode.metadata.type);
    this.title = BaseFileDeleteRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileDeleteRequestNotify parameters
    this.addInput("fileName", "string");
    this.addInput("filePath", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}