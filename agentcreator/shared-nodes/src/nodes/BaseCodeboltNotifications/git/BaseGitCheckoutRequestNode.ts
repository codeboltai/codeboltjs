import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitCheckoutRequestNode - Calls GitCheckoutRequestNotify
export class BaseGitCheckoutRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/checkout",
    title: "Git Checkout Request",
    category: "codebolt/notifications/git",
    description: "Sends a git checkout request notification",
    icon: "🌿",
    color: "#009688"
  };

  constructor() {
    super(BaseGitCheckoutRequestNode.metadata.title, BaseGitCheckoutRequestNode.metadata.type);
    this.title = BaseGitCheckoutRequestNode.metadata.title;
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