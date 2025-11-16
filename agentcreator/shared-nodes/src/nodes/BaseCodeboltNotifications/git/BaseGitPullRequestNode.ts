import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitPullRequestNode - Calls GitPullRequestNotify
export class BaseGitPullRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/pull",
    title: "Git Pull Request",
    category: "codebolt/notifications/git",
    description: "Sends a git pull request notification",
    icon: "📥",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGitPullRequestNode.metadata.title, BaseGitPullRequestNode.metadata.type);
    this.title = BaseGitPullRequestNode.metadata.title;
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