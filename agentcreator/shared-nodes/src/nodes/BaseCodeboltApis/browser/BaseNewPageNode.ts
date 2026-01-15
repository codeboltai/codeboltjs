import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base NewPage Node - Calls codebolt.browser.newPage
export class BaseNewPageNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/newPage",
    title: "New Browser Page",
    category: "codebolt/browser",
    description: "Opens a new page in the browser",
    icon: "🌐",
    color: "#2196F3"
  };

  constructor() {
    super(BaseNewPageNode.metadata.title, BaseNewPageNode.metadata.type);
    this.title = BaseNewPageNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for page creation completion
    this.addOutput("pageCreated", LiteGraph.EVENT);

    // Output for response data
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}