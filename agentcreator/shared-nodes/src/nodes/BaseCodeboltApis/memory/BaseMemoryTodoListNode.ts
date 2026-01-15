import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryTodoListNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/todo/list",
    title: "Memory Todo List",
    category: "codebolt/memory/todo",
    description: "List todo memory entries",
    icon: "📋",
    color: "#66BB6A"
  };

  constructor() {
    super(BaseMemoryTodoListNode.metadata, [360, 200]);
    this.addProperty("filters", "{}", "string");
    this.addInput("filters", "object");
  }
}
