import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetContent Node - Calls codebolt.browser.getContent
export class BaseGetContentNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/getContent",
    title: "Get Page Content",
    category: "codebolt/browser",
    description: "Retrieves the content of the current page",
    icon: "📃",
    color: "#009688"
  };

  constructor() {
    super(BaseGetContentNode.metadata.title, BaseGetContentNode.metadata.type);
    this.title = BaseGetContentNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for content retrieval completion
    this.addOutput("contentRetrieved", LiteGraph.EVENT);

    // Output for page content
    this.addOutput("content", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}