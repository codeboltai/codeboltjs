import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTaskDependencyChain Node - Calls codebolt.task.getTaskDependencyChain
export class BaseGetTaskDependencyChainNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettaskdependencychain",
    title: "Get Task Dependency Chain",
    category: "codebolt/task",
    description: "Gets the dependency chain for a task using codebolt.task.getTaskDependencyChain",
    icon: "⛓️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTaskDependencyChainNode.metadata.title, BaseGetTaskDependencyChainNode.metadata.type);
    this.title = BaseGetTaskDependencyChainNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for dependencyChainRetrieved
    this.addOutput("dependencyChainRetrieved", LiteGraph.EVENT);

    // Output for dependency chain array
    this.addOutput("chain", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}