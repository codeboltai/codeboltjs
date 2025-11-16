import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryTodoUpdateNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/todo/update",
    title: "Memory Todo Update",
    category: "codebolt/memory/todo",
    description: "Update todo item in memory",
    icon: "✏️",
    color: "#66BB6A"
  };

  constructor() {
    super(BaseMemoryTodoUpdateNode.metadata, [390, 230]);
    this.addProperty("memoryId", "", "string");
    this.addProperty("todo", "{}", "string");
    this.addInput("memoryId", "string");
    this.addInput("todo", "object");
  }
}
