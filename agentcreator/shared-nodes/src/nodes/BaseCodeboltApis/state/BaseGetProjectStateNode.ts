import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetProjectState Node - Calls codebolt.state.getProjectState
export class BaseGetProjectStateNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/state/getProjectState",
    title: "Get Project State",
    category: "codebolt/state",
    description: "Retrieves the current project state from the server",
    icon: "📁",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetProjectStateNode.metadata.title, BaseGetProjectStateNode.metadata.type);
    this.title = BaseGetProjectStateNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for state retrieval completion
    this.addOutput("projectStateRetrieved", LiteGraph.EVENT);

    // Output for project state
    this.addOutput("projectState", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}