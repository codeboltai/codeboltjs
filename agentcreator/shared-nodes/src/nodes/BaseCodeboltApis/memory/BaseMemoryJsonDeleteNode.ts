import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryJsonDeleteNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/json/delete",
    title: "Memory JSON Delete",
    category: "codebolt/memory/json",
    description: "Delete JSON memory entry by ID",
    icon: "🗑️",
    color: "#FF7043"
  };

  constructor() {
    super(BaseMemoryJsonDeleteNode.metadata, [320, 160]);
    this.addProperty("memoryId", "", "string");
    this.addInput("memoryId", "string");
  }
}
