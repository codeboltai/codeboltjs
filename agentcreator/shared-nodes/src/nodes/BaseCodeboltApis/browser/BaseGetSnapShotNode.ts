import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetSnapShot Node - Calls codebolt.browser.getSnapShot
export class BaseGetSnapShotNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/browser/getSnapShot",
    title: "Get Page Snapshot",
    category: "codebolt/browser",
    description: "Retrieves the snapshot of the current page",
    icon: "📷",
    color: "#E91E63"
  };

  constructor() {
    super(BaseGetSnapShotNode.metadata.title, BaseGetSnapShotNode.metadata.type);
    this.title = BaseGetSnapShotNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for snapshot retrieval completion
    this.addOutput("snapshotRetrieved", LiteGraph.EVENT);

    // Output for page snapshot
    this.addOutput("snapshot", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}