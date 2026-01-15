import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetAllPlans Node - Calls codebolt.actionPlan.getAllPlans
export class BaseGetAllPlansNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/getAllPlans",
    title: "Get All Action Plans",
    category: "codebolt/actionPlan",
    description: "Gets all action plans from the system",
    icon: "📋",
    color: "#FF9800"
  };

  constructor() {
    super(BaseGetAllPlansNode.metadata.title, BaseGetAllPlansNode.metadata.type);
    this.title = BaseGetAllPlansNode.metadata.title;
    this.size = [220, 80];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Event output for plans retrieval completion
    this.addOutput("plansRetrieved", LiteGraph.EVENT);

    // Output for all plans array
    this.addOutput("plans", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}