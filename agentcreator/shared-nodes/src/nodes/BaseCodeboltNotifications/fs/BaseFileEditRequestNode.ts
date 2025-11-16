import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileEditRequest Node - Calls fs.FileEditRequestNotify
export class BaseFileEditRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/fileedit",
    title: "File Edit Request",
    category: "codebolt/notifications/fs",
    description: "Sends a file edit request notification",
    icon: "✏️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseFileEditRequestNode.metadata.title, BaseFileEditRequestNode.metadata.type);
    this.title = BaseFileEditRequestNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileEditRequestNotify parameters
    this.addInput("fileName", "string");
    this.addInput("filePath", "string");
    this.addInput("newContent", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}