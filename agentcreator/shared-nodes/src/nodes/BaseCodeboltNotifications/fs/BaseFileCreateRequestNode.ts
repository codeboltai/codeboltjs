import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileCreateRequest Node - Calls fs.FileCreateRequestNotify
export class BaseFileCreateRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/filecreate",
    title: "File Create Request",
    category: "codebolt/notifications/fs",
    description: "Sends a file creation request notification",
    icon: "📄",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseFileCreateRequestNode.metadata.title, BaseFileCreateRequestNode.metadata.type);
    this.title = BaseFileCreateRequestNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileCreateRequestNotify parameters
    this.addInput("fileName", "string");
    this.addInput("source", "string");
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