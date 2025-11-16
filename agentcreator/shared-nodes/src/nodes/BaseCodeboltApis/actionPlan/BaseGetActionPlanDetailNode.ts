import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetActionPlanDetail Node - Calls codebolt.actionPlan.getActionPlanDetail
export class BaseGetActionPlanDetailNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/getActionPlanDetail",
    title: "Get Action Plan Detail",
    category: "codebolt/actionPlan",
    description: "Gets action plan detail by ID (alternative method)",
    icon: "📝",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGetActionPlanDetailNode.metadata.title, BaseGetActionPlanDetailNode.metadata.type);
    this.title = BaseGetActionPlanDetailNode.metadata.title;
    this.size = [240, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for plan ID
    this.addInput("planId", "string");

    // Event output for action plan detail retrieval completion
    this.addOutput("actionPlanDetailRetrieved", LiteGraph.EVENT);

    // Output for action plan detail object
    this.addOutput("actionPlanDetail", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}