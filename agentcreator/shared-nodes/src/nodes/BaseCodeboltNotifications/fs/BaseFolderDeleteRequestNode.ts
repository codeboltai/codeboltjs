import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base FolderDeleteRequest Node - Calls fs.FolderDeleteRequestNotify
export class BaseFolderDeleteRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/fs/request/folderdelete",
    title: "Folder Delete Request",
    category: "codebolt/notifications/fs",
    description: "Sends a folder delete request notification",
    icon: "🗂️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseFolderDeleteRequestNode.metadata.title, BaseFolderDeleteRequestNode.metadata.type);
    this.title = BaseFolderDeleteRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on FolderDeleteRequestNotify parameters
    this.addInput("folderName", "string");
    this.addInput("folderPath", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}