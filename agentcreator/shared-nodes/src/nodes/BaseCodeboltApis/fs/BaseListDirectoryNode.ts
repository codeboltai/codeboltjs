import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../utils';

// Base ListDirectory Node - Calls cbfs.listDirectory
export class BaseListDirectoryNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/listdirectory",
    title: "List Directory",
    category: "codebolt/fs",
    description: "Lists directory contents using advanced directory listing tool",
    icon: "📂",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseListDirectoryNode.metadata.title, BaseListDirectoryNode.metadata.type);
    this.title = BaseListDirectoryNode.metadata.title;
    this.size = [220, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for parameters object
    this.addInput("params", "object");

    // Event output for directoryListed
    this.addOutput("directoryListed", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for directory contents
    this.addOutput("contents", "array");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}