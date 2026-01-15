import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddVectorItem Node - Calls VectorDB.addVectorItem
export class BaseAddVectorItemNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/vectordb/addvectoritem",
    title: "Add Vector Item",
    category: "codebolt/vectordb",
    description: "Adds a new vector item to the vector database using VectorDB.addVectorItem",
    icon: "➕",
    color: "#2196F3"
  };

  constructor() {
    super(BaseAddVectorItemNode.metadata.title, BaseAddVectorItemNode.metadata.type);
    this.title = BaseAddVectorItemNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for vector item
    this.addInput("item", 0 as any); // Can be any type

    // Event output for itemAdded
    this.addOutput("itemAdded", LiteGraph.EVENT);

    // Output for added item data
    this.addOutput("item", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}