import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddMemoryRequestNode - Calls AddMemoryRequestNotify
export class BaseAddMemoryRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/dbmemory/request/addmemory",
    title: "Add Memory Request",
    category: "codebolt/notifications/dbmemory",
    description: "Sends a request to add knowledge to database memory",
    icon: "🧠",
    color: "#FF9800"
  };

  constructor() {
    super(BaseAddMemoryRequestNode.metadata.title, BaseAddMemoryRequestNode.metadata.type);
    this.title = BaseAddMemoryRequestNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data inputs
    this.addInput("key", "string");
    this.addInput("value", 0 as any); // Universal type for any data type

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