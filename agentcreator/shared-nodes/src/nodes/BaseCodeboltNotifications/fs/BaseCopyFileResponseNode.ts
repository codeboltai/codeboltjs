import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CopyFileResponse Node - Calls fs.CopyFileResponseNotify
export class BaseCopyFileResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/response/copyfile",
    title: "Copy File Response",
    category: "codebolt/notifications/fs",
    description: "Sends a copy file response notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseCopyFileResponseNode.metadata.title, BaseCopyFileResponseNode.metadata.type);
    this.title = BaseCopyFileResponseNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on CopyFileResponseNotify parameters
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