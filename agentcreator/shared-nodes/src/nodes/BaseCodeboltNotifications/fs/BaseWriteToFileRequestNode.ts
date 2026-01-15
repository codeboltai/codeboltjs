import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base WriteToFileRequest Node - Calls fs.WriteToFileRequestNotify
export class BaseWriteToFileRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/writetofile",
    title: "Write To File Request",
    category: "codebolt/notifications/fs",
    description: "Sends a write to file request notification",
    icon: "📝",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseWriteToFileRequestNode.metadata.title, BaseWriteToFileRequestNode.metadata.type);
    this.title = BaseWriteToFileRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on WriteToFileRequestNotify parameters
    this.addInput("filePath", "string");
    this.addInput("text", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}