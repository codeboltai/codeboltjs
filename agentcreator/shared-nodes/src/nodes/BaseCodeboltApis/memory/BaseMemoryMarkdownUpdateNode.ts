import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryMarkdownUpdateNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/markdown/update",
    title: "Memory Markdown Update",
    category: "codebolt/memory/markdown",
    description: "Update markdown entry in memory",
    icon: "✏️",
    color: "#42A5F5"
  };

  constructor() {
    super(BaseMemoryMarkdownUpdateNode.metadata, [400, 240]);
    this.addProperty("memoryId", "", "string");
    this.addProperty("markdown", "", "string");
    this.addProperty("metadata", "{}", "string");
    this.addInput("memoryId", "string");
    this.addInput("markdown", "string");
    this.addInput("metadata", "object");
  }
}
