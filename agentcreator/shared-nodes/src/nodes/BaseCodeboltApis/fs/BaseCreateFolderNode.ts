import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../utils';

// Base CreateFolder Node - Calls cbfs.createFolder
export class BaseCreateFolderNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/createfolder",
    title: "Create Folder",
    category: "codebolt/fs",
    description: "Creates a new folder using cbfs.createFolder",
    icon: "📁",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseCreateFolderNode.metadata.title, BaseCreateFolderNode.metadata.type);
    this.title = BaseCreateFolderNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for folder creation
    this.addInput("folderName", "string");
    this.addInput("folderPath", "string");

    // Event output for folderCreated
    this.addOutput("folderCreated", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}