import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base EditFileWithDiff Node - Calls cbfs.editFileWithDiff
export class BaseEditFileWithDiffNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/fs/editfilewithdiff",
    title: "Edit File With Diff",
    category: "codebolt/fs",
    description: "Edits a file by applying a diff",
    icon: "🔧",
    color: "#FF9800"
  };

  constructor() {
    super(BaseEditFileWithDiffNode.metadata.title, BaseEditFileWithDiffNode.metadata.type);
    this.title = BaseEditFileWithDiffNode.metadata.title;
    this.size = [220, 180];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for file editing with diff
    this.addInput("targetFile", "string");
    this.addInput("codeEdit", "string");
    this.addInput("diffIdentifier", "string");
    this.addInput("prompt", "string");
    this.addInput("applyModel", "string");

    // Event output for fileEdited
    this.addOutput("fileEdited", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}