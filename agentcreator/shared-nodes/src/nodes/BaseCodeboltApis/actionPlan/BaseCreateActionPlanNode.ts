import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CreateActionPlan Node - Calls codebolt.actionPlan.createActionPlan
export class BaseCreateActionPlanNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/createActionPlan",
    title: "Create Action Plan",
    category: "codebolt/actionPlan",
    description: "Creates a new action plan with specified parameters",
    icon: "➕",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseCreateActionPlanNode.metadata.title, BaseCreateActionPlanNode.metadata.type);
    this.title = BaseCreateActionPlanNode.metadata.title;
    this.size = [240, 180];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for action plan creation
    this.addInput("name", "string");
    this.addInput("description", "string");
    this.addInput("agentId", "string");
    this.addInput("agentName", "string");
    this.addInput("status", "string");
    this.addInput("planId", "string");

    // Event output for plan creation completion
    this.addOutput("planCreated", LiteGraph.EVENT);

    // Output for created action plan object
    this.addOutput("actionPlan", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Set default values
    this.properties = {
      name: "",
      description: "",
      agentId: "",
      agentName: "",
      status: "pending",
      planId: ""
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}