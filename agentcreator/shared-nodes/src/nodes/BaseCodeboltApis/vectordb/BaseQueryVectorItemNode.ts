import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base QueryVectorItem Node - Calls VectorDB.queryVectorItem
export class BaseQueryVectorItemNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/vectordb/queryvectoritem",
    title: "Query Vector Item",
    category: "codebolt/vectordb",
    description: "Queries a vector item from the vector database using VectorDB.queryVectorItem",
    icon: "🔎",
    color: "#2196F3"
  };

  constructor() {
    super(BaseQueryVectorItemNode.metadata.title, BaseQueryVectorItemNode.metadata.type);
    this.title = BaseQueryVectorItemNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for query key
    this.addInput("key", "string");

    // Event output for itemQueried
    this.addOutput("itemQueried", LiteGraph.EVENT);

    // Output for queried item data
    this.addOutput("item", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}