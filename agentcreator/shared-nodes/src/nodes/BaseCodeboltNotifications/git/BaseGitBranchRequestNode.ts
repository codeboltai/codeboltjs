import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitBranchRequestNode - Calls GitBranchRequestNotify
export class BaseGitBranchRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/branch",
    title: "Git Branch Request",
    category: "codebolt/notifications/git",
    description: "Sends a git branch request notification",
    icon: "🌳",
    color: "#3F51B5"
  };

  constructor() {
    super(BaseGitBranchRequestNode.metadata.title, BaseGitBranchRequestNode.metadata.type);
    this.title = BaseGitBranchRequestNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data input for the path
    this.addInput("path", "string");

    // Optional data input for branch name
    this.addInput("branchName", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}