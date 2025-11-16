import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ListDirectoryRequest Node - Calls fs.ListDirectoryRequestNotify
export class BaseListDirectoryRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/listdirectory",
    title: "List Directory Request",
    category: "codebolt/notifications/fs",
    description: "Sends a directory listing request notification",
    icon: "📋",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseListDirectoryRequestNode.metadata.title, BaseListDirectoryRequestNode.metadata.type);
    this.title = BaseListDirectoryRequestNode.metadata.title;
    this.size = [240, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on ListDirectoryRequestNotify parameters
    this.addInput("dirPath", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}