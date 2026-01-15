import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base QueryVectorItems Node - Calls VectorDB.queryVectorItems
export class BaseQueryVectorItemsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/vectordb/queryvectoritems",
    title: "Query Vector Items",
    category: "codebolt/vectordb",
    description: "Queries multiple vector items from the vector database using VectorDB.queryVectorItems",
    icon: "🔍",
    color: "#2196F3"
  };

  constructor() {
    super(BaseQueryVectorItemsNode.metadata.title, BaseQueryVectorItemsNode.metadata.type);
    this.title = BaseQueryVectorItemsNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("items", "array");
    this.addInput("dbPath", "string");

    // Event output for itemsQueried
    this.addOutput("itemsQueried", LiteGraph.EVENT);

    // Output for queried items array
    this.addOutput("items", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}