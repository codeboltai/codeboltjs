import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ReadFile Node - Calls cbfs.readFile
export class BaseReadFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/readfile",
    title: "Read File",
    category: "codebolt/fs",
    description: "Reads the content of a file using cbfs.readFile",
    icon: "📖",
    color: "#2196F3"
  };

  constructor() {
    super(BaseReadFileNode.metadata.title, BaseReadFileNode.metadata.type);
    this.title = BaseReadFileNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for file path
    this.addInput("filePath", "string");

    // Event output for fileRead
    this.addOutput("fileRead", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for file content
    this.addOutput("content", "string");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}