import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitDiffRequestNode - Calls GitDiffRequestNotify
export class BaseGitDiffRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/diff",
    title: "Git Diff Request",
    category: "codebolt/notifications/git",
    description: "Sends a git diff request notification",
    icon: "⚖️",
    color: "#FF5722"
  };

  constructor() {
    super(BaseGitDiffRequestNode.metadata.title, BaseGitDiffRequestNode.metadata.type);
    this.title = BaseGitDiffRequestNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data input for the path
    this.addInput("path", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}