import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GitLogsRequestNode - Calls GitLogsRequestNotify
export class BaseGitLogsRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/git/request/logs",
    title: "Git Logs Request",
    category: "codebolt/notifications/git",
    description: "Sends a git logs request notification",
    icon: "📜",
    color: "#607D8B"
  };

  constructor() {
    super(BaseGitLogsRequestNode.metadata.title, BaseGitLogsRequestNode.metadata.type);
    this.title = BaseGitLogsRequestNode.metadata.title;
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