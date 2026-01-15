import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetMatcherList Node - Calls codebolt.codeutils.getMatcherList
export class BaseGetMatcherListNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/codeutils/getMatcherList",
    title: "Get Matcher List",
    category: "codebolt/codeutils",
    description: "Retrieves the list of available matchers",
    icon: "📋",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGetMatcherListNode.metadata.title, BaseGetMatcherListNode.metadata.type);
    this.title = BaseGetMatcherListNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for matcher list retrieval completion
    this.addOutput("matcherListRetrieved", LiteGraph.EVENT);

    // Output for matcher list tree response
    this.addOutput("matcherList", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}