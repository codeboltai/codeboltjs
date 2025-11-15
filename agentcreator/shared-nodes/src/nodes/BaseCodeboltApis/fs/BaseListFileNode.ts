import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ListFile Node - Calls cbfs.listFile
export class BaseListFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/listfile",
    title: "List Files",
    category: "codebolt/fs",
    description: "Lists all files using cbfs.listFile",
    icon: "📋",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseListFileNode.metadata.title, BaseListFileNode.metadata.type);
    this.title = BaseListFileNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for file listing
    this.addInput("folderPath", "string");
    this.addInput("isRecursive", "boolean");

    // Event output for filesListed
    this.addOutput("filesListed", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for file list
    this.addOutput("files", "array");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}