import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileReadResponse Node - Calls fs.FileReadResponseNotify
export class BaseFileReadResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/response/fileread",
    title: "File Read Response",
    category: "codebolt/notifications/fs",
    description: "Sends a file read response notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseFileReadResponseNode.metadata.title, BaseFileReadResponseNode.metadata.type);
    this.title = BaseFileReadResponseNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileReadResponseNotify parameters
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