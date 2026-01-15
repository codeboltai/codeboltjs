import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitInitRequestNode - Calls GitInitRequestNotify
export class BaseGitInitRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/init",
    title: "Git Init Request",
    category: "codebolt/notifications/git",
    description: "Sends a git init request notification",
    icon: "🔄",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGitInitRequestNode.metadata.title, BaseGitInitRequestNode.metadata.type);
    this.title = BaseGitInitRequestNode.metadata.title;
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