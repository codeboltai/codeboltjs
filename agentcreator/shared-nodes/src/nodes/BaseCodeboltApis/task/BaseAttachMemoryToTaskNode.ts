import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AttachMemoryToTask Node - Calls codebolt.task.attachMemoryToTask
export class BaseAttachMemoryToTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/attachmemorytotask",
    title: "Attach Memory To Task",
    category: "codebolt/task",
    description: "Attaches memory to a task using codebolt.task.attachMemoryToTask",
    icon: "🧠",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseAttachMemoryToTaskNode.metadata.title, BaseAttachMemoryToTaskNode.metadata.type);
    this.title = BaseAttachMemoryToTaskNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("taskId", "string");
    this.addInput("memoryId", "string");

    // Event output for memoryAttached
    this.addOutput("memoryAttached", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}