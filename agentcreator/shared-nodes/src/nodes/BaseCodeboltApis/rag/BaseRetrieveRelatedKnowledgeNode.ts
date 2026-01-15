import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseRetrieveRelatedKnowledgeNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/rag/retrieveRelatedKnowledge",
    title: "RAG: Retrieve Related Knowledge",
    category: "codebolt/rag",
    description: "Retrieves knowledge related to the given query and optional filename",
    icon: "🔍",
    color: "#2196F3"
  };

  constructor() {
    super(BaseRetrieveRelatedKnowledgeNode.metadata.title, BaseRetrieveRelatedKnowledgeNode.metadata.type);
    this.title = BaseRetrieveRelatedKnowledgeNode.metadata.title;
    this.size = [400, 200];
    
    // Common inputs/outputs
    this.addInput('onTrigger', LiteGraph.ACTION);
    this.addOutput('completed', LiteGraph.EVENT);
    this.addOutput('response', 'object');
    this.addOutput('success', 'boolean');
    this.mode = LiteGraph.ON_TRIGGER;
    
    // Node-specific inputs
    this.addInput("query", "string");
    this.addInput("filename", "string");
    
    // Properties
    this.addProperty("query", "", "string");
    this.addProperty("filename", "", "string");
    this.addProperty("maxResults", 5, "number");
  }
}
