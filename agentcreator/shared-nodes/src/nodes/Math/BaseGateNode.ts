import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseGateNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/gate",
    title: "Gate",
    category: "math",
    description: "Pass or block values based on a gate condition",
    icon: "🚪",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGateNode.metadata.title, BaseGateNode.metadata.type);
    this.title = BaseGateNode.metadata.title;
    this.addProperty("open", true);
    this.addInput("in", "number");
    this.addInput("open", "boolean");
    this.addOutput("out", "number");
    this.size = [80, 50];
  }

  // Shared gate logic
  gate(value: any, open?: any): any {
    const isOpen = open !== undefined ? Boolean(open) : this.properties.open !== false;
    return isOpen ? value : null;
  }
}