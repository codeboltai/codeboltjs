import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddTaskToActionPlan Node - Calls codebolt.actionPlan.addTaskToActionPlan
export class BaseAddTaskToActionPlanNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/addTaskToActionPlan",
    title: "Add Task to Action Plan",
    category: "codebolt/actionPlan",
    description: "Adds a new task to an existing action plan",
    icon: "📝",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseAddTaskToActionPlanNode.metadata.title, BaseAddTaskToActionPlanNode.metadata.type);
    this.title = BaseAddTaskToActionPlanNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for task addition
    this.addInput("planId", "string");
    this.addInput("task", "object"); // Task object with name, description, priority, taskType, etc.

    // Alternative individual task inputs for easier connection
    this.addInput("taskName", "string");
    this.addInput("taskDescription", "string");
    this.addInput("taskPriority", "string");
    this.addInput("taskType", "string");

    // Event output for task addition completion
    this.addOutput("taskAdded", LiteGraph.EVENT);

    // Output for added task and updated action plan
    this.addOutput("result", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}