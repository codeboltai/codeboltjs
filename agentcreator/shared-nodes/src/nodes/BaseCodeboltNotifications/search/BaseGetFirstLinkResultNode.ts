import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetFirstLinkResult Node - Calls search.GetFirstLinkResultNotify
export class BaseGetFirstLinkResultNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/search/getfirstlinkresult",
    title: "Get First Link Result",
    category: "codebolt/notifications/search",
    description: "Sends a get first link result notification",
    icon: "🔗",
    color: "#FF9800"
  };

  constructor() {
    super(BaseGetFirstLinkResultNode.metadata.title, BaseGetFirstLinkResultNode.metadata.type);
    this.title = BaseGetFirstLinkResultNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on GetFirstLinkResultNotify parameters
    this.addInput("content", "object");
    this.addInput("isError", "boolean");
    this.addInput("toolUseId", "string");

    // Event output for response sent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}