import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FileCreateResponse Node - Calls fs.FileCreateResponseNotify
export class BaseFileCreateResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/response/filecreate",
    title: "File Create Response",
    category: "codebolt/notifications/fs",
    description: "Sends a file creation response notification",
    icon: "✅",
    color: "#FF9800"
  };

  constructor() {
    super(BaseFileCreateResponseNode.metadata.title, BaseFileCreateResponseNode.metadata.type);
    this.title = BaseFileCreateResponseNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FileCreateResponseNotify parameters
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