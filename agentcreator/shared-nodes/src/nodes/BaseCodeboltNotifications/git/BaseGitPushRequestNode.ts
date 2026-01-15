import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitPushRequestNode - Calls GitPushRequestNotify
export class BaseGitPushRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/push",
    title: "Git Push Request",
    category: "codebolt/notifications/git",
    description: "Sends a git push request notification",
    icon: "📤",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGitPushRequestNode.metadata.title, BaseGitPushRequestNode.metadata.type);
    this.title = BaseGitPushRequestNode.metadata.title;
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