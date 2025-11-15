import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../utils';

// Base ReadManyFiles Node - Calls cbfs.readManyFiles
export class BaseReadManyFilesNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/readmanyfiles",
    title: "Read Many Files",
    category: "codebolt/fs",
    description: "Reads multiple files based on paths, patterns, or glob expressions",
    icon: "📚",
    color: "#2196F3"
  };

  constructor() {
    super(BaseReadManyFilesNode.metadata.title, BaseReadManyFilesNode.metadata.type);
    this.title = BaseReadManyFilesNode.metadata.title;
    this.size = [220, 200];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for parameters object
    this.addInput("params", "object");

    // Event output for filesRead
    this.addOutput("filesRead", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for files data
    this.addOutput("filesData", "array");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}