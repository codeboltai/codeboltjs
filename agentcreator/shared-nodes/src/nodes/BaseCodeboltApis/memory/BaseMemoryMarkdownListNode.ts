import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryMarkdownListNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/markdown/list",
    title: "Memory Markdown List",
    category: "codebolt/memory/markdown",
    description: "List markdown memory entries",
    icon: "📚",
    color: "#42A5F5"
  };

  constructor() {
    super(BaseMemoryMarkdownListNode.metadata, [360, 200]);
    this.addProperty("filters", "{}", "string");
    this.addInput("filters", "object");
  }
}
