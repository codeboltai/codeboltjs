import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitRemoteAddRequestNode - Calls GitRemoteAddRequestNotify
export class BaseGitRemoteAddRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/remoteadd",
    title: "Git Remote Add Request",
    category: "codebolt/notifications/git",
    description: "Sends a git remote add request notification",
    icon: "🔗",
    color: "#E91E63"
  };

  constructor() {
    super(BaseGitRemoteAddRequestNode.metadata.title, BaseGitRemoteAddRequestNode.metadata.type);
    this.title = BaseGitRemoteAddRequestNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data input for remote name
    this.addInput("remoteName", "string");

    // Required data input for remote URL
    this.addInput("remoteUrl", "string");

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