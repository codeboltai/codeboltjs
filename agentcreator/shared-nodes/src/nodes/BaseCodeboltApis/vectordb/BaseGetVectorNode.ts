import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetVector Node - Calls VectorDB.getVector
export class BaseGetVectorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/vectordb/getvector",
    title: "Get Vector",
    category: "codebolt/vectordb",
    description: "Retrieves a vector from the vector database using VectorDB.getVector",
    icon: "🔍",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGetVectorNode.metadata.title, BaseGetVectorNode.metadata.type);
    this.title = BaseGetVectorNode.metadata.title;
    this.size = [220, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for vector key
    this.addInput("key", "string");

    // Event output for vectorRetrieved
    this.addOutput("vectorRetrieved", LiteGraph.EVENT);

    // Output for vector data
    this.addOutput("vector", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}