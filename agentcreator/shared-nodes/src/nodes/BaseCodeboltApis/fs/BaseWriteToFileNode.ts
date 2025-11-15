import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base WriteToFile Node - Calls cbfs.writeToFile
export class BaseWriteToFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/writetofile",
    title: "Write To File",
    category: "codebolt/fs",
    description: "Writes content to a file using cbfs.writeToFile",
    icon: "✍️",
    color: "#FF9800"
  };

  constructor() {
    super(BaseWriteToFileNode.metadata.title, BaseWriteToFileNode.metadata.type);
    this.title = BaseWriteToFileNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for writing to file
    this.addInput("relPath", "string");
    this.addInput("newContent", "string");

    // Event output for fileWritten
    this.addOutput("fileWritten", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}