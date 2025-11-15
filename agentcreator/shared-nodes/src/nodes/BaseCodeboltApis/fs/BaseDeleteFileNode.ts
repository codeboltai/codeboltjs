import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../utils';

// Base DeleteFile Node - Calls cbfs.deleteFile
export class BaseDeleteFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/deletefile",
    title: "Delete File",
    category: "codebolt/fs",
    description: "Deletes a file using cbfs.deleteFile",
    icon: "🗑️",
    color: "#F44336"
  };

  constructor() {
    super(BaseDeleteFileNode.metadata.title, BaseDeleteFileNode.metadata.type);
    this.title = BaseDeleteFileNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for file deletion
    this.addInput("filename", "string");
    this.addInput("filePath", "string");

    // Event output for fileDeleted
    this.addOutput("fileDeleted", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}