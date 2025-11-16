import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryMarkdownSaveNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/markdown/save",
    title: "Memory Markdown Save",
    category: "codebolt/memory/markdown",
    description: "Save markdown content into memory",
    icon: "📄",
    color: "#42A5F5"
  };

  constructor() {
    super(BaseMemoryMarkdownSaveNode.metadata, [380, 220]);
    this.addProperty("markdown", "", "string");
    this.addProperty("metadata", "{}", "string");
    this.addInput("markdown", "string");
    this.addInput("metadata", "object");
  }
}
