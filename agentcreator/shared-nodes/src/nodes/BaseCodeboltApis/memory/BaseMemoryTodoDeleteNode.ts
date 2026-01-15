import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryTodoDeleteNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/todo/delete",
    title: "Memory Todo Delete",
    category: "codebolt/memory/todo",
    description: "Delete todo memory entry",
    icon: "🗑️",
    color: "#66BB6A"
  };

  constructor() {
    super(BaseMemoryTodoDeleteNode.metadata, [320, 160]);
    this.addProperty("memoryId", "", "string");
    this.addInput("memoryId", "string");
  }
}
