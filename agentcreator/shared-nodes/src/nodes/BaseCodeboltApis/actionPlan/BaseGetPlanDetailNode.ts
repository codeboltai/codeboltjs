import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetPlanDetail Node - Calls codebolt.actionPlan.getPlanDetail
export class BaseGetPlanDetailNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/getPlanDetail",
    title: "Get Plan Detail",
    category: "codebolt/actionPlan",
    description: "Gets action plan detail by ID",
    icon: "🔍",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGetPlanDetailNode.metadata.title, BaseGetPlanDetailNode.metadata.type);
    this.title = BaseGetPlanDetailNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for plan ID
    this.addInput("planId", "string");

    // Event output for plan detail retrieval completion
    this.addOutput("planDetailRetrieved", LiteGraph.EVENT);

    // Output for plan detail object
    this.addOutput("planDetail", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}