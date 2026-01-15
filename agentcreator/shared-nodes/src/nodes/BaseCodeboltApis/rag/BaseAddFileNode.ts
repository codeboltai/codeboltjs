import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

export class BaseAddFileNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/rag/addFile",
    title: "RAG: Add File",
    category: "codebolt/rag",
    description: "Adds a file to the RAG knowledge base",
    icon: "📄",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseAddFileNode.metadata.title, BaseAddFileNode.metadata.type);
    this.title = BaseAddFileNode.metadata.title;
    this.size = [320, 180];
    
    // Common inputs/outputs
    this.addInput('onTrigger', LiteGraph.ACTION);
    this.addOutput('completed', LiteGraph.EVENT);
    this.addOutput('response', 'object');
    this.addOutput('success', 'boolean');
    this.mode = LiteGraph.ON_TRIGGER;
    
    // Node-specific inputs
    this.addInput("filename", "string");
    this.addInput("filePath", "string");
    
    // Properties
    this.addProperty("filename", "", "string");
    this.addProperty("filePath", "", "string");
  }
}
