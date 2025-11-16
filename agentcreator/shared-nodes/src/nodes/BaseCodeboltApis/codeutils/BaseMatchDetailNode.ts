import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base MatchDetail Node - Calls codebolt.codeutils.matchDetail
export class BaseMatchDetailNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/codeutils/matchDetail",
    title: "Get Match Detail",
    category: "codebolt/codeutils",
    description: "Retrieves details of a specific matcher",
    icon: "🔍",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMatchDetailNode.metadata.title, BaseMatchDetailNode.metadata.type);
    this.title = BaseMatchDetailNode.metadata.title;
    this.size = [180, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for matcher identifier
    this.addInput("matcher", "string");

    // Event output for match detail retrieval completion
    this.addOutput("matchDetailRetrieved", LiteGraph.EVENT);

    // Output for match detail response
    this.addOutput("matchDetail", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}