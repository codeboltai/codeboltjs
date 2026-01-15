import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTaskStats Node - Calls codebolt.task.getTaskStats
export class BaseGetTaskStatsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettaskstats",
    title: "Get Task Stats",
    category: "codebolt/task",
    description: "Gets task statistics using codebolt.task.getTaskStats",
    icon: "📊",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTaskStatsNode.metadata.title, BaseGetTaskStatsNode.metadata.type);
    this.title = BaseGetTaskStatsNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data inputs for filtering
    this.addInput("threadId", "string");
    this.addInput("timeRange", "string");

    // Event output for statsRetrieved
    this.addOutput("statsRetrieved", LiteGraph.EVENT);

    // Output for stats object
    this.addOutput("stats", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}