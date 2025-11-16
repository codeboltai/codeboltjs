import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitCommitRequestNode - Calls GitCommitRequestNotify
export class BaseGitCommitRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/commit",
    title: "Git Commit Request",
    category: "codebolt/notifications/git",
    description: "Sends a git commit request notification",
    icon: "💾",
    color: "#795548"
  };

  constructor() {
    super(BaseGitCommitRequestNode.metadata.title, BaseGitCommitRequestNode.metadata.type);
    this.title = BaseGitCommitRequestNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data input for the path
    this.addInput("path", "string");

    // Optional data input for commit message
    this.addInput("message", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}