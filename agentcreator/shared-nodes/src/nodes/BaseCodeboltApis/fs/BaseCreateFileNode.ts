import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../utils';

// Base CreateFile Node - Calls cbfs.createFile
export class BaseCreateFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/createfile",
    title: "Create File",
    category: "codebolt/fs",
    description: "Creates a new file using cbfs.createFile",
    icon: "📄",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseCreateFileNode.metadata.title, BaseCreateFileNode.metadata.type);
    this.title = BaseCreateFileNode.metadata.title;
    this.size = [220, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for file creation
    this.addInput("fileName", "string");
    this.addInput("source", "string");
    this.addInput("filePath", "string");

    // Event output for fileCreated
    this.addOutput("fileCreated", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}