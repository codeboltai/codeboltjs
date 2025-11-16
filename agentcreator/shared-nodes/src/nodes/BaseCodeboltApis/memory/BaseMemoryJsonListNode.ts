import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryJsonListNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/json/list",
    title: "Memory JSON List",
    category: "codebolt/memory/json",
    description: "List JSON memory entries with optional filters",
    icon: "📋",
    color: "#FF7043"
  };

  constructor() {
    super(BaseMemoryJsonListNode.metadata, [360, 200]);
    this.addProperty("filters", "{}", "string");
    this.addInput("filters", "object");
  }
}
