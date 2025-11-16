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
    super();
    this.title = BaseGateNode.metadata.title;
    this.addProperty("open", true);
    this.addInput("v", "boolean");
    this.addInput("A");
    this.addInput("B");
    this.addOutput("out");
    this.size = [80, 50];
  }

  // Shared gate logic
  gate(value: any, open?: any): any {
    const isOpen = open !== undefined ? Boolean(open) : this.properties.open !== false;
    return isOpen ? value : null;
  }

  // Default implementation
  onExecute() {
    const v = this.getInputData(0);
    this.setOutputData(0, this.gate(this.getInputData(v ? 1 : 2), v));
  }
}