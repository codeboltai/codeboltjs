import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitCloneRequestNode - Calls GitCloneRequestNotify
export class BaseGitCloneRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/clone",
    title: "Git Clone Request",
    category: "codebolt/notifications/git",
    description: "Sends a git clone request notification",
    icon: "📋",
    color: "#673AB7"
  };

  constructor() {
    super(BaseGitCloneRequestNode.metadata.title, BaseGitCloneRequestNode.metadata.type);
    this.title = BaseGitCloneRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data input for repository URL
    this.addInput("repoUrl", "string");

    // Optional data input for target path
    this.addInput("targetPath", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}