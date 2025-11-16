import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base EditFileAndApplyDiff Node - Calls cbutils.editFileAndApplyDiff
export class BaseEditFileAndApplyDiffNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/utils/editfileandapplydiff",
    title: "Edit File And Apply Diff",
    category: "codebolt/utils",
    description: "Edits a file and applies a diff with AI assistance using cbutils.editFileAndApplyDiff",
    icon: "✏️",
    color: "#FF5722"
  };

  constructor() {
    super(BaseEditFileAndApplyDiffNode.metadata.title, BaseEditFileAndApplyDiffNode.metadata.type);
    this.title = BaseEditFileAndApplyDiffNode.metadata.title;
    this.size = [260, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("filePath", "string");
    this.addInput("diff", "string");
    this.addInput("diffIdentifier", "string");
    this.addInput("prompt", "string");
    this.addInput("applyModel", "string");

    // Event output for diffApplied
    this.addOutput("diffApplied", LiteGraph.EVENT);

    // Output for edit response
    this.addOutput("result", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
