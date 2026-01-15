import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitStatusRequestNode - Calls GitStatusRequestNotify
export class BaseGitStatusRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/status",
    title: "Git Status Request",
    category: "codebolt/notifications/git",
    description: "Sends a git status request notification",
    icon: "📋",
    color: "#FF9800"
  };

  constructor() {
    super(BaseGitStatusRequestNode.metadata.title, BaseGitStatusRequestNode.metadata.type);
    this.title = BaseGitStatusRequestNode.metadata.title;
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