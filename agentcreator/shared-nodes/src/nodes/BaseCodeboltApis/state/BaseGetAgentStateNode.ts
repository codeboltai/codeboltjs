import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetAgentState Node - Calls codebolt.state.getAgentState
export class BaseGetAgentStateNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/state/getAgentState",
    title: "Get Agent State",
    category: "codebolt/state",
    description: "Retrieves the current state of the agent from the server",
    icon: "🤖",
    color: "#FF9800"
  };

  constructor() {
    super(BaseGetAgentStateNode.metadata.title, BaseGetAgentStateNode.metadata.type);
    this.title = BaseGetAgentStateNode.metadata.title;
    this.size = [200, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for state retrieval completion
    this.addOutput("agentStateRetrieved", LiteGraph.EVENT);

    // Output for agent state
    this.addOutput("agentState", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}