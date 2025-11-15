import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../utils';

// Base UpdateFile Node - Calls cbfs.updateFile
export class BaseUpdateFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/updatefile",
    title: "Update File",
    category: "codebolt/fs",
    description: "Updates the content of a file using cbfs.updateFile",
    icon: "✏️",
    color: "#FF9800"
  };

  constructor() {
    super(BaseUpdateFileNode.metadata.title, BaseUpdateFileNode.metadata.type);
    this.title = BaseUpdateFileNode.metadata.title;
    this.size = [220, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for file update
    this.addInput("filename", "string");
    this.addInput("filePath", "string");
    this.addInput("newContent", "string");

    // Event output for fileUpdated
    this.addOutput("fileUpdated", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}