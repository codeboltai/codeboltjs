import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../utils';

// Base DeleteFolder Node - Calls cbfs.deleteFolder
export class BaseDeleteFolderNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/deletefolder",
    title: "Delete Folder",
    category: "codebolt/fs",
    description: "Deletes a folder using cbfs.deleteFolder",
    icon: "🗂️",
    color: "#F44336"
  };

  constructor() {
    super(BaseDeleteFolderNode.metadata.title, BaseDeleteFolderNode.metadata.type);
    this.title = BaseDeleteFolderNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for folder deletion
    this.addInput("foldername", "string");
    this.addInput("folderpath", "string");

    // Event output for folderDeleted
    this.addOutput("folderDeleted", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}