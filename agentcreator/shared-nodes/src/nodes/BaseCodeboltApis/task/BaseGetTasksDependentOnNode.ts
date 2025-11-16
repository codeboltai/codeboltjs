import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTasksDependentOn Node - Calls codebolt.task.getTasksDependentOn
export class BaseGetTasksDependentOnNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettasksdependenton",
    title: "Get Tasks Dependent On",
    category: "codebolt/task",
    description: "Gets tasks that depend on a specific task using codebolt.task.getTasksDependentOn",
    icon: "🔗",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTasksDependentOnNode.metadata.title, BaseGetTasksDependentOnNode.metadata.type);
    this.title = BaseGetTasksDependentOnNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for dependentTasksRetrieved
    this.addOutput("dependentTasksRetrieved", LiteGraph.EVENT);

    // Output for dependent tasks array
    this.addOutput("tasks", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}