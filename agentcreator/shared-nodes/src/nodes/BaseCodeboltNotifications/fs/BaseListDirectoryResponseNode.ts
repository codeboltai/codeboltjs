import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ListDirectoryResponse Node - Calls fs.ListDirectoryResponseNotify
export class BaseListDirectoryResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/response/listdirectory",
    title: "List Directory Response",
    category: "codebolt/notifications/fs",
    description: "Sends a directory listing response notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseListDirectoryResponseNode.metadata.title, BaseListDirectoryResponseNode.metadata.type);
    this.title = BaseListDirectoryResponseNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on ListDirectoryResponseNotify parameters
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