import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryTodoSaveNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/todo/save",
    title: "Memory Todo Save",
    category: "codebolt/memory/todo",
    description: "Save todo data into memory",
    icon: "✅",
    color: "#66BB6A"
  };

  constructor() {
    super(BaseMemoryTodoSaveNode.metadata, [380, 220]);
    this.addProperty("todo", "[]", "string");
    this.addProperty("metadata", "{}", "string");
    this.addInput("todo", "object");
    this.addInput("metadata", "object");
  }
}
