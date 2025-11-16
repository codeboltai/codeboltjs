import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetFirstLinkRequest Node - Calls search.GetFirstLinkRequestNotify
export class BaseGetFirstLinkRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/search/getfirstlinkrequest",
    title: "Get First Link Request",
    category: "codebolt/notifications/search",
    description: "Sends a get first link request notification",
    icon: "🔗",
    color: "#009688"
  };

  constructor() {
    super(BaseGetFirstLinkRequestNode.metadata.title, BaseGetFirstLinkRequestNode.metadata.type);
    this.title = BaseGetFirstLinkRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on GetFirstLinkRequestNotify parameters
    this.addInput("query", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}