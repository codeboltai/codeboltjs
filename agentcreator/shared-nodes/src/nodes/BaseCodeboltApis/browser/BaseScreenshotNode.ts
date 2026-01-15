import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Screenshot Node - Calls codebolt.browser.screenshot
export class BaseScreenshotNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/screenshot",
    title: "Take Screenshot",
    category: "codebolt/browser",
    description: "Takes a screenshot of the current page",
    icon: "📸",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseScreenshotNode.metadata.title, BaseScreenshotNode.metadata.type);
    this.title = BaseScreenshotNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for screenshot completion
    this.addOutput("screenshotTaken", LiteGraph.EVENT);

    // Output for screenshot response (contains image data)
    this.addOutput("screenshot", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}