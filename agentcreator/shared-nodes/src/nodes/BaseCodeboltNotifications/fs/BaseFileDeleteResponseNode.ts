import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileDeleteResponse Node - Calls fs.FileDeleteResponseNotify
export class BaseFileDeleteResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/response/filedelete",
    title: "File Delete Response",
    category: "codebolt/notifications/fs",
    description: "Sends a file delete response notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseFileDeleteResponseNode.metadata.title, BaseFileDeleteResponseNode.metadata.type);
    this.title = BaseFileDeleteResponseNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileDeleteResponseNotify parameters
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