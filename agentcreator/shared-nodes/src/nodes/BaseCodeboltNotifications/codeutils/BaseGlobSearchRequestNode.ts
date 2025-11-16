import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GlobSearchRequestNode - Calls GlobSearchRequestNotify
export class BaseGlobSearchRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/codeutils/request/globsearch",
    title: "Glob Search Request",
    category: "codebolt/notifications/codeutils",
    description: "Sends a glob search request notification for file pattern matching",
    icon: "📁",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGlobSearchRequestNode.metadata.title, BaseGlobSearchRequestNode.metadata.type);
    this.title = BaseGlobSearchRequestNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data input
    this.addInput("pattern", "string");

    // Optional data inputs
    this.addInput("basePath", "string");
    this.addInput("maxDepth", "number");
    this.addInput("includeDirectories", "boolean");
    this.addInput("toolUseId", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}