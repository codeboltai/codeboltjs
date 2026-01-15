import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base UpdateProjectState Node - Calls codebolt.state.updateProjectState
export class BaseUpdateProjectStateNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/state/updateProjectState",
    title: "Update Project State",
    category: "codebolt/state",
    description: "Updates the project state on the server with a key-value pair",
    icon: "✏️",
    color: "#607D8B"
  };

  constructor() {
    super(BaseUpdateProjectStateNode.metadata.title, BaseUpdateProjectStateNode.metadata.type);
    this.title = BaseUpdateProjectStateNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for key-value pair
    this.addInput("key", "string");
    this.addInput("value", "object"); // Can be any type

    // Event output for state update completion
    this.addOutput("stateUpdated", LiteGraph.EVENT);

    // Output for update response
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}