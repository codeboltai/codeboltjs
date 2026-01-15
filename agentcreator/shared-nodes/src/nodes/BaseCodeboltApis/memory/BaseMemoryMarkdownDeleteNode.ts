import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryMarkdownDeleteNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/markdown/delete",
    title: "Memory Markdown Delete",
    category: "codebolt/memory/markdown",
    description: "Delete markdown memory entry",
    icon: "🗑️",
    color: "#42A5F5"
  };

  constructor() {
    super(BaseMemoryMarkdownDeleteNode.metadata, [320, 160]);
    this.addProperty("memoryId", "", "string");
    this.addInput("memoryId", "string");
  }
}
