import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitAddRequestNode - Calls GitAddRequestNotify
export class BaseGitAddRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/add",
    title: "Git Add Request",
    category: "codebolt/notifications/git",
    description: "Sends a git add request notification",
    icon: "➕",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGitAddRequestNode.metadata.title, BaseGitAddRequestNode.metadata.type);
    this.title = BaseGitAddRequestNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data input for the path
    this.addInput("path", "string");

    // Optional data input for files array
    this.addInput("files", "array");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}