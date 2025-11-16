import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SearchInitRequest Node - Calls search.SearchInitRequestNotify
export class BaseSearchInitRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/search/searchinitrequest",
    title: "Search Init Request",
    category: "codebolt/notifications/search",
    description: "Sends a search engine initialization request notification",
    icon: "🔧",
    color: "#009688"
  };

  constructor() {
    super(BaseSearchInitRequestNode.metadata.title, BaseSearchInitRequestNode.metadata.type);
    this.title = BaseSearchInitRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on SearchInitRequestNotify parameters
    this.addInput("engine", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}