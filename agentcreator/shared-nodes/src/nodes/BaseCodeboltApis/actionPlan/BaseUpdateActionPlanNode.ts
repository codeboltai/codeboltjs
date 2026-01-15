import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base UpdateActionPlan Node - Calls codebolt.actionPlan.updateActionPlan
export class BaseUpdateActionPlanNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/updateActionPlan",
    title: "Update Action Plan",
    category: "codebolt/actionPlan",
    description: "Updates an existing action plan with new data",
    icon: "✏️",
    color: "#FF9800"
  };

  constructor() {
    super(BaseUpdateActionPlanNode.metadata.title, BaseUpdateActionPlanNode.metadata.type);
    this.title = BaseUpdateActionPlanNode.metadata.title;
    this.size = [200, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for action plan update
    this.addInput("planId", "string");
    this.addInput("updateData", "object"); // Object containing fields to update

    // Event output for plan update completion
    this.addOutput("planUpdated", LiteGraph.EVENT);

    // Output for updated action plan object
    this.addOutput("actionPlan", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}