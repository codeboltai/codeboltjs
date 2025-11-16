import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileEditResponse Node - Calls fs.FileEditResponseNotify
export class BaseFileEditResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/response/fileedit",
    title: "File Edit Response",
    category: "codebolt/notifications/fs",
    description: "Sends a file edit response notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseFileEditResponseNode.metadata.title, BaseFileEditResponseNode.metadata.type);
    this.title = BaseFileEditResponseNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileEditResponseNotify parameters
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