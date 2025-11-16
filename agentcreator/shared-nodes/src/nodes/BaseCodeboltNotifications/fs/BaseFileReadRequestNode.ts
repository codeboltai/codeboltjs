import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileReadRequest Node - Calls fs.FileReadRequestNotify
export class BaseFileReadRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/fileread",
    title: "File Read Request",
    category: "codebolt/notifications/fs",
    description: "Sends a file read request notification with optional line ranges",
    icon: "📖",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseFileReadRequestNode.metadata.title, BaseFileReadRequestNode.metadata.type);
    this.title = BaseFileReadRequestNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileReadRequestNotify parameters
    this.addInput("filePath", "string");
    this.addInput("startLine", "string");
    this.addInput("endLine", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}