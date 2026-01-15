import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetApplicationState Node - Calls codebolt.state.getApplicationState
export class BaseGetApplicationStateNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/state/getApplicationState",
    title: "Get Application State",
    category: "codebolt/state",
    description: "Retrieves the current application state from the server",
    icon: "🌐",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGetApplicationStateNode.metadata.title, BaseGetApplicationStateNode.metadata.type);
    this.title = BaseGetApplicationStateNode.metadata.title;
    this.size = [240, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for state retrieval completion
    this.addOutput("stateRetrieved", LiteGraph.EVENT);

    // Output for application state
    this.addOutput("applicationState", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}