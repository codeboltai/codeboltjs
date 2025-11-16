import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetMemoryRequestNode - Calls GetMemoryRequestNotify
export class BaseGetMemoryRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/dbmemory/request/getmemory",
    title: "Get Memory Request",
    category: "codebolt/notifications/dbmemory",
    description: "Sends a request to retrieve knowledge from database memory",
    icon: "🔍",
    color: "#FF9800"
  };

  constructor() {
    super(BaseGetMemoryRequestNode.metadata.title, BaseGetMemoryRequestNode.metadata.type);
    this.title = BaseGetMemoryRequestNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data input
    this.addInput("key", "string");

    // Optional data input
    this.addInput("toolUseId", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}