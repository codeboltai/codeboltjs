import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetAttachedMemoryForTask Node - Calls codebolt.task.getAttachedMemoryForTask
export class BaseGetAttachedMemoryForTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/getattachedmemoryfortask",
    title: "Get Attached Memory For Task",
    category: "codebolt/task",
    description: "Gets attached memory for a task using codebolt.task.getAttachedMemoryForTask",
    icon: "📂",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetAttachedMemoryForTaskNode.metadata.title, BaseGetAttachedMemoryForTaskNode.metadata.type);
    this.title = BaseGetAttachedMemoryForTaskNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for memoryRetrieved
    this.addOutput("memoryRetrieved", LiteGraph.EVENT);

    // Output for memory array
    this.addOutput("memory", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}