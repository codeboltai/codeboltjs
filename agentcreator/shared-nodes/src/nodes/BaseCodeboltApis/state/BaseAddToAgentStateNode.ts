import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddToAgentState Node - Calls codebolt.state.addToAgentState
export class BaseAddToAgentStateNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/state/addToAgentState",
    title: "Add to Agent State",
    category: "codebolt/state",
    description: "Adds a key-value pair to the agent's state on the server",
    icon: "➕",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseAddToAgentStateNode.metadata.title, BaseAddToAgentStateNode.metadata.type);
    this.title = BaseAddToAgentStateNode.metadata.title;
    this.size = [200, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for key-value pair
    this.addInput("key", "string");
    this.addInput("value", "string");

    // Event output for state addition completion
    this.addOutput("stateAdded", LiteGraph.EVENT);

    // Output for addition response
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}